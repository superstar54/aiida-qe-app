import React, { useState } from 'react';
import * as yaml from 'js-yaml';

const ReviewAndSubmit = ({ allStepsData = [] }) => {
  const [editableData, setEditableData] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // New state for submission status

  console.log('All Steps Data:', allStepsData);

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
      console.log('Updated Data:', updatedData);
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
  const handleSubmit = () => {
    // Accumulate the data
    const accumulatedData = accumulateData();
    // change the 'Select Structure' key to 'Structure' if it exists
    if (accumulatedData['Select Structure']) {
      accumulatedData['structure'] = accumulatedData['Select Structure'];
      delete accumulatedData['Select Structure'];
    }
    // change the 'Configure Workflow' key to 'Workflow_settings' if it exists
    if (accumulatedData['Configure Workflow']) {
      accumulatedData['workflow_settings'] = accumulatedData['Configure Workflow'];
      delete accumulatedData['Configure Workflow'];
    }
    // change the 'Choose Computational Resources' key to 'Computational_Resources' if it exists
    if (accumulatedData['Choose Computational Resources']) {
      accumulatedData['computational_resources'] = accumulatedData['Choose Computational Resources'];
      delete accumulatedData['Choose Computational Resources'];
    }
    console.log('Accumulated Data:', accumulatedData);


    // Send the data to the backend using fetch
    fetch('http://localhost:8000/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accumulatedData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Submission successful:', data);
        setSubmissionStatus('success');
        // Optionally, redirect or show success message
        // also show the `job_id` returned from the server
        alert(`Calculation submitted successfully! Process PK: ${data.job_id}`);
      })
      .catch((error) => {
        console.error('Error submitting data:', error);
        setSubmissionStatus('error');
        alert('Error submitting data. Please try again.');
      });
  };

  return (
    <div>
      <h3>Review and Submit</h3>
      {isEditing ? (
        <div>
          <textarea
            value={editableData}
            onChange={(e) => setEditableData(e.target.value)}
            rows={10}
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
          <button className="btn btn-success mt-3" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
      {/* Optionally, display submission status */}
      {submissionStatus === 'success' && (
        <div className="alert alert-success mt-3">
          Calculation submitted successfully!
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
