import React, { useState } from 'react';
import * as yaml from 'js-yaml';

const ReviewAndSubmit = ({ allStepsData = []}) => {
  const [editableData, setEditableData] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  console.log('All Steps Data:', allStepsData);

  // Function to handle editing data
  const handleEdit = () => {
    setIsEditing(true);
    const accumulatedData = Array.isArray(allStepsData)
      ? allStepsData.reduce((acc, step) => {
          if (step.title === 'Select Structure') return acc;
          acc[step.title] = step.data; // Accumulate step data
          return acc;
        }, {})
      : {};

    // Convert the accumulated data to YAML format
    const yamlData = yaml.dump(accumulatedData);
    setEditableData(yamlData);
  };

  // Function to save the edited data
  const handleSave = () => {
    setIsEditing(false);
    // Optionally, handle the save logic here, such as sending the updated data to a backend
    try {
      const updatedData = yaml.load(editableData);
      console.log('Updated Data:', updatedData); // Handle updated data
    } catch (error) {
      console.error('Error parsing YAML:', error);
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
            rows={10}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
          <button className="btn btn-success mt-3" onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div>
          <pre>{yaml.dump(Array.isArray(allStepsData) ? allStepsData.reduce((acc, step) => {
            // skip if the title is "Select Structure"
            if (step.title === 'Select Structure') return acc;
            acc[step.title] = step.data;
            return acc;
          }, {}) : {})}</pre>
          <button className="btn btn-primary mt-3" onClick={handleEdit}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default ReviewAndSubmit;
