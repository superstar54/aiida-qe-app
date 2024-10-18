import React from 'react';
import Tabs from './Tabs';

const Step = ({ stepNumber, title, tabs }) => {
  return (
    <div className="step">
      <h2>Step {stepNumber}: {title}</h2>
      <Tabs tabs={tabs} />
    </div>
  );
};

export default Step;
