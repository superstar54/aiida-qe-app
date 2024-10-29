import React, { useEffect, useState } from 'react';
import BaseCodeResourcesTab from '../../widgets/CodeResourcesTab';

const codesConfig = {
  projwfc: {
    label: 'qe-7.2-projwfc@localhost',
    input_plugin: "quantumespresso.projwfc",
    nodes: 1,
    cpus: 1,
    codeOptions: [],
  },
  dos: {
    label: 'qe-7.2-dos@localhost',
    input_plugin: "quantumespresso.dos",
    nodes: 1,
    cpus: 1,
    codeOptions: [],
  },
  // Add more default codes here if necessary
};

const CodeResourcesTab = (props) => {
  const [codes, setCodes] = useState([]);

  // Fetch codes when the component mounts
  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = () => {
    fetch('http://localhost:8000/api/codes')
      .then(response => response.json())
      .then(data => setCodes(data))
      .catch(error => console.error('Failed to fetch codes:', error));
  };

  return (
    <BaseCodeResourcesTab 
      codesConfig={codesConfig} 
      codes={codes} 
      {...props} 
    />
  );
};

export default CodeResourcesTab;
