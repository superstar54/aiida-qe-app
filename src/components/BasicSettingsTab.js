import React, { useState } from 'react';
import { Row, Col, ToggleButton, ToggleButtonGroup, Form, Button } from 'react-bootstrap';

const BasicSettingsTab = () => {
  const [structureType, setStructureType] = useState('structure');
  const [electronicType, setElectronicType] = useState('metal');
  const [magnetism, setMagnetism] = useState('off');
  const [protocol, setProtocol] = useState('moderate');

  return (
    <Form>
      <h4>Structure</h4>
      <p>You have three options:
(1) Structure as is: perform a self consistent calculation using the structure provided as input.
(2) Atomic positions: perform a full relaxation of the internal atomic coordinates.
(3) Full geometry: perform a full relaxation for both the internal atomic coordinates and the cell vectors.</p>
      <ToggleButtonGroup 
        type="radio" 
        name="structureOptions" 
        value={structureType} 
        onChange={setStructureType} 
        className="mb-3"
      >
        <ToggleButton 
          id="structure-as-is" 
          value="structure" 
          variant="outline-primary" 
          className="px-3"
        >
          Structure as is
        </ToggleButton>
        <ToggleButton 
          id="atomic-positions" 
          value="atomic" 
          variant="outline-primary" 
          className="px-3"
        >
          Atomic positions
        </ToggleButton>
        <ToggleButton 
          id="full-geometry" 
          value="geometry" 
          variant="outline-primary" 
          className="px-3"
        >
          Full geometry
        </ToggleButton>
      </ToggleButtonGroup>

      <h5>Electronic Type</h5>
      <ToggleButtonGroup 
        type="radio" 
        name="electronicType" 
        value={electronicType} 
        onChange={setElectronicType} 
        className="mb-3"
      >
        <ToggleButton 
          id="metal" 
          value="metal" 
          variant="outline-primary" 
          className="px-3"
        >
          Metal
        </ToggleButton>
        <ToggleButton 
          id="insulator" 
          value="insulator" 
          variant="outline-primary" 
          className="px-3"
        >
          Insulator
        </ToggleButton>
      </ToggleButtonGroup>

      <h5>Magnetism</h5>
      <ToggleButtonGroup 
        type="radio" 
        name="magnetism" 
        value={magnetism} 
        onChange={setMagnetism} 
        className="mb-3"
      >
        <ToggleButton 
          id="magnetism-off" 
          value="off" 
          variant="outline-secondary" 
          className="px-4"
        >
          Off
        </ToggleButton>
        <ToggleButton 
          id="magnetism-on" 
          value="on" 
          variant="outline-secondary" 
          className="px-4"
        >
          On
        </ToggleButton>
      </ToggleButtonGroup>

      <h4>Properties</h4>
      <p className="text-muted">Select which properties to calculate:</p>
      <Form.Group className="mb-3">
        <Form.Check type="checkbox" label="Bader charge analysis" />
        <Form.Check type="checkbox" label="Electronic band structure" />
        <Form.Check type="checkbox" label="Projected Density of States (PDOS)" />
        <Form.Check type="checkbox" label="X-ray absorption spectroscopy (XAS)" />
        <Form.Check type="checkbox" label="X-ray photoelectron spectroscopy (XPS)" />
      </Form.Group>

      <h4>Protocol</h4>
      <p className="text-muted">Select the protocol based on the trade-off between accuracy and speed.</p>
      <ToggleButtonGroup 
        type="radio" 
        name="protocol" 
        value={protocol} 
        onChange={setProtocol} 
        className="mb-3 w-100"
      >
        <ToggleButton 
          id="protocol-fast" 
          value="fast" 
          variant="outline-success" 
          className="w-100"
        >
          Fast
        </ToggleButton>
        <ToggleButton 
          id="protocol-moderate" 
          value="moderate" 
          variant="outline-warning" 
          className="w-100"
        >
          Moderate
        </ToggleButton>
        <ToggleButton 
          id="protocol-precise" 
          value="precise" 
          variant="outline-danger" 
          className="w-100"
        >
          Precise
        </ToggleButton>
      </ToggleButtonGroup>

      <p className="text-muted">The "moderate" protocol represents a trade-off between accuracy and speed. Choose the "fast" protocol for a faster calculation with less precision and the "precise" protocol to aim at best accuracy (at the price of longer/costlier calculations).</p>
      
    </Form>
  );
};

export default BasicSettingsTab;
