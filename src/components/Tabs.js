import React, { useState } from 'react';

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <ul className="tabs">
        {tabs.map((tab, index) => (
          <li key={index} className={activeTab === index ? 'active' : ''} onClick={() => setActiveTab(index)}>
            {tab.title}
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;
