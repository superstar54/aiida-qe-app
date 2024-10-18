import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To navigate to new pages
import DaemonControl from './DaemonControl';
import ComputersList from './ComputersList';
import CodesList from './CodesList';

const Settings = () => {

  return (
    <div>
      <h2>Settings</h2>
      <p>Manage your daemon, computers, and codes here.</p>

      {/* Daemon Control Section */}
      <DaemonControl />

      {/* Computers List Section */}
      <ComputersList />

      {/* Codes List Section */}
      <CodesList />
    </div>
  );
};

export default Settings;
