import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ComputersList = () => {
  const navigate = useNavigate();
  const [computers, setComputers] = useState([]);

  // Fetch computers when the component mounts
  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = () => {
    // Replace with actual API call
    fetch('http://localhost:8000/api/computers')
      .then(response => response.json())
      .then(data => setComputers(data))
      .catch(error => console.error('Failed to fetch computers:', error));
  };

  // Function to handle deleting a computer
  const handleDelete = (id) => {
    // Implement the API call to delete the computer
    fetch(`http://localhost:8000/api/computers/${id}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete computer');
        }
        // Update the state to remove the deleted computer
        setComputers(computers.filter(computer => computer.id !== id));
      })
      .catch(error => console.error('Failed to delete computer:', error));
  };

  return (
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
              <td>{computer.label}</td>
              <td>{computer.hostname}</td>
              <td>{computer.scheduler_type}</td>
              <td>{computer.transport_type}</td>
              <td>
                <button
                  className="button button-delete"
                  onClick={() => handleDelete(computer.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="button button-add"
        onClick={() => navigate('/settings/add-computer')}
      >
        Add Computer
      </button>
    </div>
  );
};

export default ComputersList;
