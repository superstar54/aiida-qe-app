import React from 'react';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
import StructureViewer from './StructureViewer';
import { parseXYZ, parseCIF, parseCube } from 'weas';

const StructureSelection = ({ data = {}, onDataChange }) => {
  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    onDataChange(newData);
  };

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

        // Update data with parsed structure
        console.log("parsedStructure: ", parsedStructure);
        handleChange('selectedStructure', parsedStructure);
      };

      // Read file as text
      fileReader.readAsText(file);
    }
  };

  const handleOptimadeSelect = () => {
    // Implement logic to select a structure from OPTIMADE
    const optimadeStructure = "Structure from OPTIMADE";
    handleChange('selectedStructure', optimadeStructure);
  };

  const handleAiiDaSelect = () => {
    // Implement logic to select a structure from AiiDA database
    const aiidaStructure = "Structure from AiiDA database";
    handleChange('selectedStructure', aiidaStructure);
  };

  const handleExampleSelect = () => {
    // Implement logic to select a structure from examples
    const exampleStructure = "Structure from example";
    handleChange('selectedStructure', exampleStructure);
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
      <StructureViewer structure={data.selectedStructure} />
    </div>
  );
};

export default StructureSelection;
