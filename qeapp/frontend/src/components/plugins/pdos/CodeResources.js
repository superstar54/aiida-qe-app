import React from 'react';
import BaseCodeResourcesTab from '../../widgets/CodeResourcesTab';

const codesConfig = {
  projwfc: {
    label: 'qe-7.2-projwfc@localhost',
    nodes: 1,
    cpus: 1,
    codeOptions: ['qe-7.2-projwfc@localhost', 'qe-7.1-projwfc@remote'],
  },
  dos: {
    label: 'qe-7.2-dos@localhost',
    nodes: 1,
    cpus: 1,
    codeOptions: ['qe-7.2-dos@localhost', 'qe-7.1-dos@remote'],
  },
  // Add more default codes here if necessary
};

const CodeResourcesTab = (props) => {
  return <BaseCodeResourcesTab codesConfig={codesConfig} {...props} />;
};

export default CodeResourcesTab;
