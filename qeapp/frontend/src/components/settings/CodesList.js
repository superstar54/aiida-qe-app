import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CodesList = () => {
  const navigate = useNavigate();
  const [codes, setCodes] = useState([]);

  // Fetch codes when the component mounts
  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = () => {
    // Replace with actual API call
    fetch(`${process.env.REACT_APP_API_URL}/api/codes`)
      .then(response => response.json())
      .then(data => setCodes(data))
      .catch(error => console.error('Failed to fetch codes:', error));
  };

  // Function to handle deleting a code
  const handleDelete = (id) => {
    // Implement the API call to delete the code
    fetch(`${process.env.REACT_APP_API_URL}/api/codes/${id}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete code');
        }
        // Update the state to remove the deleted code
        setCodes(codes.filter(code => code.id !== id));
      })
      .catch(error => console.error('Failed to delete code:', error));
  };

  return (
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
              <td>{code.attributes.filepath_executable}</td>
              <td>{code.extras.computer}</td>
              <td>
                <button
                  className="button button-delete"
                  onClick={() => handleDelete(code.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <button
        className="button button-add"
        onClick={() => navigate('/settings/add-code')}
      >
        Add Code
      </button> */}
    </div>
  );
};

export default CodesList;
