import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';

const SettingTab = ({ data = {}, protocol, structure, onDataChange }) => {

  useEffect(() => {
      const defaultData = {
          kPointsDistance: 0.1,
          usePdosDegauss: false,
          pdosDegauss: 0.005,
      };
  
      // Merge default data with any existing data
      const initialData = { ...defaultData, ...data };
  
      // Update data if it doesn't already have all default values
      if (JSON.stringify(data) !== JSON.stringify(initialData)) {
        onDataChange(initialData);
      }
    }, []);
    
  useEffect(() => {
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
        console.log("result: ", result)
        const updatedData = {
          ...data,
          kPointsDistance: result.kPointsDistance || data.kPointsDistance,
        };

        onDataChange(updatedData); // Update the data with the new values from the API
      } catch (error) {
        console.error('Failed to fetch calculation data:', error);
      }
    };

    // Call the fetch function when protocol or structure changes
    if (protocol || structure) {
      fetchCalculationData();
    }
  }, [protocol, structure]);

  const handleChange = (field, value) => {
      const newData = { ...data, [field]: value };
      onDataChange(newData);
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
          onChange={(e) => handleChange('kPointsDistance', e.target.value)} 
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
            onChange={(e) => handleChange('pdosDegauss', e.target.value)} 
            step="0.001" 
          />
        </Form.Group>
      )}
    </Form>
  );
};



export default SettingTab;