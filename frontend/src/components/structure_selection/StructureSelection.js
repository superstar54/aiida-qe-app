import React, { useState, useContext } from 'react';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
import StructureViewer from '../widgets/StructureViewer';
import { parseXYZ, parseCIF, parseCube } from 'weas';
import { WizardContext } from '../wizard/WizardContext';

const baseURL = process.env.PUBLIC_URL || '';

const exampleFiles = [
  { name: "Bulk silicon (primitive cell)", path: `${baseURL}/example_structures/Si.cif`, type: 'cif' },
  { name: "Silicon oxide (alpha quartz)", path: `${baseURL}/example_structures/SiO2.cif`, type: 'cif' },
  { name: "Diamond (primitive cell)", path: `${baseURL}/example_structures/Diamond.cif`, type: 'cif' },
  { name: "ETFA molecule", path: `${baseURL}/example_structures/ETFA.xyz`, type: 'xyz' },
  // { name: "Gallium arsenide (primitive cell)", path: `${baseURL}/example_structures/GaAs.cif`, type: 'cif' },
  // { name: "Gold (conventional cell)", path: `${baseURL}/example_structures/Au.xyz`, type: 'cif' },
  // { name: "Cobalt (primitive cell)", path: `${baseURL}/example_structures/Co.xyz`, type: 'cif' },
];

const StructureSelection = ({}) => {
  const stepIndex = 0;
  const tabTitle = 'Structure Selection';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};

  const [selectedExample, setSelectedExample] = useState(null); // State to store selected example

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    handleDataChange(stepIndex, tabTitle, newData);
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

        handleChange('selectedStructure', parsedStructure.toDict());
      };

      fileReader.readAsText(file);
    }
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
          handleChange('selectedStructure', parsedStructure.toDict());
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
