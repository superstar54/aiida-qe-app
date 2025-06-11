import React, { useState, useEffect, useContext } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import BandsPdosPlot from '../../widgets/BandsPdosPlot';
import { WizardContext } from '../../wizard/WizardContext';

const BandsPdosContainer = () => {
  const { steps } = useContext(WizardContext);
  const jobId = steps[3]?.data?.['Label and Submit']?.jobId || null;
  const jobStatus = steps[4]?.data?.['Job Status']?.jobStatus || null;

  const [bandsData, setBandsData] = useState(null);
  const [pdosData, setPdosData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all data once when the component mounts or jobId changes
  useEffect(() => {
    if (jobId && jobStatus === 'finished') {
      fetchData();
    }
  }, [jobId, jobStatus]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`./api/electronic_structure/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      console.log("electronic_structure data: ", data);
      setBandsData(data.bands_data);
      setPdosData(data.pdos_data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {(!bandsData && !pdosData) && !loading && !error && <Alert variant="info">No data available for plotting.</Alert>}

      <BandsPdosPlot bands_data={bandsData} pdos_data={pdosData} />
    </div>
  );
};

export default BandsPdosContainer;
