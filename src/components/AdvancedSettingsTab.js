import React, { useState } from 'react';
import { Row, Col, Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

const AdvancedSettingsTab = () => {
  const [spinOrbit, setSpinOrbit] = useState('off');
  const [hubbard, setHubbard] = useState('off');

  return (
    <Form>
      <h4 className="mt-3">Advanced Settings for Workflow</h4>

      <Form.Group controlId="cleanUp" className="mb-3">
        <Form.Check type="checkbox" label="Clean up directory after calculation is finished" />
      </Form.Group>

      <h4>Convergence Thresholds</h4>
      <Row className="mb-3">
        <Col md={4} sm={12}>
          <Form.Label>Force Convergence</Form.Label>
          <Form.Control type="number" placeholder="0.0001" defaultValue="0.0001" />
        </Col>
        <Col md={4} sm={12}>
          <Form.Label>Energy Convergence</Form.Label>
          <Form.Control type="number" placeholder="0.00001" defaultValue="0.00001" />
        </Col>
        <Col md={4} sm={12}>
          <Form.Label>SCF Convergence</Form.Label>
          <Form.Control type="number" placeholder="2e-10" defaultValue="2e-10" />
        </Col>
      </Row>

      <h5>Max Electron Steps</h5>
      <Row className="mb-3">
        <Col md={4} sm={12}>
          <Form.Control type="number" placeholder="80" defaultValue="80" />
        </Col>
      </Row>

      <h4>Smearing</h4>
      <Row className="mb-3">
        <Col md={6} sm={12}>
          <Form.Label>Smearing Type</Form.Label>
          <Form.Select defaultValue="cold">
            <option value="cold">Cold</option>
            <option value="gaussian">Gaussian</option>
            <option value="fermi">Fermi-Dirac</option>
          </Form.Select>
        </Col>
        <Col md={6} sm={12}>
          <Form.Label>Smearing Width (Ry)</Form.Label>
          <Form.Control type="number" placeholder="0.01" defaultValue="0.01" />
        </Col>
      </Row>

      <h4>K-Points</h4>
      <Row className="mb-3">
        <Col md={6} sm={12}>
          <Form.Label>K-points Distance (1/A)</Form.Label>
          <Form.Control type="number" placeholder="0.15" defaultValue="0.15" />
        </Col>
      </Row>

      <h4>Hubbard (DFT+U)</h4>
      <Row className="mb-3">
        <Col md={6} sm={12}>
          <ToggleButtonGroup type="radio" name="hubbard" value={hubbard} onChange={setHubbard} className="w-100">
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
          <ToggleButtonGroup type="radio" name="spinOrbit" value={spinOrbit} onChange={setSpinOrbit} className="w-100">
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
