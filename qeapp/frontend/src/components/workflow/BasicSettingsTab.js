// src/workflow/BasicSettingsTab.js
import React, { useEffect, useContext } from 'react';
import { Row, Col, ToggleButton, ToggleButtonGroup, Form } from 'react-bootstrap';
import { WizardContext } from '../wizard/WizardContext';

const BasicSettingsTab = ({}) => {
  const stepIndex = 1;
  const tabTitle = 'Basic Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};

  console.log("data: ", data);

  useEffect(() => {
    const defaultData = {
      relaxType: 'positions',
      electronicType: 'metal',
      spinType: 'none',
      protocol: 'moderate',
      bader: false,
      properties: {},
      plugins: data.plugins || [],
    };

    // Initialize properties based on plugins
    if (data.plugins && Array.isArray(data.plugins)) {
      data.plugins.forEach((plugin) => {
        if (!(plugin.id in defaultData.properties)) {
          defaultData.properties[plugin.id] = false;
        }
      });
    }

    const initialData = {
      ...defaultData,
      ...data,
      properties: {
        ...defaultData.properties,
        ...(data.properties || {}),
      },
    };

    if (JSON.stringify(data) !== JSON.stringify(initialData)) {
      handleDataChange(stepIndex, tabTitle, initialData);
  }
  }, [data]);

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    handleDataChange(stepIndex, tabTitle, newData);
  };

  const handlePropertyChange = (pluginName, checked) => {
    const newProperties = {
      ...data.properties,
      [pluginName]: checked,
    };
    const newData = { ...data, properties: newProperties };
    handleDataChange(stepIndex, tabTitle, newData);
  };


  return (
    <Form>
      <h4>Structure</h4>
      <div>
        <p>You have three options:</p>
        <ol>
          <li>
            <strong>Structure as is</strong>: Perform a self-consistent calculation using the structure provided as input.
          </li>
          <li>
            <strong>Atomic positions</strong>: Perform a full relaxation of the internal atomic coordinates.
          </li>
          <li>
            <strong>Full geometry</strong>: Perform a full relaxation for both the internal atomic coordinates and the cell vectors.
          </li>
        </ol>
      </div>
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
        {/* Dynamically render plugin checkboxes */}
        {data.plugins &&
          data.plugins.map((plugin) => (
            <Form.Check
              key={plugin.id}
              type="checkbox"
              label={plugin.outline}
              checked={data.properties[plugin.id] || false}
              onChange={(e) => handlePropertyChange(plugin.id, e.target.checked)}
            />
          ))}
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

      <p className="text-muted">
        The "moderate" protocol represents a trade-off between accuracy and speed. Choose the "fast" protocol for a faster
        calculation with less precision and the "precise" protocol to aim at best accuracy (at the price of longer/costlier
        calculations).
      </p>
    </Form>
  );
};

export default BasicSettingsTab;
