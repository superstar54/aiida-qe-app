import React, { useEffect, useState, useContext } from 'react';
import { Spinner } from 'react-bootstrap';
import { WizardContext } from '../wizard/WizardContext';

const TreeNode = ({ node }) => {
  if (Array.isArray(node)) {
    // If the node is an array, the first element is the node name,
    // and the second element is the children (which can be an array or a string)
    const [nodeName, children] = node;
    return (
      <li>
        <strong>{nodeName}</strong>
        {children && (
          <ul>
            {Array.isArray(children)
              ? children.map((child, index) => (
                  <TreeNode key={index} node={child} />
                ))
              : null}
          </ul>
        )}
      </li>
    );
  } else {
    // If the node is a string, simply render it
    return <li>{node}</li>;
  }
};

const JobStatusTab = ({}) => {
  const stepIndex = 4;
  const tabTitle = 'Job Status';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};
  
  const jobId = steps[3]?.data?.['Label and Submit']?.jobId || null;

  const [jobStatus, setJobStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;
    let isComponentMounted = true; // To prevent state updates after unmounting

    const fetchJobStatus = async () => {
      if (!isComponentMounted) return; // Prevent fetching if component is unmounted

      if (!jobId) {
        setLoading(false);
        return;
      }
      // setLoading(true);

      try {
        const response = await fetch(
          `./api/jobs-data/${jobId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }
        const data = await response.json();
        if (isComponentMounted) {
          setJobStatus(data.processStatus);
          setLoading(false);
          setError(null)
        }

        // Check if the job is finished
        if (isJobFinished(data.processStatus)) {
          handleChange('jobStatus', 'finished'); // Update job status in parent component
          clearInterval(intervalId); // Stop polling when job is finished
        }
      } catch (err) {
        if (isComponentMounted) {
          setError(err.message);
          setLoading(false);
        }
        // clearInterval(intervalId); // Stop polling on error
      }
    };

    // Start initial fetch
    fetchJobStatus();

    // Set up polling interval (e.g., every 5 seconds)
    intervalId = setInterval(fetchJobStatus, 5000);

    // Cleanup function to clear interval and prevent memory leaks
    return () => {
      isComponentMounted = false;
      clearInterval(intervalId);
    };
  }, [jobId]);

  // Function to determine if the job is finished
  const isJobFinished = (processStatus) => {
    // Implement logic to check if all processes are finished
    const traverse = (node) => {
      if (Array.isArray(node)) {
        const [nodeName, children] = node;
        // Check if nodeName contains "Finished", "Killed" or "Failed"
        const isFinished = nodeName.includes('Finished');
        if (!isFinished) return false;
        if (children && Array.isArray(children)) {
          return children.every(traverse);
        }
        return isFinished;
      } else if (typeof node === 'string') {
        return node.includes('Finished');
      }
      return false;
    };

    return traverse(processStatus);
  };

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    handleDataChange(stepIndex, tabTitle, newData);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <Spinner animation="border" variant="primary" />
        <p>Loading job status...</p>
      </div>
    );
  }
  

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!jobStatus) {
    return <div>No job status available.</div>;
  }

  return (
    <div>
      <h4>Job Status</h4>
      <ul style={{ listStyleType: 'none' }}>
        <TreeNode node={jobStatus} />
      </ul>
    </div>
  );
};

export default JobStatusTab;
