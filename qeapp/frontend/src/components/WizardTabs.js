import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

const WizardTabs = ({ tabs, stepData, allStepsData, onDataChange }) => {
  const [key, setKey] = useState(tabs[0].title);
  
  // Extract protocol from stepData, pass it to tabs
  const protocol = allStepsData[1].data["Basic workflow settings"]?.protocol || 'moderate';
  const structure = allStepsData[0].data["Structure Selection"]?.selectedStructure || null;
  const jobID = allStepsData[3].data["Review settings"]?.jobId || null;
  const jobStatus = allStepsData[4].data["Job status"]?.jobStatus || null;

  return (
    <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
      {tabs.map((tab, index) => (
        <Tab eventKey={tab.title} title={tab.title} key={index}>
          {React.cloneElement(tab.content, {
            data: stepData[tab.title] || {},
            protocol,
            structure,
            onDataChange: (newData) => {
              // Define dataUpdater inline
              const dataUpdater = (prevData) => ({
                ...prevData,
                [tab.title]: newData,
              });
              // Pass dataUpdater to onDataChange from AccordionStep
              onDataChange(dataUpdater);
            },
            allStepsData, // Full steps data
            jobID: jobID,
            jobStatus: jobStatus,
          })}
        </Tab>
      ))}
    </Tabs>
  );
};

export default WizardTabs;
