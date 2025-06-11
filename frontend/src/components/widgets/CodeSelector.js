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
              <option key={option.label} value={option.uuid}>
                {option.label}@{option?.extras?.computer}
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

export default CodeSelector;