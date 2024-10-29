import React, { useEffect, useContext, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { WizardContext } from '../../wizard/WizardContext';

const SettingTab = ({}) => {
  const stepIndex = 1;
  const tabTitle = 'PDOS Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};
  const protocol = steps[1]?.data?.['Basic Settings']?.protocol || 'moderate';
  const structure = steps[0]?.data?.['Structure Selection']?.selectedStructure || null;
  
  const defaultData = {
      kPointsDistance: 0.1,
      usePdosDegauss: false,
      pdosDegauss: 0.005,
  };

  // Use useRef to track if it's the initial mount
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip the effect on the initial mount
    }

    if (!protocol || !structure) {
      return;
    }
    const fetchCalculationData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/calculation/pw_parameters_from_protocol/', {
          method: 'POST', // Assuming POST method is required; you can adjust as needed
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ protocol, structure }), // Send protocol and structure as part of the request
        });

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const result = await response.json();

        // Assuming result contains the updated data
        const initialData = { ...defaultData, ...data };
        const updatedData = {
          ...initialData,
          kPointsDistance: result.kPointsDistance || data.kPointsDistance,
        };
        handleDataChange(stepIndex, tabTitle, updatedData); // Update the data with the new values from the API
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
      <h4>Settings</h4>
      <p>
        By default, the tetrahedron method is used for PDOS calculation. If required you can apply Gaussian broadening with a custom degauss value. 
        For molecules and systems with localized orbitals, it is recommended to use a custom degauss value.
      </p>

      <Form.Group controlId="kPointsDistance">
        <Form.Label>NSCF K-points distance (1/Å)</Form.Label>
        <Form.Control 
          type="number" 
          value={data.kPointsDistance || 0.1} 
          onChange={(e) => handleChange('kPointsDistance', e.target.value, 'float')} 
          step="0.01" 
        />
      </Form.Group>

      <Form.Check 
        type="checkbox" 
        label="Use custom PDOS degauss" 
        checked={data.usePdosDegauss || false} 
        onChange={(e) => handleChange('usePdosDegauss', e.target.checked)} 
      />

      {data.usePdosDegauss && (
        <Form.Group controlId="pdosDegauss">
          <Form.Label>PDOS degauss (Ry)</Form.Label>
          <Form.Control 
            type="number" 
            value={data.pdosDegauss || 0.005} 
            onChange={(e) => handleChange('pdosDegauss', e.target.value, 'float')} 
            step="0.001" 
          />
        </Form.Group>
      )}
    </Form>
  );
};



export default SettingTab;