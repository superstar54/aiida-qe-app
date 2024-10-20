import React, { useEffect } from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';

const ChooseResourcesTab = ({ data = {}, onDataChange }) => {
  useEffect(() => {
    const defaultData = {
      pwXCode: 'pw-7.2@localhost',
      pwXNodes: 1,
      pwXCPUs: 1,
      projwfcXCode: 'projwfc-7.2@localhost',
      projwfcXNodes: 1,
      projwfcXCPUs: 1,
      label: '',
      description: '',
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
      {/* Code Selection Section */}
      <h4>Codes</h4>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={2}>pw.x:</Form.Label>
        <Col sm={4}>
          <Form.Control
            as="select"
            value={data.pwXCode || 'pw-7.2@localhost'}
            onChange={(e) => handleChange('pwXCode', e.target.value)}
          >
            <option>pw-7.2@localhost</option>
            <option>pw-7.1@remote</option>
            {/* Add more code options as necessary */}
          </Form.Control>
        </Col>
        <Col sm={2}>
          <InputGroup>
            <InputGroup.Text>Nodes</InputGroup.Text>
            <Form.Control
              type="number"
              value={data.pwXNodes || 1}
              onChange={(e) => handleChange('pwXNodes', e.target.value)}
              min={1}
            />
          </InputGroup>
        </Col>
        <Col sm={2}>
          <InputGroup>
            <InputGroup.Text>CPUs</InputGroup.Text>
            <Form.Control
              type="number"
              value={data.pwXCPUs || 1}
              onChange={(e) => handleChange('pwXCPUs', e.target.value)}
              min={1}
            />
          </InputGroup>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={2}>projwfc.x:</Form.Label>
        <Col sm={4}>
          <Form.Control
            as="select"
            value={data.projwfcXCode || 'projwfc-7.2@localhost'}
            onChange={(e) => handleChange('projwfcXCode', e.target.value)}
          >
            <option>projwfc-7.2@localhost</option>
            <option>projwfc-7.1@remote</option>
            {/* Add more code options as necessary */}
          </Form.Control>
        </Col>
        <Col sm={2}>
          <InputGroup>
            <InputGroup.Text>Nodes</InputGroup.Text>
            <Form.Control
              type="number"
              value={data.projwfcXNodes || 1}
              onChange={(e) => handleChange('projwfcXNodes', e.target.value)}
              min={1}
            />
          </InputGroup>
        </Col>
        <Col sm={2}>
          <InputGroup>
            <InputGroup.Text>CPUs</InputGroup.Text>
            <Form.Control
              type="number"
              value={data.projwfcXCPUs || 1}
              onChange={(e) => handleChange('projwfcXCPUs', e.target.value)}
              min={1}
            />
          </InputGroup>
        </Col>
      </Form.Group>

      {/* Labeling Job Section */}
      <h4>Labeling Your Job</h4>
      <Form.Group className="mb-3">
        <Form.Label>Label:</Form.Label>
        <Form.Control
          type="text"
          value={data.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Enter job label"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description:</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter job description"
        />
      </Form.Group>
    </Form>
  );
};

export default ChooseResourcesTab;
