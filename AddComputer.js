import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To navigate back

const AddComputer = ({ onAddComputer }) => {
  const [computerName, setComputerName] = useState('');
  const [hostname, setHostname] = useState('');
  const [scheduler, setScheduler] = useState('slurm');
  const [transport, setTransport] = useState('ssh');
  const navigate = useNavigate();

  const handleAddComputer = (e) => {
    e.preventDefault();
    const newComputer = {
      id: Math.random(), // Generate a unique id (replace with proper id generation in a real app)
      name: computerName,
      hostname,
      scheduler,
      transport
    };
    onAddComputer(newComputer);
    navigate('/settings'); // Navigate back to the settings page after saving
  };

  return (
    <div>
      <h3>Add New Computer</h3>
      <form onSubmit={handleAddComputer}>
        <div className="form-group">
          <label>Computer Name</label>
          <input
            type="text"
            className="form-control"
            value={computerName}
            onChange={(e) => setComputerName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Hostname</label>
          <input
            type="text"
            className="form-control"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Scheduler</label>
          <select className="form-control" value={scheduler} onChange={(e) => setScheduler(e.target.value)}>
            <option value="slurm">Slurm</option>
            <option value="pbspro">PBS Pro</option>
            <option value="torque">Torque</option>
          </select>
        </div>
        <div className="form-group">
          <label>Transport</label>
          <select className="form-control" value={transport} onChange={(e) => setTransport(e.target.value)}>
            <option value="ssh">SSH</option>
            <option value="local">Local</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Save Computer</button>
      </form>
    </div>
  );
};

export default AddComputer;
