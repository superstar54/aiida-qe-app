import React, { useEffect, useState, useContext } from 'react';
import { Form, ToggleButtonGroup, ToggleButton, Table } from 'react-bootstrap';
import { WizardContext } from '../wizard/WizardContext';

const MagnetizationSettingsTab = ({}) => {
  const stepIndex = 1;
  const tabTitle = 'Magnetization Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};

  const structure = steps[0]?.data?.['Structure Selection']?.selectedStructure || null;
  const [kindLabels, setKindLabels] = useState([]);
  const [magnetizationType, setMagnetizationType] = useState('starting_magnetization');
  const [totalMagnetization, setTotalMagnetization] = useState(data.totalMagnetization || 0);

  const defaultData = {
    totalMagnetization: 0,
    startingMagnetization: {},
  };

  useEffect(() => {
    if (!structure) {
      return;
    }
    setKindLabels(Object.keys(structure.species));
  }, [structure]);

  const handleMagnetizationTypeChange = (value) => {
    setMagnetizationType(value);
    handleDataChange(stepIndex, tabTitle, { ...data, magnetizationType: value });
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
        <div className="mb-2" /> {/* Adds vertical spacing between the label and toggle buttons */}
        <ToggleButtonGroup 
          type="radio" 
          name="magnetizationType" 
          value={magnetizationType} 
          onChange={handleMagnetizationTypeChange} 
          className="mb-3"
        >
          <ToggleButton id="startingMagnetization" value="starting_magnetization" variant="outline-primary">
            Starting Magnetization
          </ToggleButton>
          <ToggleButton id="totalMagnetization" value="tot_magnetization" variant="outline-primary">
            Total Magnetization
          </ToggleButton>
        </ToggleButtonGroup>
      </Form.Group>

      {magnetizationType === 'tot_magnetization' ? (
        <Form.Group controlId="totalMagnetization">
          <Form.Label>Total Magnetization</Form.Label>
          <Form.Control
            type="number"
            min="0"
            max="100"
            step="1"
            value={totalMagnetization}
            onChange={(e) => handleTotalMagnetizationChange(parseInt(e.target.value))}
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
