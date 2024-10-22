import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

const WizardTabs = ({ tabs, stepData, allStepsData, onDataChange }) => {
  // Extract properties from allStepsData
  const properties = allStepsData[1]?.data?.["Basic workflow settings"]?.properties || {};
  // Filter tabs based on properties
  const filteredTabs = tabs.filter((tab) => {
    // If the tab has an id and it's in properties, check its value
    if (tab.id && properties.hasOwnProperty(tab.id)) {
      return properties[tab.id];
    }
    // If no property is associated, keep the tab
    return true;
  });

  // State to manage the active tab key
  const [key, setKey] = useState(filteredTabs.length > 0 ? filteredTabs[0].title : '');

  // Effect to handle changes in filteredTabs and ensure active tab is valid
  useEffect(() => {
    // If the current active key is not in filteredTabs, set it to the first tab
    const isActiveKeyValid = filteredTabs.some((tab) => tab.title === key);
    if (!isActiveKeyValid) {
      setKey(filteredTabs.length > 0 ? filteredTabs[0].title : '');
    }
  }, [filteredTabs, key]);


  // Extract other necessary data
  const protocol = allStepsData[1]?.data?.["Basic workflow settings"]?.protocol || 'moderate';
  const structure = allStepsData[0]?.data?.["Structure Selection"]?.selectedStructure || null;
  const JobId = allStepsData[3]?.data?.["Label and Submit"]?.jobId || null;
  const jobStatus = allStepsData[4]?.data?.["Job status"]?.jobStatus || null;

  return (
    <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
      {filteredTabs.map((tab, index) => (
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
            JobId: JobId,
            jobStatus: jobStatus,
          })}
        </Tab>
      ))}
      {/* Optionally, handle the case when no tabs are available */}
      {filteredTabs.length === 0 && (
        <div className="text-center p-3">
          <p>No available tabs based on the selected properties.</p>
        </div>
      )}
    </Tabs>
  );
};

export default WizardTabs;
