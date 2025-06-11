import React, { useEffect, useState, useContext } from 'react';
import BaseCodeResourcesTab from '../../widgets/CodeResourcesTab';
import { WizardContext } from '../../wizard/WizardContext';

const baseURL = process.env.PUBLIC_URL || '';

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
  const stepIndex = 2;
  const tabTitle = 'PDOS Resource Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};
  
  const [codes, setCodes] = useState([]);

  // Fetch codes when the component mounts
  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = () => {
    fetch(`${baseURL}/api/codes`)
      .then(response => response.json())
      .then(data => setCodes(data))
      .catch(error => console.error('Failed to fetch codes:', error));
  };

  return (
    <BaseCodeResourcesTab 
      codesConfig={codesConfig} 
      codes={codes} 
      data={data}
      onDataChange={(newData) => handleDataChange(stepIndex, tabTitle, newData)}
    />
  );
};

export default CodeResourcesTab;
