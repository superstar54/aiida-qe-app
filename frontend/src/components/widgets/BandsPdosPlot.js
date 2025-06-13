import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Form } from 'react-bootstrap';

const angularMomentumLabels = ['s', 'p', 'd', 'f'];
// Define a color palette for PDOS traces
const colorPalette = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
  '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#1f77b4', '#ffbb78',
];

const BandsPdosPlot = ({ bands_data, pdos_data }) => {
  const [groupTag, setGroupTag] = useState('kinds');
  const [plotTag, setPlotTag] = useState('total');
  const [selectedAtoms, setSelectedAtoms] = useState('');
  const [bandsWidth, setBandsWidth] = useState(0.5);
  const [projectBands, setProjectBands] = useState(false);
  const [plotData, setPlotData] = useState([]); // Data to be plotted
  const [plotLayout, setPlotLayout] = useState({}); // Layout for the plot

  useEffect(() => {
    processPlotData();
  }, [bands_data, pdos_data, groupTag, plotTag, selectedAtoms, bandsWidth, projectBands]);

  // Function to get Fermi energy from data
  const getFermiEnergy = () => {
    const fermiData = {};
    if (pdos_data) {
      if ('fermi_energy_up' in pdos_data) {
        fermiData.fermi_energy_up = pdos_data.fermi_energy_up;
        fermiData.fermi_energy_down = pdos_data.fermi_energy_down;
      } else {
        fermiData.fermi_energy_up = pdos_data.fermi_energy;
        fermiData.fermi_energy_down = pdos_data.fermi_energy;
      }
    } else if (bands_data) {
      if ('fermi_energy_up' in bands_data) {
        fermiData.fermi_energy_up = bands_data.fermi_energy_up;
        fermiData.fermi_energy_down = bands_data.fermi_energy_down;
      } else {
        fermiData.fermi_energy_up = bands_data.fermi_energy;
        fermiData.fermi_energy_down = bands_data.fermi_energy;
      }
    }
    return fermiData;
  };

  // Event handlers for form inputs
  const handleInputChange = (setter) => (e) => setter(e.target.value);
  const handleCheckboxChange = (setter) => (e) => setter(e.target.checked);

  // Function to process data based on user options
  const processPlotData = () => {
    if (!bands_data && !pdos_data) {
      setPlotData([]);
      setPlotLayout({});
      return;
    }

    const { fermi_energy_up, fermi_energy_down } = getFermiEnergy();
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
      const filteredPdos = filterPdosData(pdos_data, groupTag, plotTag, selectedAtoms);

      // Prepare PDOS traces
      filteredPdos.forEach((dosItem, index) => {
        const isSpinDown = dosItem.spin === -1;
        const signMultiplier = isSpinDown ? -1 : 1;

        const xData = hasCombinedPlot ? dosItem.y.map((y) => y * signMultiplier) : dosItem.x.map((x) => x);
        const yData = hasCombinedPlot ? dosItem.x.map((x) => x) : dosItem.y.map((y) => y * signMultiplier);

        plotData.push({
          x: xData,
          y: yData,
          type: 'scatter',
          mode: 'lines',
          name: dosItem.label,
          line: {
            color: dosItem.color || 'blue',
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
    console.log("hasBandsData: ", hasBandsData);
    plotData.push({
      x: hasBandsData
          ? [Math.min(...plotData.map((d) => Math.min(...d.x))), Math.max(...plotData.map((d) => Math.max(...d.x)))]
          : (plotLayout.xaxis && plotLayout.xaxis.range
              ? [plotLayout.xaxis.range[0], plotLayout.xaxis.range[1]]
              : [-1, 1]), // Fallback range when xaxis range is unavailable
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

  // Function to prepare combined plotly traces
  const prepareCombinedPlotlyTraces = (x_to_conc, y_to_conc) => {
    const numBands = y_to_conc.length;
    const numKpoints = x_to_conc.length;

    const xCombined = [];
    const yCombined = [];

    for (let i = 0; i < numBands; i++) {
      const xBand = x_to_conc;
      const yBand = y_to_conc[i];

      xCombined.push(...xBand);
      yCombined.push(...yBand);

      // Add NaN separator
      xCombined.push(NaN);
      yCombined.push(NaN);
    }

    return { xCombined, yCombined };
  };

  // Helper function to filter and group PDOS data based on user selections
  const filterPdosData = (pdosData, groupTag, plotTag, selectedAtoms) => {
    // Parse selectedAtoms into an array of positions if specified
    const selectedAtomPositions = selectedAtoms.trim() ? selectedAtoms.trim().split(/\s+/) : [];

    // Prepare an object to hold grouped PDOS data
    const groupedPdos = {};

    // Iterate over pdosData.projections and filter/group according to the options
    let index = 0;
    pdosData.projections.forEach((dosItem) => {
      const orbital = dosItem.orbital;
      const kindName = orbital.kind_name;
      const angularMomentum = orbital.angular_momentum;
      const magneticNumber = orbital.magnetic_number;
      const spin = orbital.spin; // Assuming spin=1 (up) or -1 (down)
      const spinLabel = spin === 1 ? ' (↑)' : spin === -1 ? ' (↓)' : '';

      // Format position for atom identifier with two decimal precision
      const positionStr = orbital.position.map((coord) => coord.toFixed(2)).join(',');

      // Determine if this PDOS contribution should be included based on selectedAtoms
      if (selectedAtomPositions.length > 0 && positionStr !== null) {
          if (!selectedAtomPositions.includes(positionStr)) {
              return; // Skip this PDOS contribution
          }
      }

      // Grouping logic based on groupTag and plotTag
      let groupingKey = '';
      if (groupTag === 'atoms') {
        if (plotTag === 'total') {
            // Group by atom kind and position for total PDOS
            groupingKey = `${kindName}-[${positionStr}]`;
        } else if (plotTag === 'orbital') {
            // Group by atom kind, position, and orbital name
            const orbitalLabel = getOrbitalLabel(angularMomentum, magneticNumber);
            groupingKey = `${kindName}-[${positionStr}]-${orbitalLabel}`;
        } else if (plotTag === 'angular_momentum') {
            // Group by atom kind, position, and angular momentum
            groupingKey = `${kindName}-[${positionStr}]-${angularMomentumLabels[angularMomentum]}`;
        }
      } else if (groupTag === 'kinds') {
        if (plotTag === 'total') {
            // Group by atom kind only
            groupingKey = kindName;
        } else if (plotTag === 'orbital') {
            // Group by atom kind and orbital name
            const orbitalLabel = getOrbitalLabel(angularMomentum, magneticNumber);
            groupingKey = `${kindName}-${orbitalLabel}`;
        } else if (plotTag === 'angular_momentum') {
            // Group by atom kind and angular momentum
            groupingKey = `${kindName}-${angularMomentumLabels[angularMomentum]}`;
        }
      }

      // Create a unique key combining grouping key and spin
      const uniqueKey = groupingKey + spinLabel;

      // Initialize or update the grouped PDOS entry
      if (!groupedPdos[uniqueKey]) {
          const color = colorPalette[index % colorPalette.length]; // Cycle through the color palette
          groupedPdos[uniqueKey] = {
              label: uniqueKey,
              x: dosItem.energy.map((e) => e - pdosData.fermi_energy), // Shift by Fermi energy
              y: dosItem.pdos.slice(), // Copy the array
              spin: spin,
              color: color, // Assign color here
          };
          index += 1;
      } else {
          // Sum the y-values if grouping multiple entries
          groupedPdos[uniqueKey].y = groupedPdos[uniqueKey].y.map((y, i) => y + dosItem.pdos[i]);
      }
    });

    // Convert groupedPdos object to an array
    return Object.values(groupedPdos);
  };

  // Helper function to get orbital label from angular momentum and magnetic number
  const getOrbitalLabel = (l, m) => {
    const orbitalLabels = {
        0: 's',
        1: ['Px', 'Py', 'Pz'],
        2: ['Dxy', 'Dyz', 'Dz2', 'Dxz', 'Dx2-y2'],
        3: ['Fx3', 'Fxyz', 'Fy3z2', 'Fz3', 'Fx3z', 'Fy3x2', 'Fz3y2']
    };
    return orbitalLabels[l]?.[m] || `l=${l}, m=${m}`;
  };

  // Helper function to transpose a 2D array
  const transpose2DArray = (array) => array[0].map((_, colIndex) => array.map(row => row[colIndex]));

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

        {bands_data && bands_data.projected_bands && (
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

      {(!bands_data && !pdos_data) && <div>No data available for plotting.</div>}

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

export default BandsPdosPlot;
