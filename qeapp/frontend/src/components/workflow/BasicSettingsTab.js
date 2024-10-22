import React, { useEffect } from 'react';
import { Row, Col, ToggleButton, ToggleButtonGroup, Form } from 'react-bootstrap';

const BasicSettingsTab = ({ data = {}, onDataChange }) => {
  useEffect(() => {
    const defaultData = {
      relaxType: 'positions',
      electronicType: 'metal',
      spinType: 'none',
      protocol: 'moderate',
      bader: false,
      bands: false,
      pdos: false,
      xas: false,
      xps: false,
    };

    // Merge default data with any existing data
    const initialData = { ...defaultData, ...data };

    // Update data if it doesn't already have all default values
    if (JSON.stringify(data) !== JSON.stringify(initialData)) {
      onDataChange(initialData);
    }
  }, []);
  
  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    onDataChange(newData);
  };

  return (
    <Form>
      <h4>Structure</h4>
      <p>You have three options:
        (1) Structure as is: perform a self-consistent calculation using the structure provided as input.
        (2) Atomic positions: perform a full relaxation of the internal atomic coordinates.
        (3) Full geometry: perform a full relaxation for both the internal atomic coordinates and the cell vectors.
      </p>
      <ToggleButtonGroup 
        type="radio" 
        name="structureOptions" 
        value={data.relaxType || 'none'} 
        onChange={(value) => handleChange('relaxType', value)} 
        className="mb-3"
      >
        <ToggleButton id="structure-as-is" value="none" variant="outline-primary" className="px-3">
          Structure as is
        </ToggleButton>
        <ToggleButton id="atomic-positions" value="positions" variant="outline-primary" className="px-3">
          Atomic positions
        </ToggleButton>
        <ToggleButton id="full-geometry" value="positions_cell" variant="outline-primary" className="px-3">
          Full geometry
        </ToggleButton>
      </ToggleButtonGroup>

      <h5>Electronic Type</h5>
      <ToggleButtonGroup 
        type="radio" 
        name="electronicType" 
        value={data.electronicType || 'metal'} 
        onChange={(value) => handleChange('electronicType', value)} 
        className="mb-3"
      >
        <ToggleButton id="metal" value="metal" variant="outline-primary" className="px-3">
          Metal
        </ToggleButton>
        <ToggleButton id="insulator" value="insulator" variant="outline-primary" className="px-3">
          Insulator
        </ToggleButton>
      </ToggleButtonGroup>

      <h5>Magnetism</h5>
      <ToggleButtonGroup 
        type="radio" 
        name="spinType" 
        value={data.spinType || 'none'} 
        onChange={(value) => handleChange('spinType', value)} 
        className="mb-3"
      >
        <ToggleButton id="spinType-off" value="none" variant="outline-secondary" className="px-4">
          Off
        </ToggleButton>
        <ToggleButton id="spinType-on" value="collinear" variant="outline-secondary" className="px-4">
          On
        </ToggleButton>
      </ToggleButtonGroup>

      <h4>Properties</h4>
      <p className="text-muted">Select which properties to calculate:</p>
      <Form.Group className="mb-3">
        <Form.Check 
          type="checkbox" 
          label="Bader charge analysis" 
          checked={data.bader || false} 
          onChange={(e) => handleChange('bader', e.target.checked)} 
        />
        <Form.Check 
          type="checkbox" 
          label="Electronic band structure" 
          checked={data.bands || false} 
          onChange={(e) => handleChange('bands', e.target.checked)} 
        />
        <Form.Check 
          type="checkbox" 
          label="Projected Density of States (PDOS)" 
          checked={data.pdos || false} 
          onChange={(e) => handleChange('pdos', e.target.checked)} 
        />
        <Form.Check 
          type="checkbox" 
          label="X-ray absorption spectroscopy (XAS)" 
          checked={data.xas || false} 
          onChange={(e) => handleChange('xas', e.target.checked)} 
        />
        <Form.Check 
          type="checkbox" 
          label="X-ray photoelectron spectroscopy (XPS)" 
          checked={data.xps || false} 
          onChange={(e) => handleChange('xps', e.target.checked)} 
        />
      </Form.Group>

      <h4>Protocol</h4>
      <p className="text-muted">Select the protocol based on the trade-off between accuracy and speed.</p>
      <ToggleButtonGroup 
        type="radio" 
        name="protocol" 
        value={data.protocol || 'moderate'} 
        onChange={(value) => handleChange('protocol', value)} 
        className="mb-3 w-100"
      >
        <ToggleButton id="protocol-fast" value="fast" variant="outline-success" className="w-100">
          Fast
        </ToggleButton>
        <ToggleButton id="protocol-moderate" value="moderate" variant="outline-warning" className="w-100">
          Moderate
        </ToggleButton>
        <ToggleButton id="protocol-precise" value="precise" variant="outline-danger" className="w-100">
          Precise
        </ToggleButton>
      </ToggleButtonGroup>

      <p className="text-muted">The "moderate" protocol represents a trade-off between accuracy and speed. Choose the "fast" protocol for a faster calculation with less precision and the "precise" protocol to aim at best accuracy (at the price of longer/costlier calculations).</p>
    </Form>
  );
};

export default BasicSettingsTab;
