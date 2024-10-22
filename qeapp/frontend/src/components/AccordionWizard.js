import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import AccordionStep from './wizard/AccordionStep';
import BasicSettingsTab from './workflow/BasicSettingsTab';
import AdvancedSettingsTab from './workflow/AdvancedSettingsTab';
import StructureSelection from './structure_selection/StructureSelection';
import ChooseResourcesTab from './computational_resources/ChooseResourcesTab';
import LabelGroupTab from './review_submit/LabelGroup';
import ReviewAndSubmitTab from './review_submit/ReviewAndSubmit';
import WorkflowSummaryTab from './results/WorkflowSummary';
import JobStatusTab from './results/JobStatus';
import FinalStructureTab from './results/FinalStructure';
import {SettingTab as BandsSettingTab} from './plugins/bands/Setting';
import {SettingTab as PdosSettingTab} from './plugins/pdos/Setting';
import {SettingTab as XpsSettingTab} from './plugins/xps/Setting';
import {ResultTab as XpsResultTab} from './plugins/xps/Result';

// Define steps and their dependent steps
const initialStepsData = [
  {
    title: 'Select Structure',
    id: "structure",
    tabs: [
      {
        "title": "Structure Selection", 
        "content": <StructureSelection />
      },
    ],
    dependents: [1, 2, 3],
    ButtonText: "Confirm",
  },
  {
    title: 'Configure Workflow',
    id: "workflow_settings",
    tabs: [
      { title: 'Basic workflow settings', content: <BasicSettingsTab /> },
      { title: 'Advanced workflow settings', content: <AdvancedSettingsTab /> },
      { title: 'Bands', content: <BandsSettingTab /> },
      { title: 'PDOS', content: <PdosSettingTab /> },
      { title: 'XPS', content: <XpsSettingTab /> },
    ],
    dependents: [2, 3],
    ButtonText: "Confirm",
  },
  {
    title: 'Choose Computational Resources',
    id: "computational_resources",
    tabs: [
      { title: 'Basic resource settings', content: <ChooseResourcesTab /> },
    ],
    dependents: [3],
    ButtonText: "Confirm",
  },
  {
    title: 'Review and Submit',
    id: "review_submit",
    tabs: [
      { title: 'Label and Submit', content: <LabelGroupTab /> },
      { title: 'Review settings', content: <ReviewAndSubmitTab /> },  // The review step shows all data.
    ],
    dependents: [],
    ButtonText: "Confirm",
  },
  {
    title: 'Status & Results',
    id: "status_results",
    tabs: [
      { title: 'Job status', content: <JobStatusTab /> },
      { title: 'Final structure', content: <FinalStructureTab /> },
      { title: 'XPS results', content: <XpsResultTab /> },
      // { title: 'Workflow summary', content: <WorkflowSummaryTab /> },
    ],
    dependents: [],
    ButtonText: null,
  }
];

const AccordionWizard = () => {
  const { jobId } = useParams();
  const [steps, setSteps] = useState(initialStepsData.map((step) => ({
    ...step,
    confirmed: false,
    modified: false,
    data: {} // Data for each step.
  })));
  const [activeStep, setActiveStep] = useState("0");

  useEffect(() => {
    if (jobId) {
      const fetchJobData = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/jobs-data/${jobId}`);
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          const jobData = await response.json();
          console.log("jobData", jobData);

          // Map jobData to steps, skipping the last step
        setSteps((prevSteps) =>
          prevSteps.map((step, index) => {
            if (index === prevSteps.length - 1) {
              // For the last step, do not confirm or set data
              return step;
            } else {
              return {
                ...step,
                confirmed: true,
                data: jobData.stepsData[step.id], // Adjust this if your data structure is different
              };
            }
          })
        );

          // Optionally set the active step to the last one
          setActiveStep((steps.length - 1).toString());
        } catch (err) {
          console.error(`Error fetching job data: ${err.message}`);
        }
      };

      fetchJobData();
    }
  }, [jobId]);

  // Function to handle data change in a step
  const handleDataChange = (stepIndex, dataUpdater) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      const existingData = updatedSteps[stepIndex].data || {};
      // Use dataUpdater to compute the new data
      updatedSteps[stepIndex].data = dataUpdater(existingData);
      return updatedSteps;
    });
  };

  // Function to confirm a step and pass data to the next step
  const handleConfirm = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[stepIndex].confirmed = true;
      console.log("index", stepIndex);
      console.log('Confirmed Steps:', updatedSteps);

      return updatedSteps;
    });
    
    // Move to the next step
    if (stepIndex < steps.length - 1) {
      setActiveStep((stepIndex + 1).toString());
    }
  };

  // Function to modify a previous step (reset data for subsequent steps)
  const handleModify = (stepIndex) => {
    setSteps((prevSteps) => {
      const updatedSteps = prevSteps.map((step, index) => {
        if (index === stepIndex) {
          // For the current step, only change confirmed and modified flags
          return { ...step, confirmed: false, modified: true };
        } else if (index > stepIndex) {
          // For subsequent steps, reset confirmed, modified, and data
          return { ...step, confirmed: false, modified: true, data: {} };
        }
        // For previous steps, return them as is
        return step;
      });
      return updatedSteps;
    });
  
    // Move back to the step being modified
    setActiveStep(stepIndex.toString());
  };

  return (
    <Accordion activeKey={activeStep} onSelect={(eventKey) => setActiveStep(eventKey)}>
      {steps.map((step, index) => (
        <AccordionStep
          key={index}
          stepNumber={index + 1}
          title={step.title}
          tabs={step.tabs}
          confirmed={step.confirmed}
          modified={step.modified}
          allStepsData={steps}
          onDataChange={(dataUpdater) => handleDataChange(index, dataUpdater)}
          onConfirm={() => handleConfirm(index)}
          onModify={() => handleModify(index)}
          disabled={index > 0 && !steps[index - 1].confirmed}
          ButtonText={step.ButtonText}
        />
      ))}
    </Accordion>
  );
};

export default AccordionWizard;
