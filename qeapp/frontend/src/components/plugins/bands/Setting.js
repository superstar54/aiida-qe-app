import React, { useEffect, useContext } from 'react';
import { Form } from 'react-bootstrap';
import { WizardContext } from '../../wizard/WizardContext';

const SettingTab = ({}) => {
  const stepIndex = 1;
  const tabTitle = 'Bands Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};
  
    useEffect(() => {
        const defaultData = {
          projwfcBands: false,
        };
    
        // Merge default data with any existing data
        const initialData = { ...defaultData, ...data };
    
        // Update data if it doesn't already have all default values
        if (JSON.stringify(data) !== JSON.stringify(initialData)) {
          handleDataChange(stepIndex, tabTitle, initialData);
      }
      }, []);
      
      const handleChange = (field, value) => {
        const newData = { ...data, [field]: value };
        handleDataChange(stepIndex, tabTitle, newData);
    };

  return (
    <Form>
      <h4>Settings</h4>
      <p>The band structure workflow will automatically detect the default path in reciprocal space using the <a href="https://seek-path.xyz/" target="_blank" rel="noopener noreferrer">SeeK-path tool</a>.</p>
      <p>
        Fat Bands is a band structure plot that includes the angular momentum contributions from specific atoms or orbitals to each energy band. 
        The thickness of the bands represents the strength of these contributions, providing insight into the electronic structure.
      </p>
      <Form.Check 
        type="checkbox" 
        label="Fat bands calculation" 
        checked={data.projwfcBands || false} 
        onChange={(e) => handleChange('projwfcBands', e.target.checked)} 
      />
    </Form>
  );
};

export default SettingTab;