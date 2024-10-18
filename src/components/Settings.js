import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To navigate to new pages
import DaemonControl from './DaemonControl';

const Settings = () => {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([
    // Mock data for workers, should come from an API
    { pid: 1234, mem: 20.5, cpu: 30.2, started: 1625734800 },
    { pid: 5678, mem: 25.1, cpu: 40.0, started: 1625734900 },
  ]);
  // Local state for computers and codes in the Settings page
  const [computers, setComputers] = useState([]);
  const [codes, setCodes] = useState([]);

  // Fetch computers and codes when the component mounts
  useEffect(() => {
    // Fetch computers and codes from the backend or local storage
    fetchComputers();
    fetchCodes();
  }, []);

  const fetchComputers = () => {
    // Simulate fetching data from an API
    const fetchedComputers = [
      { id: 1, name: 'Computer 1', hostname: 'localhost', scheduler: 'slurm', transport: 'ssh' },
      { id: 2, name: 'Computer 2', hostname: 'remotehost', scheduler: 'pbspro', transport: 'ssh' }
    ];
    setComputers(fetchedComputers);
  };

  const fetchCodes = () => {
    // Simulate fetching data from an API
    const fetchedCodes = [
      { id: 1, label: 'pw.x', execPath: '/usr/bin/pw.x', computer: 'Computer 1' },
      { id: 2, label: 'projwfc.x', execPath: '/usr/bin/projwfc.x', computer: 'Computer 2' }
    ];
    setCodes(fetchedCodes);
  };

  // Function to handle deleting a computer or code
  const handleDelete = (id, type) => {
    if (type === 'computer') {
      setComputers(computers.filter(computer => computer.id !== id));
    } else if (type === 'code') {
      setCodes(codes.filter(code => code.id !== id));
    }
  };

  return (
    <div>
      <h2>Settings</h2>
      <p>Manage your daemon, computers, and codes here.</p>

      {/* Daemon Control Section */}
      <DaemonControl workers={workers} handleDaemonControl={() => {}} adjustWorkers={() => {}} />

      {/* Computers Table */}
      <div className="mt-4">
        <h3>Available Computers</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Hostname</th>
              <th>Scheduler</th>
              <th>Transport</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {computers.map((computer) => (
              <tr key={computer.id}>
                <td>{computer.name}</td>
                <td>{computer.hostname}</td>
                <td>{computer.scheduler}</td>
                <td>{computer.transport}</td>
                <td>
                  <button className="button button-delete" onClick={() => handleDelete(computer.id, 'computer')}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="button button-add" onClick={() => navigate('/settings/add-computer')}>
          Add Computer
        </button>
      </div>

      {/* Codes Table */}
      <div className="mt-4">
        <h3>Available Codes</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Executable Path</th>
              <th>Computer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code.id}>
                <td>{code.label}</td>
                <td>{code.execPath}</td>
                <td>{code.computer}</td>
                <td>
                  <button className="button button-delete" onClick={() => handleDelete(code.id, 'code')}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="button button-add" onClick={() => navigate('/settings/add-code')}>
          Add Code
        </button>
      </div>
    </div>
  );
};

export default Settings;
