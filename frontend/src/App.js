import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import CalculationWizard from './components/CalculationWizard';
import GetStarted from './components/GetStarted';
import JobHistory from './components/JobHistory';
import Settings from './components/settings/Settings';
import AddComputer from './components/settings/AiiDAComputerSetup';
import AddCode from './components/settings/AiiDACodeSetup';
import './App.css';

function App() {
  // PUBLIC_URL is set to "/plugins/apps/qeapp" at build time
  const basename = process.env.PUBLIC_URL || '/';

  return (
    <Router basename={basename}>
      <div className="App">
        <Header />

        {/* Pretty Navbar using react-bootstrap */}
        <Navbar bg="primary" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="">
              Quantum ESPRESSO App
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="">
                  Get-Started
                </Nav.Link>
                <Nav.Link as={Link} to="calculate">
                  Calculate
                </Nav.Link>
                <Nav.Link as={Link} to="job-history">
                  Calculation History
                </Nav.Link>
                <Nav.Link as={Link} to="settings">
                  Settings
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div className="container mt-5">
          <Routes>
            <Route path="/" element={<GetStarted />} />
            <Route path="calculate/:jobId?" element={<CalculationWizard />} />
            <Route path="job-history" element={<JobHistory />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/add-computer" element={<AddComputer />} />
            <Route path="settings/add-code" element={<AddCode />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
