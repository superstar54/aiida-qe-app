import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';

const PDOSTab = ({ data = {}, onDataChange }) => {

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
        <Form.Text>Mesh [21, 21, 21]</Form.Text>
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
          <Form.Text>(0.0680 eV)</Form.Text>
        </Form.Group>
      )}
    </Form>
  );
};

export default PDOSTab;
