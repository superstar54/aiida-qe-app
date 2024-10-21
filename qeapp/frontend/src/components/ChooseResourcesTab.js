import React, { useEffect } from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';

// Reusable component for code selection
const CodeSelector = ({ codeLabel, codeValue, onCodeChange, nodeValue, onNodeChange, cpuValue, onCpuChange, codeOptions }) => {
  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm={2}>{codeLabel}:</Form.Label>
      <Col sm={4}>
        <Form.Control
          as="select"
          value={codeValue}
          onChange={(e) => onCodeChange(e.target.value)}
        >
          {codeOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Control>
      </Col>
      <Col sm={2}>
        <InputGroup>
          <InputGroup.Text>Nodes</InputGroup.Text>
          <Form.Control
            type="number"
            value={nodeValue}
            onChange={(e) => onNodeChange(e.target.value)}
            min={1}
          />
        </InputGroup>
      </Col>
      <Col sm={2}>
        <InputGroup>
          <InputGroup.Text>CPUs</InputGroup.Text>
          <Form.Control
            type="number"
            value={cpuValue}
            onChange={(e) => onCpuChange(e.target.value)}
            min={1}
          />
        </InputGroup>
      </Col>
    </Form.Group>
  );
};

const ChooseResourcesTab = ({ data = {}, onDataChange }) => {
  useEffect(() => {
    const defaultData = {
      pwCode: 'pw-7.2@localhost',
      pwNodes: 1,
      pwCPUs: 1,
      projwfcCode: 'projwfc-7.2@localhost',
      projwfcNodes: 1,
      projwfcCPUs: 1,
      dosCode: 'dos-7.2@localhost',  // New code for dos.x
      dosNodes: 1,
      dosCPUs: 1,
      label: '',
      description: '',
    };

    const initialData = { ...defaultData, ...data };

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

      {/* pw.x Code */}
      <CodeSelector
        codeLabel="pw.x"
        codeValue={data.pwCode}
        onCodeChange={(value) => handleChange('pwCode', value)}
        nodeValue={data.pwNodes}
        onNodeChange={(value) => handleChange('pwNodes', value)}
        cpuValue={data.pwCPUs}
        onCpuChange={(value) => handleChange('pwCPUs', value)}
        codeOptions={['pw-7.2@localhost', 'pw-7.1@remote']}
      />

      {/* projwfc.x Code */}
      <CodeSelector
        codeLabel="projwfc.x"
        codeValue={data.projwfcCode}
        onCodeChange={(value) => handleChange('projwfcCode', value)}
        nodeValue={data.projwfcNodes}
        onNodeChange={(value) => handleChange('projwfcNodes', value)}
        cpuValue={data.projwfcCPUs}
        onCpuChange={(value) => handleChange('projwfcCPUs', value)}
        codeOptions={['projwfc-7.2@localhost', 'projwfc-7.1@remote']}
      />

      {/* dos.x Code */}
      <CodeSelector
        codeLabel="dos.x"
        codeValue={data.dosCode}
        onCodeChange={(value) => handleChange('dosCode', value)}
        nodeValue={data.dosNodes}
        onNodeChange={(value) => handleChange('dosNodes', value)}
        cpuValue={data.dosCPUs}
        onCpuChange={(value) => handleChange('dosCPUs', value)}
        codeOptions={['dos-7.2@localhost', 'dos-7.1@remote']}
      />

      {/* Labeling Job Section */}
      <h4>Labeling Your Job</h4>
      <Form.Group className="mb-3">
        <Form.Label>Label:</Form.Label>
        <Form.Control
          type="text"
          value={data.label}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Enter job label"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description:</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter job description"
        />
      </Form.Group>
    </Form>
  );
};

export default ChooseResourcesTab;
