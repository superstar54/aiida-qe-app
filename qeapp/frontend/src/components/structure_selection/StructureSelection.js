import React, { useState } from 'react';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
import StructureViewer from '../StructureViewer';
import { parseXYZ, parseCIF, parseCube } from 'weas';


const exampleFiles = [
  { name: "Bulk silicon (primitive cell)", path: '/example_structures/Si.cif', type: 'cif' },
  { name: "Silicon oxide (alpha quartz)", path: '/example_structures/SiO2.cif', type: 'cif' },
  { name: "Diamond (primitive cell)", path: '/example_structures/Diamond.cif', type: 'cif' },
  { name: "ETFA molecule", path: '/example_structures/ETFA.xyz', type: 'xyz' },
  // { name: "Gallium arsenide (primitive cell)", path: '/example_structures/GaAs.cif', type: 'cif' },
  // { name: "Gold (conventional cell)", path: '/example_structures/Au.xyz', type: 'cif' },
  // { name: "Cobalt (primitive cell)", path: '/example_structures/Co.xyz', type: 'cif' },
];

const StructureSelection = ({ data = {}, onDataChange }) => {
  const [selectedExample, setSelectedExample] = useState(null); // State to store selected example

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    onDataChange(newData);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const content = e.target.result;
        const fileType = file.name.split('.').pop().toLowerCase();

        let parsedStructure = null;
        if (fileType === 'xyz') {
          parsedStructure = parseXYZ(content);
          // if parsedStructure is a array of structures, we only take the first one
          if (Array.isArray(parsedStructure)) {
            console.log("Multiple structures found in the XYZ file. Using the first one.");
            parsedStructure = parsedStructure[0];
          }
        } else if (fileType === 'cif') {
          parsedStructure = parseCIF(content);
        } else if (fileType === 'cube') {
          parsedStructure = parseCube(content);
        } else {
          alert("Unsupported file format. Please upload an XYZ, CIF, or Cube file.");
          return;
        }

        handleChange('selectedStructure', parsedStructure);
      };

      fileReader.readAsText(file);
    }
  };

  const handleOptimadeSelect = () => {
    const optimadeStructure = "Structure from OPTIMADE";
    handleChange('selectedStructure', optimadeStructure);
  };

  const handleAiiDaSelect = () => {
    const aiidaStructure = "Structure from AiiDA database";
    handleChange('selectedStructure', aiidaStructure);
  };

  // Handle selecting an example structure
  const handleExampleSelect = (selectedName) => {
    const example = exampleFiles.find(file => file.name === selectedName);

    if (example) {
      fetch(example.path)
        .then((response) => response.text())
        .then((content) => {
          let parsedStructure = null;
          if (example.type === 'xyz') {
            parsedStructure = parseXYZ(content);
            if (Array.isArray(parsedStructure)) {
              console.log("Multiple structures found in the XYZ file. Using the first one.");
              parsedStructure = parsedStructure[0];
            }
          } else if (example.type === 'cif') {
            parsedStructure = parseCIF(content);
          }

          setSelectedExample(selectedName);
          handleChange('selectedStructure', parsedStructure);
        })
        .catch((error) => {
          console.error("Error fetching example file:", error);
        });
    }
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
          <Form.Group controlId="exampleSelect" className="mb-3">
            <Form.Label>Select an example structure:</Form.Label>
            <Form.Control
              as="select"
              value={selectedExample || ''}
              onChange={(e) => handleExampleSelect(e.target.value)}
            >
              <option value="" disabled>Select a structure</option>
              {exampleFiles.map((file) => (
                <option key={file.name} value={file.name}>
                  {file.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Tab>
      </Tabs>

      {/* Structure Viewer Section */}
      <StructureViewer structure={data.selectedStructure} />
    </div>
  );
};

export default StructureSelection;
