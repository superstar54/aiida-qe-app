import React, { useState, useEffect, useContext } from 'react';
import { Form, Row, Col, Card, Alert, Spinner, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Plot from 'react-plotly.js';
import { WizardContext } from '../../wizard/WizardContext';

const ResultTab = ({}) => {
  const { steps } = useContext(WizardContext);
  const JobId = steps[3]?.data?.['Label and Submit']?.jobId || null;
  const jobStatus = steps[4]?.data?.['Job status']?.jobStatus || null;

  const [selectedSpectrum, setSelectedSpectrum] = useState(null);
  const [lorentzian, setLorentzian] = useState(0.1);
  const [gaussian, setGaussian] = useState(0.1);
  const [rawXpsData, setRawXpsData] = useState(null); // Store raw fetched data
  const [xpsData, setXpsData] = useState(null); // Store processed data
  const [spectraOptions, setSpectraOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [shiftType, setShiftType] = useState('chemicalShift');  // New state for toggle button
  const [info, setInfo] = useState(null); // New state for informational messages

  // useEffect for fetching data when JobId changes
  useEffect(() => {
    const fetchXpsData = async () => {
      if (!JobId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching XPS data for Job ID:', JobId);
        const response = await fetch(`http://localhost:8000/api/jobs-data/${JobId}`);
        if (!response.ok) {
          console.error('Fetch error:', response);
          throw new Error('Failed to fetch XPS data');
        }
        const data = await response.json();
        console.log('Fetched XPS data:', data.xps);

        if (!data.xps) {
          // Structure data is null or undefined
          setInfo('XPS data is not available.');
        }

        setRawXpsData(data.xps);

        // Extract spectrum options from the first XPS data set
        const spectrumKeys = Object.keys(data.xps[0] || {});
        console.log('Spectrum keys:', spectrumKeys);
        setSpectraOptions(spectrumKeys);

        // Set default selected spectrum
        if (spectrumKeys.length > 0) {
          setSelectedSpectrum(spectrumKeys[0]);
        }
        setError(null);
        setInfo(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching XPS data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchXpsData();
  }, [JobId, jobStatus]); // Depend only on JobId

  // useEffect for processing data when rawXpsData or processing parameters change
  useEffect(() => {
    if (!rawXpsData) return;

    try {
      console.log('Processing XPS data with shiftType:', shiftType, 'lorentzian:', lorentzian, 'gaussian:', gaussian);
      // Choose the correct data based on the toggle value (shiftType)
      const xpsDataType = shiftType === 'chemicalShift' ? rawXpsData[0] : rawXpsData[1];
      
      // Assuming xpsSpectraBroadening is a synchronous function
      const xps_data = xpsSpectraBroadening(xpsDataType, rawXpsData[2], lorentzian, gaussian);
      setXpsData(xps_data);
    } catch (err) {
      console.error('Error processing XPS data:', err);
      setError('Failed to process XPS data');
    }
  }, [rawXpsData, shiftType, lorentzian, gaussian]); // Depend on processing parameters

  const handleFileUpload = (event) => {
    const file = event.target.files[0];  // The uploaded file
    setUploadedFile(file);  // Store the file in the state
  };

  const handleSpectrumChange = (e) => {
    setSelectedSpectrum(e.target.value);
  };

  const handleShiftTypeChange = (value) => {
    setShiftType(value);  // Update shift type (chemical shift or binding energy)
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (info) {
    return <Alert variant="info">{info}</Alert>;
  }


  if (error) {
    return <div>Error: {error}</div>;
  }

  // Check if plotData is valid
  const plotData = xpsData && selectedSpectrum && xpsData[selectedSpectrum]?.total ? [
    {
      x: xpsData[selectedSpectrum].total[0],  // X values (energy range)
      y: xpsData[selectedSpectrum].total[1],  // Y values (intensity)
      type: 'scatter',
      mode: 'lines',
      marker: { color: 'blue' },
      name: selectedSpectrum
    },
  ] : [];

  const plotLayout = {
    title: 'XPS Spectrum',
    xaxis: { title: 'Binding Energy (eV)' },
    yaxis: { title: 'Intensity (a.u.)' },
    showlegend: true,
  };

  return (
    <div>
      <h4 className="mb-4">XPS Results</h4>
      
      {/* Toggle between chemical shift and binding energy */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group controlId="shiftTypeToggle">
            <Form.Label className="mb-2">Plot Type</Form.Label> {/* Added margin-bottom */}
            <ToggleButtonGroup
              type="radio"
              name="shiftType"
              value={shiftType}
              onChange={handleShiftTypeChange}
            >
              <ToggleButton id="chemicalShift" value="chemicalShift" variant="outline-primary">
                Chemical Shift
              </ToggleButton>
              <ToggleButton id="bindingEnergy" value="bindingEnergy" variant="outline-primary">
                Binding Energy
              </ToggleButton>
            </ToggleButtonGroup>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group controlId="spectrumSelect">
            <Form.Label>Select spectrum to plot</Form.Label>
            <Form.Control as="select" value={selectedSpectrum} onChange={handleSpectrumChange}>
              {spectraOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Label>Lorentzian Profile (γ)</Form.Label>
          <Form.Control
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={lorentzian}
            onChange={(e) => setLorentzian(parseFloat(e.target.value))}
          />
          <p>{lorentzian}</p>
        </Col>
        <Col md={6}>
          <Form.Label>Gaussian Profile (σ)</Form.Label>
          <Form.Control
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={gaussian}
            onChange={(e) => setGaussian(parseFloat(e.target.value))}
          />
          <p>{gaussian}</p>
        </Col>
      </Row>

      {/* XPS Plot */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>XPS Plot</Card.Title>
              {/* Only render plot when plotData has valid x and y values */}
              {plotData.length > 0 && plotData[0].x?.length > 0 && plotData[0].y?.length > 0 ? (
                <Plot
                  data={plotData}
                  layout={plotLayout}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '400px' }}
                />
              ) : (
                <p>No valid XPS data available for plotting</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Experimental Data Upload */}
      <Row className="mt-4">
        <Col>
          <Form.Group controlId="fileUpload">
            <Form.Label>Upload Experimental Data (CSV format)</Form.Label>
            <Form.Control 
              type="file"
              label={uploadedFile ? uploadedFile.name : 'Choose File'}
              onChange={handleFileUpload}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default ResultTab;



// Gaussian and Lorentzian functions
function gaussian(x, sigma) {
  return Math.exp(-Math.pow(x, 2) / (2 * Math.pow(sigma, 2))) / (sigma * Math.sqrt(2 * Math.PI));
}

function lorentzian(x, gamma) {
  return gamma / (Math.PI * (Math.pow(x, 2) + Math.pow(gamma, 2)));
}

// Voigt function (combination of Gaussian and Lorentzian)
function voigt(x, sigma, gamma) {
  return 0.5 * (gaussian(x, sigma) + lorentzian(x, gamma));
}

// Example usage of Voigt function
function xpsSpectraBroadening(points, equivalentSitesData, gamma = 0.3, sigma = 0.3, label = "", intensity = 1.0) {
  const resultSpectra = {};
  
  const fwhmVoigt = gamma / 2 + Math.sqrt(Math.pow(gamma, 2) / 4 + Math.pow(sigma, 2));

  for (const element in points) {
    resultSpectra[element] = {};
    const finalSpectraYArrays = [];
    const totalMultiplicity = calculateTotalMultiplicity(points, element, equivalentSitesData);


    const maxCoreLevelShift = Math.max(...Object.values(points[element]));
    const minCoreLevelShift = Math.min(...Object.values(points[element]));

    // Energy range for the broadening function
    const xEnergyRange = Array.from({ length: 500 }, (_, i) => 
      minCoreLevelShift - fwhmVoigt - 1.5 + i * (maxCoreLevelShift - minCoreLevelShift + fwhmVoigt + 3) / 500);

    for (const site in points[element]) {
      // Weight for the spectra of every atom
      const siteMultiplicity = equivalentSitesData[site].multiplicity;
      const relativeCoreLevelPosition = points[element][site];

      const y = xEnergyRange.map(x => (
        siteMultiplicity * intensity * voigt(x - relativeCoreLevelPosition, sigma, gamma) / totalMultiplicity
      ));

      resultSpectra[element][site] = [xEnergyRange, y];
      finalSpectraYArrays.push(y);
    }

    // Sum all y arrays to get the total spectrum for this element
    const total = finalSpectraYArrays.reduce((acc, curr) => acc.map((val, idx) => val + curr[idx]), new Array(500).fill(0));

    resultSpectra[element]["total"] = [xEnergyRange, total];
    console.log("resultSpectra", resultSpectra);
  }

  return resultSpectra;
}


function calculateTotalMultiplicity(points, element, equivalentSitesData) {
    let totalMultiplicity = 0;
  
    const elementPoints = Object.keys(points[element]);
  
    for (let i = 0; i < elementPoints.length; i++) {
      const site = elementPoints[i];
      const multiplicity = equivalentSitesData[site].multiplicity;
      totalMultiplicity += multiplicity;
    }
  
    return totalMultiplicity;
  }