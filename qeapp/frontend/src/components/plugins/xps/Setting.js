import React, { useEffect, useState, useContext } from 'react';
import { Form, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { WizardContext } from '../../wizard/WizardContext';

const SettingTab = ({}) => {
  const stepIndex = 1;
  const tabTitle = 'XPS Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};
  
  const structure = steps[0]?.data?.['Structure Selection']?.selectedStructure || null;

  const [supportedElements, setSupportedElements] = useState([]);
  const [notSupportedElements, setNotSupportedElements] = useState([]);

  const defaultData = {
    structureType: 'crystal',
    pseudoGroup: 'pseudo_demo_pbe',
    coreLevels: {},  // Store the selected core levels here
    correctionEnergies: {},  // Store the correction energies here
  };

  useEffect(() => {
    if (!structure) {
      return;
    }

    const fetchCalculationData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/calculation/get_supported_xps_core_level/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ structure }), // Send the structure data to the backend
        });

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("result: ", result);

        // Set supported and not supported elements
        setSupportedElements(result.supported_elements);
        setNotSupportedElements(result.not_supported_elements);
        const initialData = { ...defaultData, ...data };
        const newData = { ...initialData, ['correctionEnergies']: result.correction_energies || {} };
        handleDataChange(stepIndex, tabTitle, newData);
      } catch (error) {
        console.error('Failed to fetch calculation data:', error);
      }
    };
    // Fetch the data when the structure changes
    fetchCalculationData();
  }, [structure]);

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    handleDataChange(stepIndex, tabTitle, newData);
  };

  const handleCoreLevelChange = (element, isChecked) => {
    const newCoreLevels = {
      ...data.coreLevels,
      [element]: isChecked,
    };
    handleChange('coreLevels', newCoreLevels);
  };

  return (
    <Form>
      <h4>Structure</h4>
      <p>Below you can indicate if the material should be treated as a molecule or a crystal.</p>
      
      <ToggleButtonGroup 
        type="radio" 
        name="structureType" 
        value={data.structureType || 'crystal'} 
        onChange={(value) => handleChange('structureType', value)} 
        className="mb-3"
      >
        <ToggleButton id="molecule" value="molecule" variant="outline-primary">
          Molecule
        </ToggleButton>
        <ToggleButton id="crystal" value="crystal" variant="outline-primary">
          Crystal
        </ToggleButton>
      </ToggleButtonGroup>

      <h5>Core-Hole Pseudopotential Group</h5>
      <Form.Group controlId="pseudoGroup">
        <Form.Label>Select a pseudopotential group</Form.Label>
        <Form.Control 
          as="select" 
          value={data.pseudoGroup || 'pseudo_demo_pbe'} 
          onChange={(e) => handleChange('pseudoGroup', e.target.value)} 
        >
          <option value="pseudo_demo_pbe">pseudo_demo_pbe</option>
          <option value="pseudo_demo_pbesol">pseudo_demo_pbesol</option>
          {/* Add more options as needed */}
        </Form.Control>
        <Form.Text className="text-muted">
          The pseudopotentials are downloaded from this <a href="https://github.com/superstar54/xps-data/raw/main/pseudo_demo/">repository</a>.
        </Form.Text>
      </Form.Group>

      <h5>Select Core-Level</h5>

      {/* Supported core levels (render as checkboxes) */}
      {supportedElements.length > 0 ? (
        supportedElements.map((element) => (
          <Form.Check 
            key={element}
            type="checkbox" 
            label={element} 
            checked={data.coreLevels?.[element] || false} 
            onChange={(e) => handleCoreLevelChange(element, e.target.checked)} 
          />
        ))
      ) : (
        <p>No supported core levels available.</p>
      )}

      {/* Not supported elements (render as labels or text) */}
      {notSupportedElements.length > 0 && (
        <div>
          <h6>Not Supported Core Levels</h6>
          {notSupportedElements.map((element) => (
            <p key={element} style={{ color: 'red' }}>
              {element} (Not Supported)
            </p>
          ))}
        </div>
      )}
    </Form>
  );
};


export default SettingTab;