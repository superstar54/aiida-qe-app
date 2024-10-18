import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // To navigate back

const AddCode = () => {
  const [codeLabel, setCodeLabel] = useState('');
  const [execPath, setExecPath] = useState('');
  const [computer, setComputer] = useState('');
  const [computers, setComputers] = useState([]);
  const navigate = useNavigate();

  // Fetch the list of computers when the component mounts
  useEffect(() => {
    const fetchComputers = async () => {
      try {
        // Replace this mock data with your real API/database call
        const response = [
          { id: 1, name: 'Computer 1', hostname: 'localhost' },
          { id: 2, name: 'Computer 2', hostname: 'remotehost' },
        ];
        setComputers(response);
        if (response.length > 0) {
          setComputer(response[0].name); // Set the default selected computer
        }
      } catch (error) {
        console.error('Error fetching computers:', error);
      }
    };

    fetchComputers();
  }, []);

  const handleAddCode = (e) => {
    e.preventDefault();

    // Normally, you'd send this data to the backend to save
    console.log({
      id: Math.random(), // Generate unique id
      label: codeLabel,
      execPath,
      computer
    });

    // After saving, navigate back to the settings page
    navigate('/settings');
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
          <select
            className="form-control"
            value={computer}
            onChange={(e) => setComputer(e.target.value)}
          >
            {computers.length > 0 ? (
              computers.map((comp) => (
                <option key={comp.id} value={comp.name}>
                  {comp.name}
                </option>
              ))
            ) : (
              <option>No computers available</option>
            )}
          </select>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Save Code</button>
      </form>
    </div>
  );
};

export default AddCode;
