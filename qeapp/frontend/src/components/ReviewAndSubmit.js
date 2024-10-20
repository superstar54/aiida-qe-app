import React, { useState } from 'react';
import * as yaml from 'js-yaml';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const ReviewAndSubmit = ({ allStepsData = [] }) => {
  const [editableData, setEditableData] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // New state for submission status

  // Function to handle editing data
  const handleEdit = () => {
    setIsEditing(true);
    const accumulatedData = accumulateData(false);
    // Convert the accumulated data to YAML format
    const yamlData = yaml.dump(accumulatedData);
    setEditableData(yamlData);
  };

  // Function to save the edited data
  const handleSave = () => {
    try {
      const updatedData = yaml.load(editableData);
      // Update the allStepsData with edited data if necessary
      // For now, we'll just log it
      setIsEditing(false);
    } catch (error) {
      console.error('Error parsing YAML:', error);
      alert('Error parsing YAML. Please check your syntax.');
    }
  };

  // Function to accumulate data from all steps, with an option to include or exclude 'Select Structure'
  const accumulateData = (includeStructure = true) => {
    return Array.isArray(allStepsData)
      ? allStepsData.reduce((acc, step) => {
          if (step.title === 'Select Structure') {
            if (includeStructure) {
              acc[step.title] = step.data;
            }
          } else if (step.title !== 'Review and Submit') {
            acc[step.title] = step.data;
          }
          return acc;
        }, {})
      : {};
  };

  // Function to submit the data to the backend
  const handleSubmit = async () => {
    try {
      // Accumulate the data
      const accumulatedData = accumulateData();
  
      // Normalize keys in accumulatedData
      if (accumulatedData['Select Structure']) {
        accumulatedData['structure'] = accumulatedData['Select Structure'];
        delete accumulatedData['Select Structure'];
      }
      if (accumulatedData['Configure Workflow']) {
        accumulatedData['workflow_settings'] = accumulatedData['Configure Workflow'];
        delete accumulatedData['Configure Workflow'];
      }
      if (accumulatedData['Choose Computational Resources']) {
        accumulatedData['computational_resources'] = accumulatedData['Choose Computational Resources'];
        delete accumulatedData['Choose Computational Resources'];
      }
  
      // Send the data to the backend using fetch
      const response = await fetch('http://localhost:8000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accumulatedData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || `Server responded with ${response.status}, ${response.statusText}`;
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('Submission successful:', data);
      setSubmissionStatus('success');
      alert(`Calculation submitted successfully! Process PK: ${data.job_id}`);
    } catch (error) {
      console.error('Error submitting data:', error);
      setSubmissionStatus('error');
      alert(`Error submitting data: ${error.message}`);
    }
  };

  return (
    <div>
      <h3>Review and Submit</h3>
      {isEditing ? (
        <div>
          <textarea
            value={editableData}
            onChange={(e) => setEditableData(e.target.value)}
            rows={30}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
          <button className="btn btn-success mt-3" onClick={handleSave}>
            Save
          </button>
        </div>
      ) : (
        <div>
          <pre>{yaml.dump(accumulateData(false))}</pre>
          <button className="btn btn-primary mt-3 me-2" onClick={handleEdit}>
            Edit
          </button>
          <button
            className="btn btn-success mt-3"
            onClick={handleSubmit}
            disabled={submissionStatus === 'success'} // Disable button after success
          >
            Submit
          </button>
        </div>
      )}
      {/* Optionally, display submission status */}
      {submissionStatus === 'success' && (
        <div className="alert alert-success mt-3">
          Calculation submitted successfully!{' '}
          <Link to="/job-history">Go to Job History</Link>
        </div>
      )}
      {submissionStatus === 'error' && (
        <div className="alert alert-danger mt-3">
          Error submitting data. Please try again.
        </div>
      )}
    </div>
  );
};

export default ReviewAndSubmit;
