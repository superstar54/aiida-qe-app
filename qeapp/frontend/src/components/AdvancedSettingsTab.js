import React, { useEffect } from 'react';
import { Row, Col, Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

const AdvancedSettingsTab = ({ data = {}, onDataChange }) => {

  useEffect(() => {
    const defaultData = {
      cleanUp: false,
      forceConvergence: 0.0001,
      energyConvergence: 0.00001,
      scfConvergence: 2e-10,
      maxElectronSteps: 80,
      smearingType: 'cold',
      smearingWidth: 0.01,
      kPointsDistance: 0.15,
      hubbard: 'off',
      spinOrbit: 'off',
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
      <h4 className="mt-3">Advanced Settings for Workflow</h4>

      <Form.Group controlId="cleanUp" className="mb-3">
        <Form.Check 
          type="checkbox" 
          label="Clean up directory after calculation is finished" 
          checked={data.cleanUp || false} 
          onChange={(e) => handleChange('cleanUp', e.target.checked)} 
        />
      </Form.Group>

      <h4>Convergence Thresholds</h4>
      <Row className="mb-3">
        <Col md={4} sm={12}>
          <Form.Label>Force Convergence</Form.Label>
          <Form.Control 
            type="number" 
            placeholder="0.0001" 
            value={data.forceConvergence || 0.0001} 
            onChange={(e) => handleChange('forceConvergence', e.target.value)} 
          />
        </Col>
        <Col md={4} sm={12}>
          <Form.Label>Energy Convergence</Form.Label>
          <Form.Control 
            type="number" 
            placeholder="0.00001" 
            value={data.energyConvergence || 0.00001} 
            onChange={(e) => handleChange('energyConvergence', e.target.value)} 
          />
        </Col>
        <Col md={4} sm={12}>
          <Form.Label>SCF Convergence</Form.Label>
          <Form.Control 
            type="number" 
            placeholder="2e-10" 
            value={data.scfConvergence || 2e-10} 
            onChange={(e) => handleChange('scfConvergence', e.target.value)} 
          />
        </Col>
      </Row>

      <h5>Max Electron Steps</h5>
      <Row className="mb-3">
        <Col md={4} sm={12}>
          <Form.Control 
            type="number" 
            placeholder="80" 
            value={data.maxElectronSteps || 80} 
            onChange={(e) => handleChange('maxElectronSteps', e.target.value)} 
          />
        </Col>
      </Row>

      <h4>Smearing</h4>
      <Row className="mb-3">
        <Col md={6} sm={12}>
          <Form.Label>Smearing Type</Form.Label>
          <Form.Select 
            value={data.smearingType || "cold"} 
            onChange={(e) => handleChange('smearingType', e.target.value)}
          >
            <option value="cold">Cold</option>
            <option value="gaussian">Gaussian</option>
            <option value="fermi">Fermi-Dirac</option>
          </Form.Select>
        </Col>
        <Col md={6} sm={12}>
          <Form.Label>Smearing Width (Ry)</Form.Label>
          <Form.Control 
            type="number" 
            placeholder="0.01" 
            value={data.smearingWidth || 0.01} 
            onChange={(e) => handleChange('smearingWidth', e.target.value)} 
          />
        </Col>
      </Row>

      <h4>K-Points</h4>
      <Row className="mb-3">
        <Col md={6} sm={12}>
          <Form.Label>K-points Distance (1/A)</Form.Label>
          <Form.Control 
            type="number" 
            placeholder="0.15" 
            value={data.kPointsDistance || 0.15} 
            onChange={(e) => handleChange('kPointsDistance', e.target.value)} 
          />
        </Col>
      </Row>

      <h4>Hubbard (DFT+U)</h4>
      <Row className="mb-3">
        <Col md={6} sm={12}>
          <ToggleButtonGroup 
            type="radio" 
            name="hubbard" 
            value={data.hubbard || 'off'} 
            onChange={(value) => handleChange('hubbard', value)} 
            className="w-100"
          >
            <ToggleButton id="hubbard-off" value="off" variant="outline-secondary" className="w-50">
              Off
            </ToggleButton>
            <ToggleButton id="hubbard-on" value="on" variant="outline-secondary" className="w-50">
              On
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>
      </Row>

      <h5>Spin-Orbit Coupling</h5>
      <Row className="mb-3">
        <Col md={6} sm={12}>
          <ToggleButtonGroup 
            type="radio" 
            name="spinOrbit" 
            value={data.spinOrbit || 'off'} 
            onChange={(value) => handleChange('spinOrbit', value)} 
            className="w-100"
          >
            <ToggleButton id="spinOrbit-off" value="off" variant="outline-secondary" className="w-50">
              Off
            </ToggleButton>
            <ToggleButton id="spinOrbit-on" value="on" variant="outline-secondary" className="w-50">
              On
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>
      </Row>
    </Form>
  );
};

export default AdvancedSettingsTab;
