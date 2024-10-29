import React, { useState, useContext } from 'react';
import * as yaml from 'js-yaml';
import { WizardContext } from '../wizard/WizardContext';

const ReviewAndSubmitTab = ({data = {}, onDataChange }) => {
  const { steps } = useContext(WizardContext);
  const [editableData, setEditableData] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const accumulateData = (includeStructure = true) => {
    return Array.isArray(steps)
      ? steps.reduce((acc, step) => {
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

  

  return (
    <div>
      <h3>Review and Edit</h3>
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
        </div>
      )}

      
    </div>
  );
};

export default ReviewAndSubmitTab;
