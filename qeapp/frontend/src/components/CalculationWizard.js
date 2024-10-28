import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AccordionWizard from './wizard/AccordionWizard';
import BasicSettingsTab from './workflow/BasicSettingsTab';
import AdvancedSettingsTab from './workflow/AdvancedSettingsTab';
import StructureSelection from './structure_selection/StructureSelection';
import CodeResourcesTab from './computational_resources/CodeResourcesTab';
import LabelGroupTab from './review_submit/LabelGroup';
import ReviewAndSubmitTab from './review_submit/ReviewAndSubmit';
import WorkflowSummaryTab from './results/WorkflowSummary';
import JobStatusTab from './results/JobStatus';
import FinalStructureTab from './results/FinalStructure';
// Import the dynamically discovered plugins
import plugins from './plugins';

// Define steps and their dependent steps
const initialStepsData = [
  {
    title: 'Select Structure',
    id: "structure",
    tabs: [
      {
        id: "structure",
        title: "Structure Selection", 
        content: <StructureSelection />
      },
    ],
    dependents: [1, 2, 3],
    ButtonText: "Confirm",
    data: {}
  },
  {
    title: 'Configure Workflow',
    id: "workflow_settings",
    tabs: [
      { abc: "basic", title: 'Basic workflow settings', content: <BasicSettingsTab /> },
      { id: "advanced", title: 'Advanced workflow settings', content: <AdvancedSettingsTab /> },
      // Dynamically add plugin settings tabs
      ...plugins.map(plugin => ({
        id: plugin.id,
        title: `${plugin.title} Settings`,
        content: <plugin.SettingTab />
      })),
    ],
    dependents: [2, 3],
    ButtonText: "Confirm",
    // retrieve the name and outlne of the plugins
    data: {"Basic workflow settings": {"plugins": plugins.map(plugin => ({id: plugin.id, outline: plugin.outline})),
                                       "properties": {}}}
  },
  {
    title: 'Choose Computational Resources',
    id: "computational_resources",
    tabs: [
      { id: "basic", title: 'Basic resource settings', content: <CodeResourcesTab /> },
      // Conditionally add plugin settings tabs
      ...plugins
      .filter(plugin => plugin.CodeResourcesTab) // Only include plugins with CodeResourcesTab
      .map(plugin => ({
        id: plugin.id,
        title: `${plugin.title} Resource Settings`,
        content: <plugin.CodeResourcesTab />
      })),
    ],
    dependents: [3],
    ButtonText: "Confirm",
    data: {}
  },
  {
    title: 'Review and Submit',
    id: "review_submit",
    tabs: [
      { id: "submit", title: 'Label and Submit', content: <LabelGroupTab /> },
      { id: "review", title: 'Review settings', content: <ReviewAndSubmitTab /> },  // The review step shows all data.
    ],
    dependents: [],
    ButtonText: "Confirm",
    data: {}
  },
  {
    title: 'Status & Results',
    id: "status_results",
    tabs: [
      { id: "status", title: 'Job status', content: <JobStatusTab /> },
      { id: "structure", title: 'Final structure', content: <FinalStructureTab /> },
      // Dynamically add plugin results tabs
      ...plugins.map(plugin => ({
        id: plugin.id,
        title: `${plugin.title} Results`,
        content: <plugin.ResultTab />
      })),
      // { title: 'Workflow summary', content: <WorkflowSummaryTab /> },
    ],
    dependents: [],
    ButtonText: null,
    data: {}
  }
];

const CalculationWizard = () => {
  const { jobId } = useParams();
  const [jobData, setJobData] = useState(null);

  useEffect(() => {
    if (jobId) {
      const fetchJobData = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/jobs-data/${jobId}`);
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          const data = await response.json();
          setJobData(data);
        } catch (err) {
          console.error(`Error fetching job data: ${err.message}`);
        }
      };
      fetchJobData();
    }
  }, [jobId]);

  return (
    <div>
      <AccordionWizard initialStepsData={initialStepsData} jobData={jobData}/>
    </div>
  );
};

export default CalculationWizard;