import React, { useState } from 'react';
import * as yaml from 'js-yaml';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const ReviewAndSubmit = ({ allStepsData = [], data = {}, onDataChange }) => {
  const [editableData, setEditableData] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // New state for submission status
  const [loading, setLoading] = useState(false); // New loading state

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    console.log('New data:', newData);
    onDataChange(newData);
  };

  const handleEdit = () => {
    setIsEditing(true);
    const accumulatedData = accumulateData(false);
    const yamlData = yaml.dump(accumulatedData);
    setEditableData(yamlData);
  };

  const handleSave = () => {
    try {
      const updatedData = yaml.load(editableData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error parsing YAML:', error);
      alert('Error parsing YAML. Please check your syntax.');
    }
  };

  const accumulateData = (includeStructure = true) => {
    return Array.isArray(allStepsData)
      ? allStepsData.reduce((acc, step) => {
          if (step.title === 'Select Structure') {
            if (includeStructure) {
              acc[step.title] = step.data;
            }
          } else {
            acc[step.title] = step.data;
          }
          return acc;
        }, {})
      : {};
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); // Set loading state to true when submission starts

      const accumulatedData = accumulateData();

      // Normalize keys in accumulatedData (as you have done in your existing code)
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
      if (accumulatedData['Review and Submit']) {
        accumulatedData['review_submit'] = accumulatedData['Review and Submit'];
        delete accumulatedData['Review and Submit'];
      }
      if (accumulatedData['Status & Results']) {
        accumulatedData['status_results'] = accumulatedData['Status & Results'];
        delete accumulatedData['Status & Results'];
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
      setLoading(false); // Set loading to false after successful submission
      // alert(`Calculation submitted successfully! Process PK: ${data.job_id}`);
      handleChange('jobId', data.job_id); // Update the job_id in the parent component
    } catch (error) {
      console.error('Error submitting data:', error);
      setLoading(false); // Set loading to false if there's an error
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
            disabled={loading || submissionStatus === 'success'} // Disable the button while loading
          >
            {loading ? 'Submitting...' : 'Submit'} {/* Show loading text if submitting */}
          </button>
        </div>
      )}

      {/* Display loading spinner or message while waiting */}
      {loading && <div className="alert alert-info mt-3">Submitting your data, please wait...</div>}

      {/* Optionally, display submission status */}
      {submissionStatus === 'success' && (
        <div className="alert alert-success mt-3">
          Calculation submitted successfully!{' '}
          <Link to="/job-history">Go to Job History</Link>, or click the Confirm button and go to the job status and results step.
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
