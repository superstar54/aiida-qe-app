import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import AccordionWizard from './components/AccordionWizard';
import GetStarted from './components/GetStarted';
import JobHistory from './components/JobHistory';
import Settings from './components/Settings';
import AddComputer from './components/AiiDAComputerSetup';
import AddCode from './components/AiiDACodeSetup';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />

        {/* Pretty Navbar using react-bootstrap */}
        <Navbar bg="primary" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand href="/">Quantum ESPRESSO App</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">Get-Started</Nav.Link>
                <Nav.Link as={Link} to="/calculate">Calculate</Nav.Link>
                <Nav.Link as={Link} to="/job-history">Job-History</Nav.Link>
                <Nav.Link as={Link} to="/settings">Settings</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div className="container mt-5">
          <Routes>
            <Route path="/" element={<GetStarted />} />
            <Route path="/calculate" element={<AccordionWizard />} />
            <Route path="/job-history" element={<JobHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/add-computer" element={<AddComputer />} />
            <Route path="/settings/add-code" element={<AddCode />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
