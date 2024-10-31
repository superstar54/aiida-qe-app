import React, { useEffect, useContext, useRef } from 'react';
import { Row, Col, Form, ToggleButton, ToggleButtonGroup, Accordion } from 'react-bootstrap';
import { WizardContext } from '../wizard/WizardContext';
import MagnetizationSettingsTab from './Magnetization';
import PseudopotentialSetting from './Pseudo';
import HubbardSettingsTab from './HubbardSettingsTab';

const AdvancedSettingsTab = () => {
  const stepIndex = 1;
  const tabTitle = 'Advanced Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};

  const protocol = steps[1]?.data?.['Basic Settings']?.protocol || 'moderate';
  const structure = steps[0]?.data?.['Structure Selection']?.selectedStructure || null;

  const defaultData = {
    cleanUp: false,
    forceConvergence: 0.0001,
    energyConvergence: 0.00001,
    scfConvergence: 2e-10,
    maxElectronSteps: 80,
    smearingType: 'cold',
    smearingWidth: 0.01,
    kPointsDistance: 0.15,
    spinOrbit: 'off',
    totalCharge: 0,
    vdWCorrection: 'none',
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!protocol || !structure) {
      return;
    }

    const fetchCalculationData = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/calculation/pw_parameters_from_protocol/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ protocol, structure }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const result = await response.json();

        const initialData = { ...defaultData, ...data };
        const updatedData = {
          ...initialData,
          forceConvergence: result.forceConvergence || data.forceConvergence,
          energyConvergence: result.energyConvergence || data.energyConvergence,
          scfConvergence: result.scfConvergence || data.scfConvergence,
          maxElectronSteps: result.maxElectronSteps || data.maxElectronSteps,
          smearingType: result.smearingType || data.smearingType,
          smearingWidth: result.smearingWidth || data.smearingWidth,
          kPointsDistance: result.kPointsDistance || data.kPointsDistance,
        };

        handleDataChange(stepIndex, tabTitle, updatedData);
      } catch (error) {
        console.error('Failed to fetch calculation data:', error);
      }
    };

    fetchCalculationData();
  }, [protocol, structure]);

  const handleChange = (field, value, type = 'string') => {
    if (type === 'float' || type === 'number') {
      value = parseFloat(value);
    } else if (type === 'int') {
      value = parseInt(value, 10);
    }
    const newData = { ...data, [field]: value };
    handleDataChange(stepIndex, tabTitle, newData);
  };

  return (
    <Form>
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Electronic and Structural Parameters</Accordion.Header>
          <Accordion.Body>
            <Form.Group controlId="totalCharge" className="mb-3">
              <Form.Label>Total Charge</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={data.totalCharge || 0}
                onChange={(e) => handleChange('totalCharge', e.target.value, 'number')}
              />
            </Form.Group>
  
            <Form.Group controlId="vdWCorrection" className="mb-3">
              <Form.Label>Van der Waals Correction</Form.Label>
              <Form.Select
                value={data.vdWCorrection || 'none'}
                onChange={(e) => handleChange('vdWCorrection', e.target.value)}
              >
                <option value="none">None</option>
                <option value="dft-d3">Grimme-D3</option>
                <option value="dft-d3bj">Grimme-D3BJ</option>
                <option value="dft-d3m">Grimme-D3M</option>
                <option value="dft-d3mbj">Grimme-D3MBJ</option>
                <option value="ts-vdw">Tkatchenko-Scheffler</option>
              </Form.Select>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
  
        <Accordion.Item eventKey="1">
          <Accordion.Header>Convergence Thresholds</Accordion.Header>
          <Accordion.Body>
            <Row className="mb-3">
              <Col md={4} sm={12}>
                <Form.Label>Force Convergence</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.0001"
                  value={data.forceConvergence || 0.0001}
                  onChange={(e) => handleChange('forceConvergence', e.target.value, 'number')}
                />
              </Col>
              <Col md={4} sm={12}>
                <Form.Label>Energy Convergence</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.00001"
                  value={data.energyConvergence || 0.00001}
                  onChange={(e) => handleChange('energyConvergence', e.target.value, 'number')}
                />
              </Col>
              <Col md={4} sm={12}>
                <Form.Label>SCF Convergence</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="2e-10"
                  value={data.scfConvergence || 2e-10}
                  onChange={(e) => handleChange('scfConvergence', e.target.value, 'number')}
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
                  onChange={(e) => handleChange('maxElectronSteps', e.target.value, 'int')}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
  
        <Accordion.Item eventKey="2">
          <Accordion.Header>Smearing</Accordion.Header>
          <Accordion.Body>
            <p className="text-muted">
              The smearing type and width are set by the chosen protocol. Tick the box to override the default, not advised unless you've mastered smearing effects 
              (<a href="http://theossrv1.epfl.ch/Main/ElectronicTemperature" target="_blank" rel="noopener noreferrer">click here for a discussion</a>).
            </p>
            <Row className="mb-3">
              <Col md={6} sm={12}>
                <Form.Label>Smearing Type</Form.Label>
                <Form.Select
                  value={data.smearingType || 'cold'}
                  onChange={(e) => handleChange('smearingType', e.target.value)}
                >
                  <option value="cold">Cold</option>
                  <option value="gaussian">Gaussian</option>
                  <option value="fermi-dirac">Fermi-Dirac</option>
                  <option value="methfessel-paxton">Methfessel-Paxton</option>
                </Form.Select>
              </Col>
              <Col md={6} sm={12}>
                <Form.Label>Smearing Width (Ry)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.01"
                  value={data.smearingWidth || 0.01}
                  onChange={(e) => handleChange('smearingWidth', e.target.value, 'number')}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
  
        <Accordion.Item eventKey="3">
          <Accordion.Header>K-Points</Accordion.Header>
          <Accordion.Body>
            <p className="text-muted">
              The k-points mesh density of the SCF calculation is set by the protocol. The value below represents the maximum distance between the k-points in each direction of reciprocal space. Smaller is more accurate and costly.
            </p>
            <Row className="mb-3">
              <Col md={6} sm={12}>
                <Form.Label>K-points Distance (1/A)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.15"
                  value={data.kPointsDistance || 0.15}
                  onChange={(e) => handleChange('kPointsDistance', e.target.value, 'number')}
                />
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
  
        <Accordion.Item eventKey="4">
          <Accordion.Header>Magnetization Settings</Accordion.Header>
          <Accordion.Body>
            <MagnetizationSettingsTab />
          </Accordion.Body>
        </Accordion.Item>
  
        <Accordion.Item eventKey="5">
          <Accordion.Header>Pseudopotential Settings</Accordion.Header>
          <Accordion.Body>
            <PseudopotentialSetting />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="6">
          <Accordion.Header>DFT+U Settings</Accordion.Header>
          <Accordion.Body>
            <HubbardSettingsTab />
          </Accordion.Body>
        </Accordion.Item>

        

        <Accordion.Item eventKey="7">
          <Accordion.Header>Post-Calculation Cleanup</Accordion.Header>
          <Accordion.Body>
            <Form.Group controlId="cleanUp" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Clean up directory after calculation is finished"
                checked={data.cleanUp || false}
                onChange={(e) => handleChange('cleanUp', e.target.checked)}
              />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Form>
  );
}  

export default AdvancedSettingsTab;
