// WizardTabs.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { WizardContext } from './WizardContext';

const WizardTabs = ({ stepIndex }) => {
  const { steps, handleDataChange } = useContext(WizardContext);
  const step = steps[stepIndex];
  const { tabs, data: stepData } = step;

  const properties = steps[1]?.data?.['Basic workflow settings']?.properties || {};

  const filteredTabs = tabs.filter((tab) => {
    if (tab.id && properties.hasOwnProperty(tab.id)) {
      return properties[tab.id];
    }
    return true;
  });

  const [key, setKey] = useState(filteredTabs.length > 0 ? filteredTabs[0].title : '');

  useEffect(() => {
    const isActiveKeyValid = filteredTabs.some((tab) => tab.title === key);
    if (!isActiveKeyValid) {
      setKey(filteredTabs.length > 0 ? filteredTabs[0].title : '');
    }
  }, [filteredTabs, key]);

  return (
    <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
      {filteredTabs.map((tab, index) => (
        <Tab eventKey={tab.title} title={tab.title} key={index}>
          {React.cloneElement(tab.content, {
            data: stepData[tab.title] || {},
            onDataChange: (newData) => {
              const dataUpdater = (prevData) => ({
                ...prevData,
                [tab.title]: newData,
              });
              handleDataChange(stepIndex, dataUpdater);
            },
          })}
        </Tab>
      ))}
      {filteredTabs.length === 0 && (
        <div className="text-center p-3">
          <p>No available tabs based on the selected properties.</p>
        </div>
      )}
    </Tabs>
  );
};

export default WizardTabs;
