import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AccordionWizard from './wizard/AccordionWizard';
import initialStepsData from './InitialStepsData';
import { WizardProvider } from './wizard/WizardContext';



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
    <WizardProvider initialStepsData={initialStepsData} jobData={jobData}>
      <div>
        <AccordionWizard />
      </div>
    </WizardProvider>
  );
};

export default CalculationWizard;