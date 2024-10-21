import React from 'react';
import { Form, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

const XPSTab = ({ data = {}, onDataChange }) => {
  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    onDataChange(newData);
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
          {/* Add more options as needed */}
        </Form.Control>
        <Form.Text className="text-muted">
          The pseudopotentials are downloaded from this <a href="https://example.com">repository</a>.
        </Form.Text>
      </Form.Group>

      <h5>Select Core-Level</h5>
      <Form.Check 
        type="checkbox" 
        label="Si_2p" 
        checked={data.si2p || false} 
        onChange={(e) => handleChange('si2p', e.target.checked)} 
      />
    </Form>
  );
};

export default XPSTab;
