
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AccordionWizard from './wizard/AccordionWizard';
import { WizardProvider } from './wizard/WizardContext';
import { makeInitialStepsData } from './InitialStepsData';

const CalculationWizard = () => {
  const { jobId } = useParams();
  const [jobData, setJobData] = useState(null);
  const [pluginIds, setPluginIds] = useState(null);
  const [stepsData, setStepsData] = useState([]);

  useEffect(() => {
    if (!jobId) return;
    const fetchJobData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/jobs-data/${jobId}`
        );
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
  }, [jobId]);

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        console.log('Fetching plugins from /plugins endpoint...');
        const res = await fetch('http://localhost:8001/plugins');
        console.log('Response from /plugins:', res);
        if (!res.ok) {
          throw new Error(`Failed to fetch plugins: ${res.status}`);
        }
        const { plugins = [] } = await res.json();
        console.log('Fetched plugins:', plugins);
        setPluginIds(plugins);
      } catch (err) {
        console.error('Error fetching plugins:', err.message);
        // console.error(err);
        setPluginIds([]);
      }
    };
    fetchPlugins();
  }, []);

  useEffect(() => {
    if (pluginIds === null) return;
    console.log('Plugin IDs:', pluginIds);
    const data = makeInitialStepsData(pluginIds);
    console.log('Initial steps data:', data);
    setStepsData(data);
  }, [pluginIds]);

  if (pluginIds === null) {
    return <div>Loading plugins…</div>;
  }

  return (
    <WizardProvider initialStepsData={stepsData} jobData={jobData}>
      <div>
        <AccordionWizard />
      </div>
    </WizardProvider>
  );
};

export default CalculationWizard;
