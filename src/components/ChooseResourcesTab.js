import React, { useState } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

const ChooseResourcesTab = ({ onSubmit, stepData, onDataChange }) => {
  // State for codes, nodes, and CPUs
  const [pwXCode, setPwXCode] = useState('pw-7.2@localhost');
  const [projwfcXCode, setProjwfcXCode] = useState('projwfc-7.2@localhost');
  const [pwXNodes, setPwXNodes] = useState(1);
  const [pwXCPUs, setPwXCPUs] = useState(1);
  const [projwfcXNodes, setProjwfcXNodes] = useState(1);
  const [projwfcXCPUs, setProjwfcXCPUs] = useState(1);

  // State for labeling the job
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const resourceData = {
      pwXCode,
      projwfcXCode,
      pwXNodes,
      pwXCPUs,
      projwfcXNodes,
      projwfcXCPUs,
      label,
      description
    };
    onDataChange(resourceData); // Send data back to the wizard
    onSubmit(); // Confirm and move to the next step
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Code Selection Section */}
      <h4>Codes</h4>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={2}>pw.x:</Form.Label>
        <Col sm={4}>
          <Form.Control
            as="select"
            value={pwXCode}
            onChange={(e) => setPwXCode(e.target.value)}
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
              value={pwXNodes}
              onChange={(e) => setPwXNodes(e.target.value)}
              min={1}
            />
          </InputGroup>
        </Col>
        <Col sm={2}>
          <InputGroup>
            <InputGroup.Text>CPUs</InputGroup.Text>
            <Form.Control
              type="number"
              value={pwXCPUs}
              onChange={(e) => setPwXCPUs(e.target.value)}
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
            value={projwfcXCode}
            onChange={(e) => setProjwfcXCode(e.target.value)}
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
              value={projwfcXNodes}
              onChange={(e) => setProjwfcXNodes(e.target.value)}
              min={1}
            />
          </InputGroup>
        </Col>
        <Col sm={2}>
          <InputGroup>
            <InputGroup.Text>CPUs</InputGroup.Text>
            <Form.Control
              type="number"
              value={projwfcXCPUs}
              onChange={(e) => setProjwfcXCPUs(e.target.value)}
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
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter job label"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description:</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter job description"
        />
      </Form.Group>

    </Form>
  );
};

export default ChooseResourcesTab;
