import React, { useEffect, useState, useContext, useRef } from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation
import { WizardContext } from '../wizard/WizardContext';
import { accumulateData } from './utils';
const baseURL = process.env.PUBLIC_URL || '';

function getChemicalFormula(symbols) {
  const elementCounts = {};

  // Count occurrences of each element
  symbols.forEach(symbol => {
      elementCounts[symbol] = (elementCounts[symbol] || 0) + 1;
  });

  // Construct the chemical formula
  let formula = '';
  for (const [element, count] of Object.entries(elementCounts)) {
      formula += element + (count > 1 ? count : '');
  }

  return formula;
}

const LabelGroupTab = ({}) => {
  const stepIndex = 3;
  const tabTitle = 'Label and Submit';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};
  const structure = steps[0]?.data?.['Structure Selection']?.selectedStructure || null;

  const [submissionStatus, setSubmissionStatus] = useState(null); // New state for submission status
  const [loading, setLoading] = useState(false); // New loading state

  const defaultData = {
    label: '',
    description: '',
  };
  // Use useRef to track if it's the initial mount
  const isInitialMount = useRef(true);

  const handleSubmit = async () => {
    try {
      setLoading(true); // Set loading state to true when submission starts

      const accumulatedData = accumulateData(steps);

      // Send the data to the backend using fetch
      const response = await fetch(`${baseURL}/api/submit_workgraph`, {
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

  useEffect(() => {
    if (isInitialMount.current && data?.label !== undefined) {
      isInitialMount.current = false;
      return; // Skip the effect on the initial mount
    }
    if (!structure) {
      return;
    }
    const formula = getChemicalFormula(structure.symbols);
    const initialData = { ...defaultData, ...data };
    const newData = { ...initialData, label: formula };
    handleDataChange(stepIndex, tabTitle, newData);
  }, [structure]);

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    handleDataChange(stepIndex, tabTitle, newData);
  };

  return (
    <div>
      <Form>
        {/* Labeling Job Section */}
        <h4>Labeling Your Job</h4>
        <Form.Group className="mb-3">
          <Form.Label>Label:</Form.Label>
          <Form.Control
            type="text"
            value={data.label || ""}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Enter job label"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={data.description || ""}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter job description"
          />
        </Form.Group>
      </Form>
      <div>
        <button
          className="btn btn-success mt-3"
          onClick={handleSubmit}
          disabled={loading || submissionStatus === 'success'} // Disable the button while loading
        >
          {loading ? 'Submitting...' : 'Submit'} {/* Show loading text if submitting */}
        </button>
      </div>
      <div>
        {/* Display loading spinner or message while waiting */}
        {loading && <div className="alert alert-info mt-3">Submitting your data, please wait...</div>}

        {/* Optionally, display submission status */}
        {submissionStatus === 'success' && (
          <div className="alert alert-success mt-3">
            Calculation submitted successfully!{' '}
            <Link to="/job-history">Go to Calculation History</Link>, or click the Confirm button and go to the job status and results step.
          </div>
        )}
        {submissionStatus === 'error' && (
          <div className="alert alert-danger mt-3">
            Error submitting data. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelGroupTab;
