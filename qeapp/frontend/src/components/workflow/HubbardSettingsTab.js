import React, { useEffect, useState, useContext } from 'react';
import { Form, Table, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { WizardContext } from '../wizard/WizardContext';

const HubbardSettingsTab = () => {
  const stepIndex = 1;
  const tabTitle = 'Hubbard Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};

  const structure = steps[0]?.data?.['Structure Selection']?.selectedStructure || null;
  const [kindLabels, setKindLabels] = useState([]);
  const [activateHubbard, setActivateHubbard] = useState(data.activateHubbard || false);
  const [defineEigenvalues, setDefineEigenvalues] = useState(data.defineEigenvalues || false);

  const defaultData = {
    activateHubbard: false,
    hubbardUValues: {},
    defineEigenvalues: false,
    eigenvalues: {},
  };

  useEffect(() => {
    if (structure) {
      setKindLabels(Object.keys(structure.species)); // Assuming 'species' lists atomic kinds
    }
  }, [structure]);

  const handleHubbardToggle = (value) => {
    setActivateHubbard(value);
    
    // Update hubbardUValues based on activation state
    const newHubbardUValues = value 
      ? kindLabels.reduce((acc, kind) => ({ ...acc, [kind]: 0 }), {})
      : {};
      
    handleDataChange(stepIndex, tabTitle, { ...data, activateHubbard: value, hubbardUValues: newHubbardUValues });
  };

  const handleDefineEigenvaluesToggle = (value) => {
    setDefineEigenvalues(value);
    
    // Update eigenvalues based on defineEigenvalues state
    const newEigenvalues = value 
      ? kindLabels.reduce((acc, kind) => ({ ...acc, [kind]: Array(10).fill("0") }), {})
      : {};
      
    handleDataChange(stepIndex, tabTitle, { ...data, defineEigenvalues: value, eigenvalues: newEigenvalues });
  };

  const handleHubbardUChange = (kind, value) => {
    const newHubbardUValues = { ...data.hubbardUValues, [kind]: value };
    handleDataChange(stepIndex, tabTitle, { ...data, hubbardUValues: newHubbardUValues });
  };

  const handleEigenvalueChange = (kind, index, value) => {
    const updatedEigenvalues = { ...data.eigenvalues };
    if (!updatedEigenvalues[kind]) updatedEigenvalues[kind] = Array(10).fill("0");
    updatedEigenvalues[kind][index] = value;
    handleDataChange(stepIndex, tabTitle, { ...data, eigenvalues: updatedEigenvalues });
  };

  return (
    <Form>
      <Form.Group controlId="activateHubbard">
        <Form.Label style={{ marginRight: '20px' }}><b>Activate Hubbard (DFT+U)</b></Form.Label>
        <ToggleButtonGroup
          type="radio"
          name="activateHubbard"
          value={activateHubbard}
          onChange={handleHubbardToggle}
          className="mb-3"
        >
          <ToggleButton id="hubbardOff" value={false} variant="outline-secondary">Off</ToggleButton>
          <ToggleButton id="hubbardOn" value={true} variant="outline-primary">On</ToggleButton>
        </ToggleButtonGroup>
      </Form.Group>

      {activateHubbard && (
        <>
          <h5>Hubbard U Values</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Element</th>
                <th>Manifold</th>
                <th>Hubbard U (eV)</th>
              </tr>
            </thead>
            <tbody>
              {kindLabels.map((kind) => (
                <tr key={kind}>
                  <td>{kind}</td>
                  <td>{/* Replace with actual manifold if available */ 'd'}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={data.hubbardUValues?.[kind] || 0}
                      onChange={(e) => handleHubbardUChange(kind, parseFloat(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Form.Group controlId="defineEigenvalues" className="mt-4">
            <Form.Check
              type="checkbox"
              label="Define starting eigenvalues (for transition metals)"
              checked={defineEigenvalues}
              onChange={(e) => handleDefineEigenvaluesToggle(e.target.checked)}
            />
          </Form.Group>

          {defineEigenvalues && (
            <div className="mt-3">
              <h5>Starting Eigenvalues</h5>
              {kindLabels.map((kind) => (
                <div key={kind}>
                  <Form.Label>{kind} Eigenvalues</Form.Label>
                  <Table bordered>
                    <thead>
                      <tr>
                        <th>State</th>
                        {[...Array(5)].map((_, i) => (
                          <th key={i}>{i + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Up</td>
                        {[...Array(5)].map((_, i) => (
                          <td key={i}>
                            <Form.Control
                              as="select"
                              value={data.eigenvalues?.[kind]?.[i] || "0"}
                              onChange={(e) => handleEigenvalueChange(kind, i, e.target.value)}
                            >
                              <option value="-1">-1</option>
                              <option value="0">0</option>
                              <option value="1">1</option>
                            </Form.Control>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Down</td>
                        {[...Array(5)].map((_, i) => (
                          <td key={i}>
                            <Form.Control
                              as="select"
                              value={data.eigenvalues?.[kind]?.[i + 5] || "0"}
                              onChange={(e) => handleEigenvalueChange(kind, i + 5, e.target.value)}
                            >
                              <option value="-1">-1</option>
                              <option value="0">0</option>
                              <option value="1">1</option>
                            </Form.Control>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Form>
  );
};

export default HubbardSettingsTab;
