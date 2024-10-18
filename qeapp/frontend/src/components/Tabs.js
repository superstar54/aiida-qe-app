import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

const WizardTabs = ({ tabs, stepData, allStepsData, onDataChange }) => {
  const [key, setKey] = useState(tabs[0].title);

  return (
    <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
      {tabs.map((tab, index) => (
        <Tab eventKey={tab.title} title={tab.title} key={index}>
          {React.cloneElement(tab.content, {
            data: stepData[tab.title] || {},
            onDataChange: (newData) => {
              onDataChange({ ...stepData, [tab.title]: newData });
            },
            allStepsData,  // Full steps data
          })}
        </Tab>
      ))}
    </Tabs>
  );
};

export default WizardTabs;
