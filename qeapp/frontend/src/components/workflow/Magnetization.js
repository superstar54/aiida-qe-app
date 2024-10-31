import React, { useEffect, useState, useContext, useRef } from 'react';
import { Form, ToggleButtonGroup, ToggleButton, Table } from 'react-bootstrap';
import { WizardContext } from '../wizard/WizardContext';

const MagnetizationSettingsTab = () => {
  const stepIndex = 1;
  const tabTitle = 'Magnetization Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};

  const structure = steps[0]?.data?.['Structure Selection']?.selectedStructure || null;
  const electronicType = steps[1]?.data?.['Basic Settings']?.electronicType || 'metal';
  const isInitialMount = useRef(true); // Track initial mount

  // Initialize kindLabels from data or structure
  const initialKindLabels = data.startingMagnetization 
    ? Object.keys(data.startingMagnetization) 
    : structure ? Object.keys(structure.species) : [];

  const [kindLabels, setKindLabels] = useState(initialKindLabels);
  const [magnetizationType, setMagnetizationType] = useState(data.magnetizationType || 'starting_magnetization');
  const [totalMagnetization, setTotalMagnetization] = useState(data.totalMagnetization || 0);

  // Update kindLabels and startingMagnetization based on structure, but only after initial mount
  useEffect(() => {
    if (isInitialMount.current) return;

    if (structure) {
      const newKindLabels = Object.keys(structure.species);
      setKindLabels(newKindLabels);

      const newStartingMagnetization = newKindLabels.reduce((acc, kind) => {
        acc[kind] = 0;
        return acc;
      }, {});

      handleDataChange(stepIndex, tabTitle, { 
        ...data, 
        startingMagnetization: newStartingMagnetization 
      });
    }
  }, [structure]);

  // Effect to handle changes in electronicType, except on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // Mark the initial mount complete
      return;
    }

    if (electronicType === 'insulator') {
      // Set to Total Magnetization and disable Starting Magnetization
      setMagnetizationType('tot_magnetization');
      setTotalMagnetization(0);
      handleDataChange(stepIndex, tabTitle, {
        magnetizationType: 'tot_magnetization',
        totalMagnetization: 0,
        startingMagnetization: {}, // clear starting magnetization for insulator
      });
    } else if (electronicType === 'metal') {
      // Reset all states when switching back to metal
      const resetData = {
        magnetizationType: 'starting_magnetization',
        totalMagnetization: 0,
        startingMagnetization: kindLabels.reduce((acc, kind) => {
          acc[kind] = 0;
          return acc;
        }, {}),
      };
      setMagnetizationType('starting_magnetization');
      setTotalMagnetization(0);
      handleDataChange(stepIndex, tabTitle, resetData);
    }
  }, [electronicType, kindLabels]);

  const handleMagnetizationTypeChange = (value) => {
    setMagnetizationType(value);

    const resetData = {
      magnetizationType: value,
      totalMagnetization: 0,
      startingMagnetization: kindLabels.reduce((acc, kind) => {
        acc[kind] = 0;
        return acc;
      }, {}),
    };

    setTotalMagnetization(0);
    handleDataChange(stepIndex, tabTitle, resetData);
  };

  const handleTotalMagnetizationChange = (value) => {
    setTotalMagnetization(value);
    handleDataChange(stepIndex, tabTitle, { ...data, totalMagnetization: value });
  };

  const handleStartingMagnetizationChange = (kind, value) => {
    const newStartingMagnetization = {
      ...data.startingMagnetization,
      [kind]: value,
    };
    handleDataChange(stepIndex, tabTitle, { ...data, startingMagnetization: newStartingMagnetization });
  };

  return (
    <Form>
      <Form.Group controlId="magnetizationType">
        <Form.Label>Magnetization Type</Form.Label>
        <div className="mb-2" />
        <ToggleButtonGroup 
          type="radio" 
          name="magnetizationType" 
          value={magnetizationType} 
          onChange={handleMagnetizationTypeChange} 
          className="mb-3"
        >
          <ToggleButton 
            id="startingMagnetization" 
            value="starting_magnetization" 
            variant="outline-primary"
            disabled={electronicType === 'insulator'}
          >
            Starting Magnetization
          </ToggleButton>
          <ToggleButton 
            id="totalMagnetization" 
            value="tot_magnetization" 
            variant="outline-primary"
          >
            Total Magnetization
          </ToggleButton>
        </ToggleButtonGroup>
      </Form.Group>

      {magnetizationType === 'tot_magnetization' || electronicType === 'insulator' ? (
        <Form.Group controlId="totalMagnetization">
          <Form.Label>Total Magnetization</Form.Label>
          <Form.Control
            type="number"
            min="-10000"
            max="10000"
            step="0.1"
            value={totalMagnetization}
            onChange={(e) => handleTotalMagnetizationChange(parseFloat(e.target.value))}
          />
        </Form.Group>
      ) : (
        <div>
          <h5>Starting Magnetization</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Element</th>
                <th>Magnetization Value</th>
              </tr>
            </thead>
            <tbody>
              {kindLabels.map((kind) => (
                <tr key={kind}>
                  <td>{kind}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min="-4"
                      max="4"
                      step="0.1"
                      value={data.startingMagnetization?.[kind] || 0}
                      onChange={(e) => handleStartingMagnetizationChange(kind, parseFloat(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Form>
  );
};

export default MagnetizationSettingsTab;
