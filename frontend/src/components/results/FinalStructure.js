import React, { useEffect, useState, useContext } from 'react';
import { Spinner, Table, Alert, Row, Col, Card, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import StructureViewer from '../widgets/StructureViewer';
import { WizardContext } from '../wizard/WizardContext';

// Convert AiiDA structure data to the format expected by Atoms
function structureToAtomsData(inputData) {
  const data = {
    cell: inputData.cell,
    pbc: [inputData.pbc1, inputData.pbc2, inputData.pbc3],
    species: {},
    symbols: [],
    positions: [],
  };

  inputData.kinds.forEach((kind) => {
    data.species[kind.name] = kind.symbols[0];
  });

  inputData.sites.forEach((site) => {
    data.symbols.push(site.kind_name);
    data.positions.push(site.position);
  });

  return data;
}

// Generate XYZ file content
function generateXYZ(structure) {
  const { symbols, positions } = structure;
  const numAtoms = symbols.length;
  let xyzContent = `${numAtoms}\nGenerated structure\n`;

  for (let i = 0; i < numAtoms; i++) {
    const [x, y, z] = positions[i];
    xyzContent += `${symbols[i]} ${x.toFixed(5)} ${y.toFixed(5)} ${z.toFixed(5)}\n`;
  }

  return xyzContent;
}

// Trigger file download
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const FinalStructureTab = ({}) => {
  const { steps } = useContext(WizardContext);
  const jobId = steps[3]?.data?.['Label and Submit']?.jobId || null;
  const jobStatus = steps[4]?.data?.['Job Status']?.jobStatus || null;

  const [finalStructure, setFinalStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let isComponentMounted = true;

    const fetchFinalStructure = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `./api/jobs-data/${jobId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch final structure.');
        }

        const data = await response.json();

        if (isComponentMounted) {
          if (data.structure) {
            const structure = structureToAtomsData(data.structure);
            setFinalStructure(structure);
            setInfo(null);
            setError(null);
          } else {
            setInfo('Relax structure is not available.');
          }
          setLoading(false);
        }
      } catch (err) {
        if (isComponentMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchFinalStructure();

    return () => {
      isComponentMounted = false;
    };
  }, [jobId, jobStatus]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  if (info) {
    return <Alert variant="info">{info}</Alert>;
  }

  if (!finalStructure) {
    return <Alert variant="warning">No final structure data available.</Alert>;
  }

  const formatCell = (cell) => {
    return cell.map((vector) => vector.map((v) => v.toFixed(3)));
  };

  const formattedCell = formatCell(finalStructure.cell);

  return (
    <div>
      <h4 className="mb-4">Final Structure</h4>
      <Row>
      <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Structure Viewer</Card.Title>
              {/* Add a wrapper with fixed size and overflow control */}
              <div style={{ maxHeight: '400px', overflow: 'hidden', position: 'relative' }}>
                <StructureViewer structure={finalStructure} />
              </div>
              <div className="mt-3">
                <DropdownButton title="Download Structure" variant="primary">
                  <Dropdown.Item onClick={() => downloadFile(generateXYZ(finalStructure), 'structure.xyz', 'text/plain')}>
                    Download as XYZ
                  </Dropdown.Item>
                  <Dropdown.Item disabled>
                    Download as CIF (coming soon)
                  </Dropdown.Item>
                </DropdownButton>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Cell Parameters</Card.Title>
              <Table striped bordered hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Vector</th>
                    <th>x (Å)</th>
                    <th>y (Å)</th>
                    <th>z (Å)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>a₁</strong></td>
                    <td>{formattedCell[0][0]}</td>
                    <td>{formattedCell[0][1]}</td>
                    <td>{formattedCell[0][2]}</td>
                  </tr>
                  <tr>
                    <td><strong>a₂</strong></td>
                    <td>{formattedCell[1][0]}</td>
                    <td>{formattedCell[1][1]}</td>
                    <td>{formattedCell[1][2]}</td>
                  </tr>
                  <tr>
                    <td><strong>a₃</strong></td>
                    <td>{formattedCell[2][0]}</td>
                    <td>{formattedCell[2][1]}</td>
                    <td>{formattedCell[2][2]}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>Periodic Boundary Conditions (PBC)</Card.Title>
              <div className="d-flex justify-content-start align-items-center">
                <div className="me-3">
                  <strong>a:</strong> {finalStructure.pbc[0] ? 'True' : 'False'}
                </div>
                <div className="me-3">
                  <strong>b:</strong> {finalStructure.pbc[1] ? 'True' : 'False'}
                </div>
                <div>
                  <strong>c:</strong> {finalStructure.pbc[2] ? 'True' : 'False'}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Atomic Positions</Card.Title>
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table striped bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Element</th>
                      <th>x (Å)</th>
                      <th>y (Å)</th>
                      <th>z (Å)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalStructure.positions.slice(0, 20).map((pos, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{finalStructure.symbols[index]}</td>
                        <td>{pos[0].toFixed(3)}</td>
                        <td>{pos[1].toFixed(3)}</td>
                        <td>{pos[2].toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinalStructureTab;
