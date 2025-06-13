import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const GetStartedPage = () => {
  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card className="p-4" bg="light" border="warning">
            <Card.Body>
              <Card.Title className="mb-4">
                Welcome to the Quantum ESPRESSO App
              </Card.Title>
              <Card.Text>
                The QE app allows you to calculate properties in a simple 4-step process:
              </Card.Text>
              <ul className="list-unstyled">
                <li>
                  <span role="img" aria-label="step1">🔍</span>
                  <strong>Step 1</strong>: Select the structure you want to run.
                </li>
                <li>
                  <span role="img" aria-label="step2">⚙️</span>
                  <strong>Step 2</strong>: Select the properties you are interested in.
                </li>
                <li>
                  <span role="img" aria-label="step3">💻</span>
                  <strong>Step 3</strong>: Choose the computational resources you want to run on.
                </li>
                <li>
                  <span role="img" aria-label="step4">📝</span>
                  <strong>Step 4</strong>: Submit your workflow.
                </li>
              </ul>

              <Card.Text>
                New users can go straight to the first step and select their structure.
              </Card.Text>

              <Button variant="primary" as={Link} to="/calculate">
                Start New Calculation
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GetStartedPage;
