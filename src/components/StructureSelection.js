import React, { useState } from 'react';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
import StructureViewer from './StructureViewer';
import { parseXYZ, parseCIF, parseCube } from 'weas';

const StructureSelection = () => {
  const [selectedStructure, setSelectedStructure] = useState(null);

  // Function to handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    console.log("Selected file: ", file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const content = e.target.result;
        const fileType = file.name.split('.').pop().toLowerCase();

        // Determine file type and parse structure accordingly
        let parsedStructure = null;
        if (fileType === 'xyz') {
          parsedStructure = parseXYZ(content);  // Parse XYZ file
        } else if (fileType === 'cif') {
          parsedStructure = parseCIF(content);  // Parse CIF file
        } else if (fileType === 'cube') {
          parsedStructure = parseCube(content);  // Parse Cube file
        } else {
          alert("Unsupported file format. Please upload an XYZ, CIF, or Cube file.");
          return;
        }

        // Set parsed structure
        console.log("parsedStructure: ", parsedStructure);
        setSelectedStructure(parsedStructure);
      };

      // Read file as text
      fileReader.readAsText(file);
    }
  };

  const handleOptimadeSelect = () => {
    setSelectedStructure("Structure from OPTIMADE");
  };

  const handleAiiDaSelect = () => {
    setSelectedStructure("Structure from AiiDA database");
  };

  const handleExampleSelect = () => {
    setSelectedStructure("Structure from example");
  };

  return (
    <div>
      <Tabs defaultActiveKey="upload" id="structure-selection-tabs" className="mb-3">
        <Tab eventKey="upload" title="Upload file">
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Upload a structure file:</Form.Label>
            <Form.Control type="file" onChange={handleFileUpload} />
          </Form.Group>
        </Tab>

        <Tab eventKey="optimade" title="OPTIMADE">
          <Button variant="primary" onClick={handleOptimadeSelect}>
            Select Structure from OPTIMADE
          </Button>
        </Tab>

        <Tab eventKey="aiida" title="AiiDA database">
          <Button variant="primary" onClick={handleAiiDaSelect}>
            Select Structure from AiiDA database
          </Button>
        </Tab>

        <Tab eventKey="examples" title="From Examples">
          <Button variant="primary" onClick={handleExampleSelect}>
            Select Structure from Examples
          </Button>
        </Tab>
      </Tabs>


      {/* Structure Viewer Section */}
      <StructureViewer structure={selectedStructure} />
    </div>
  );
};

export default StructureSelection;
