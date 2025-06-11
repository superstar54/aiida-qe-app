import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To navigate back

const AddCode = ({ onAddCode, computers }) => {
  const [codeLabel, setCodeLabel] = useState('');
  const [execPath, setExecPath] = useState('');
  const [computer, setComputer] = useState(computers.length ? computers[0].name : '');
  const navigate = useNavigate();

  const handleAddCode = (e) => {
    e.preventDefault();
    const newCode = {
      id: Math.random(), // Generate a unique id (replace with proper id generation in a real app)
      label: codeLabel,
      execPath,
      computer
    };
    onAddCode(newCode);
    navigate('/settings'); // Navigate back to the settings page after saving
  };

  return (
    <div>
      <h3>Add New Code</h3>
      <form onSubmit={handleAddCode}>
        <div className="form-group">
          <label>Code Label</label>
          <input
            type="text"
            className="form-control"
            value={codeLabel}
            onChange={(e) => setCodeLabel(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Executable Path</label>
          <input
            type="text"
            className="form-control"
            value={execPath}
            onChange={(e) => setExecPath(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Computer</label>
          <select className="form-control" value={computer} onChange={(e) => setComputer(e.target.value)}>
            {computers.map((comp) => (
              <option key={comp.id} value={comp.name}>{comp.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Save Code</button>
      </form>
    </div>
  );
};

export default AddCode;
