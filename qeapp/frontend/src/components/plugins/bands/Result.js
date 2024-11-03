import React, { useState, useEffect, useContext } from 'react';
import Plot from 'react-plotly.js';
import { Form, Spinner, Alert } from 'react-bootstrap';
import { WizardContext } from '../../wizard/WizardContext';

const BandPdosPlot = () => {
  const { steps } = useContext(WizardContext);
  const jobId = steps[3]?.data?.['Label and Submit']?.jobId || null;
  const jobStatus = steps[4]?.data?.['Job Status']?.jobStatus || null;

  const [groupTag, setGroupTag] = useState('kinds');
  const [plotTag, setPlotTag] = useState('total');
  const [selectedAtoms, setSelectedAtoms] = useState('');
  const [bandsWidth, setBandsWidth] = useState(0.5);
  const [projectBands, setProjectBands] = useState(false);
  const [rawData, setRawData] = useState(null); // Store raw data fetched from API
  const [plotData, setPlotData] = useState([]); // Data to be plotted
  const [plotLayout, setPlotLayout] = useState({}); // Layout for the plot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all data once when the component mounts or jobId changes
  useEffect(() => {
    if (jobId && jobStatus === 'finished') {
      fetchData();
    }
  }, [jobId, jobStatus]);

  // Re-process data when user options change
  useEffect(() => {
    if (rawData) {
      processPlotData();
    }
  }, [rawData, groupTag, plotTag, selectedAtoms, bandsWidth, projectBands]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bands/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setRawData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Event handlers for form inputs
  const handleInputChange = (setter) => (e) => setter(e.target.value);
  const handleCheckboxChange = (setter) => (e) => setter(e.target.checked);

  // Function to get Fermi energy from data
  const getFermiEnergy = (data) => {
    if (data.pdos_data) {
      return {
        fermi_energy_up: data.pdos_data.fermi_energy_up || data.pdos_data.fermi_energy,
        fermi_energy_down: data.pdos_data.fermi_energy_down || data.pdos_data.fermi_energy,
      };
    }
    return {
      fermi_energy_up: data.bands_data.fermi_energy_up || data.bands_data.fermi_energy,
      fermi_energy_down: data.bands_data.fermi_energy_down || data.bands_data.fermi_energy,
    };
  };

  // Function to process data based on user options
  const processPlotData = () => {
    const { bands_data, pdos_data } = rawData;
    const { fermi_energy_up, fermi_energy_down } = getFermiEnergy(rawData);
    const fermiEnergy = fermi_energy_up; // Use the up Fermi energy as the primary one


    const plotData = [];
    const plotLayout = {
      showlegend: true,
      plot_bgcolor: 'white',
    };

    const hasBandsData = bands_data != null;
    const hasPdosData = pdos_data != null;

    const hasCombinedPlot = hasBandsData && hasPdosData;

    // Process bands data
    if (hasBandsData) {

      const xBands = bands_data.x; // Array of k-points
      const yBands = bands_data.y; // Array of arrays: yBands[k_point_index][band_index]
      const bandTypeIdx = bands_data.band_type_idx || Array(yBands[0].length).fill(0); // Spin indices
      const spinPolarized = bandTypeIdx.includes(1);

      // Transpose yBands to get yBandsTransposed[band_index][k_point_index]
      const yBandsTransposed = transpose2DArray(yBands); // [N_bands][N_kpoints]

      // Define colors
      const colors = {
        0: spinPolarized ? 'rgba(205, 0, 0, 0.4)' : '#111111', // Spin up or non-spin-polarized
        1: 'rgba(72,118,255, 0.4)', // Spin down
      };

      for (let spin of [0, 1]) {
        if (!bandTypeIdx.includes(spin)) {
          continue;
        }

        // Select indices of bands with this spin
        const spinBandIndices = bandTypeIdx.reduce((arr, val, idx) => {
          if (val === spin) arr.push(idx);
          return arr;
        }, []);

        // Get yBands for this spin
        const yBandsSpin = spinBandIndices.map(idx => yBandsTransposed[idx]); // Each yBandsSpin[i] is an array of energies over k-points

        // Prepare combined x and y arrays
        const { xCombined, yCombined } = prepareCombinedPlotlyTraces(xBands, yBandsSpin);

        const fermiEnergySpin = spin === 0 ? fermi_energy_up : fermi_energy_down;
        const yCombinedShifted = yCombined.map(y => y - fermiEnergySpin);

        // Add trace
        plotData.push({
          x: xCombined,
          y: yCombinedShifted,
          type: 'scattergl', // Use scattergl for performance with large datasets
          mode: 'lines',
          name: spinPolarized ? (spin === 0 ? 'Spin Up Bands' : 'Spin Down Bands') : 'Bands',
          line: {
            color: colors[spin],
          },
          xaxis: hasCombinedPlot ? 'x' : 'xaxis',
          yaxis: 'y',
          showlegend: false,
        });
      }

      // Add vertical lines at high symmetry points
      if (bands_data.pathlabels) {
        const [pathLabels, pathValues] = bands_data.pathlabels;
        plotLayout.xaxis = {
          tickvals: pathValues,
          ticktext: pathLabels,
          domain: hasCombinedPlot ? [0, 0.7] : undefined,
          title: 'k-points',
          anchor: 'y',
          linecolor: 'black',
          mirror: true,
        };

        // Determine y-range
        const allYValues = yBandsTransposed.flat().map(y => y - fermiEnergy);
        const yMin = Math.min(...allYValues);
        const yMax = Math.max(...allYValues);

        // Add vertical lines
        pathValues.forEach((xValue) => {
          plotData.push({
            x: [xValue, xValue],
            y: [yMin, yMax],
            type: 'scatter',
            mode: 'lines',
            line: {
              color: 'grey',
              dash: 'dash',
            },
            hoverinfo: 'skip',
            xaxis: hasCombinedPlot ? 'x' : 'xaxis',
            yaxis: 'y',
            showlegend: false,
          });
        });
      }

      // Set y-axis title
      plotLayout.yaxis = {
        title: 'Energy (eV)',
        linecolor: 'black',
        mirror: true,
      };
    }

    // Process PDOS data
    if (hasPdosData) {
      const fermiEnergy = pdos_data.fermi_energy || pdos_data.fermi_energy_up || 0;

      // Filter and group PDOS data according to user options
      const filteredPdos = filterPdosData(pdos_data, groupTag, plotTag, selectedAtoms);

      // Prepare PDOS traces
      filteredPdos.forEach((dosItem) => {
        const isSpinDown = dosItem.label.endsWith('(↓)');
        const signMultiplier = isSpinDown ? -1 : 1;

        const xData = hasCombinedPlot ? dosItem.y.map((y) => y * signMultiplier) : dosItem.x.map((x) => x - fermiEnergy);
        const yData = hasCombinedPlot ? dosItem.x.map((x) => x - fermiEnergy) : dosItem.y.map((y) => y * signMultiplier);

        plotData.push({
          x: xData,
          y: yData,
          type: 'scatter',
          mode: 'lines',
          name: dosItem.label,
          line: {
            color: dosItem.borderColor || 'blue',
            dash: dosItem.lineStyle || 'solid',
          },
          fill: 'tozerox',
          xaxis: hasCombinedPlot ? 'x2' : 'xaxis',
          yaxis: 'y',
        });
      });

      // Adjust axes for PDOS
      if (hasCombinedPlot) {
        plotLayout.xaxis2 = {
          domain: [0.72, 1.0],
          title: 'Density of States',
          anchor: 'y',
          linecolor: 'black',
          mirror: true,
        };
      } else {
        plotLayout.xaxis = {
          title: 'Energy (eV)',
          anchor: 'y',
          linecolor: 'black',
          mirror: true,
        };
        plotLayout.yaxis = {
          title: 'Density of States',
          linecolor: 'black',
          mirror: true,
        };
      }
    }

    // Set y-axis title if not already set
    if (!plotLayout.yaxis) {
      plotLayout.yaxis = {
        title: 'Energy (eV)',
        linecolor: 'black',
        mirror: true,
      };
    }

    // Add horizontal line at y=0 (Fermi level)
    plotData.push({
      x: hasBandsData ? [Math.min(...plotData.map((d) => Math.min(...d.x))), Math.max(...plotData.map((d) => Math.max(...d.x)))] : [plotLayout.xaxis.range[0], plotLayout.xaxis.range[1]],
      y: [0, 0],
      type: 'scatter',
      mode: 'lines',
      line: {
        color: 'red',
        dash: 'dot',
      },
      hoverinfo: 'skip',
      xaxis: 'x',
      yaxis: 'y',
      showlegend: false,
    });

    setPlotData(plotData);
    setPlotLayout(plotLayout);
  };

  // Function to prepare combined plotly traces (similar to _prepare_combined_plotly_traces in Python)
  const prepareCombinedPlotlyTraces = (x_to_conc, y_to_conc) => {
    // x_to_conc: array of length N_kpoints
    // y_to_conc: array of arrays, each of length N_kpoints (number of bands x number of kpoints)
    // Return xCombined and yCombined, 1D arrays suitable for plotting all bands in a single trace

    const numBands = y_to_conc.length;
    const numKpoints = x_to_conc.length;

    const xCombined = [];
    const yCombined = [];

    for (let i = 0; i < numBands; i++) {
      const xBand = x_to_conc; // x is same for all bands
      const yBand = y_to_conc[i];

      xCombined.push(...xBand);
      yCombined.push(...yBand);

      // Add NaN separator
      xCombined.push(NaN);
      yCombined.push(NaN);
    }

    return { xCombined, yCombined };
  };

  // Function to filter and group PDOS data based on user selections
  const filterPdosData = (pdosData, groupTag, plotTag, selectedAtoms) => {
    // Parse selectedAtoms into an array of indices
    const selectedAtomIndices = parseSelectedAtoms(selectedAtoms);

    // Prepare an object to hold grouped PDOS data
    const groupedPdos = {};

    // Iterate over pdosData.dos and filter/group according to the options
    pdosData.projections.pdos.forEach((dosItem) => {
      // Skip total DOS entries if plotTag is not 'total'
      if (plotTag !== 'total' && dosItem.orbital.label.startsWith('Total DOS')) {
        return;
      }

      // Extract information from the label
      const labelInfo = parseDosLabel(dosItem.orbital.kind_name);

      // Determine if this PDOS contribution should be included based on selectedAtoms
      if (selectedAtomIndices.length > 0 && labelInfo.atomIndex !== null) {
        if (!selectedAtomIndices.includes(labelInfo.atomIndex)) {
          return; // Skip this PDOS contribution
        }
      }

      // Grouping logic based on groupTag and plotTag
      const groupingKey = getGroupingKey(labelInfo, groupTag, plotTag);

      // Create a unique key combining grouping key and spin
      const uniqueKey = groupingKey + labelInfo.spinLabel;

      // Initialize or update the grouped PDOS entry
      if (!groupedPdos[uniqueKey]) {
        groupedPdos[uniqueKey] = {
          label: uniqueKey,
          x: dosItem.energy,
          y: dosItem.pdos.slice(), // Copy the array
          borderColor: dosItem.borderColor,
          lineStyle: dosItem.lineStyle,
        };
      } else {
        // Sum the y-values if grouping multiple entries
        groupedPdos[uniqueKey].y = groupedPdos[uniqueKey].y.map((y, i) => y + dosItem.pdos[i]);
      }
    });

    // Convert groupedPdos object to an array
    return Object.values(groupedPdos);
  };

  // Helper function to parse selectedAtoms string into an array of indices
  const parseSelectedAtoms = (selectedAtoms) => {
    const indices = [];
    if (!selectedAtoms.trim()) {
      return indices; // Empty list means select all
    }
    const parts = selectedAtoms.trim().split(/\s+/);
    parts.forEach((part) => {
      if (part.includes('..')) {
        const [start, end] = part.split('..').map(Number);
        for (let i = start; i <= end; i++) {
          indices.push(i - 1); // Adjust to zero-based index
        }
      } else {
        indices.push(Number(part) - 1); // Adjust to zero-based index
      }
    });
    return indices;
  };

  // Helper function to parse PDOS label into components
  const parseDosLabel = (label) => {
    const result = {
      kind: null,
      atomIndex: null,
      orbital: null,
      angularMomentum: null,
      spin: null,
      spinLabel: '',
    };

    // Determine spin from label
    if (label.endsWith('(↑)')) {
      result.spin = 'up';
      result.spinLabel = ' (↑)';
      label = label.slice(0, -3).trim();
    } else if (label.endsWith('(↓)')) {
      result.spin = 'down';
      result.spinLabel = ' (↓)';
      label = label.slice(0, -3).trim();
    }

    // For 'Total DOS', return early
    if (label === 'Total DOS') {
      return result;
    }

    // Split label into parts
    const parts = label.split('-');
    if (parts.length >= 2) {
      result.kind = parts[0];
      const orbitalInfo = parts[1];

      // Try to extract atom index from kind (e.g., 'Fe1')
      const match = result.kind.match(/([A-Za-z]+)(\d+)/);
      if (match) {
        result.kind = match[1];
        result.atomIndex = parseInt(match[2], 10) - 1; // Adjust to zero-based index
      }

      // Extract orbital or angular momentum
      if (orbitalInfo.includes('<br>')) {
        const [orbital, position] = orbitalInfo.split('<br>');
        result.orbital = orbital;
      } else {
        result.orbital = orbitalInfo;
      }
    } else if (parts.length === 1) {
      result.kind = parts[0];
    }

    return result;
  };

  // Helper function to get grouping key based on groupTag and plotTag
  const getGroupingKey = (labelInfo, groupTag, plotTag) => {
    let key = '';
    if (groupTag === 'atoms') {
      if (plotTag === 'total') {
        key = `${labelInfo.kind}${labelInfo.atomIndex + 1}`; // Convert to 1-based index
      } else if (plotTag === 'orbital') {
        key = `${labelInfo.kind}${labelInfo.atomIndex + 1}-${labelInfo.orbital}`;
      } else if (plotTag === 'angular_momentum') {
        key = `${labelInfo.kind}${labelInfo.atomIndex + 1}-l=${getAngularMomentum(labelInfo.orbital)}`;
      }
    } else if (groupTag === 'kinds') {
      if (plotTag === 'total') {
        key = labelInfo.kind;
      } else if (plotTag === 'orbital') {
        key = `${labelInfo.kind}-${labelInfo.orbital}`;
      } else if (plotTag === 'angular_momentum') {
        key = `${labelInfo.kind}-l=${getAngularMomentum(labelInfo.orbital)}`;
      }
    }
    return key;
  };

  // Helper function to get angular momentum value from orbital label
  const getAngularMomentum = (orbital) => {
    const orbitalMap = {
      s: 0,
      p: 1,
      d: 2,
      f: 3,
    };
    // Extract the first character of the orbital label
    const orbChar = orbital ? orbital[0] : '';
    return orbitalMap[orbChar] !== undefined ? orbitalMap[orbChar] : '';
  };

  return (
    <div>
      <Form>
        <Form.Group controlId="groupTag">
          <Form.Label>Group By</Form.Label>
          <Form.Control as="select" value={groupTag} onChange={handleInputChange(setGroupTag)}>
            <option value="kinds">Kinds</option>
            <option value="atoms">Atoms</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="plotTag">
          <Form.Label>Plot Contributions</Form.Label>
          <Form.Control as="select" value={plotTag} onChange={handleInputChange(setPlotTag)}>
            <option value="total">Total</option>
            <option value="orbital">Orbital</option>
            <option value="angular_momentum">Angular Momentum</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="selectedAtoms">
          <Form.Label>Selected Atoms</Form.Label>
          <Form.Control type="text" value={selectedAtoms} onChange={handleInputChange(setSelectedAtoms)} placeholder="e.g., 1..5 8 10" />
        </Form.Group>
        {rawData && rawData.bands_data && rawData.bands_data.projected_bands && (
          <>
            <Form.Group controlId="projectBands">
              <Form.Check
                type="checkbox"
                label="Add 'fat bands' projections"
                checked={projectBands}
                onChange={handleCheckboxChange(setProjectBands)}
              />
            </Form.Group>
            {projectBands && (
              <Form.Group controlId="bandsWidth">
                <Form.Label>Bands Width</Form.Label>
                <Form.Control
                  type="number"
                  value={bandsWidth}
                  step="0.01"
                  min="0.01"
                  max="2.0"
                  onChange={handleInputChange(setBandsWidth)}
                />
              </Form.Group>
            )}
          </>
        )}
      </Form>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {(!rawData || plotData.length === 0) && !loading && !error && <Alert variant="info">No data available for plotting.</Alert>}

      {plotData.length > 0 && (
        <Plot
          data={plotData}
          layout={plotLayout}
          config={{ responsive: true }}
          style={{ width: '100%', height: '600px' }}
          useResizeHandler={true}
        />
      )}
    </div>
  );
};

const transpose2DArray = (array) => array[0].map((_, colIndex) => array.map(row => row[colIndex]));


export default BandPdosPlot;
