import React, { useState, useEffect } from 'react';
import { Table, Form, Row, Col, Button, Pagination, Spinner, Alert } from 'react-bootstrap';

const JobHistory = () => {
  // State for jobs data
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);     // Error state

  // State for search inputs
  const [searchLabel, setSearchLabel] = useState('');
  const [jobState, setJobState] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [properties, setProperties] = useState({
    xps: false,
    vibronic: false,
    bands: false,
    bader: false,
    pdos: false,
    hp: false,
    xas: false,
    relax: false,
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 20; // Configurable

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  // useEffect to fetch data from the API when the component mounts or when search filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construct query parameters based on search inputs
        const queryParams = new URLSearchParams();

        if (searchLabel) queryParams.append('label', searchLabel);
        if (jobState) queryParams.append('state', jobState);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);

        // Append properties to query parameters
        Object.keys(properties).forEach((prop) => {
          if (properties[prop]) {
            queryParams.append('properties', prop);
          }
        });

        const response = await fetch(`http://localhost:8000/api/jobs-data?${queryParams.toString()}`);
        console.log("response", response)
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        setJobs(data.jobs); // Assuming the API returns an object with a 'jobs' array
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchLabel, jobState, startDate, endDate, properties]);

  // Function to handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort the jobs based on the current sort configuration
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Paginate the sorted jobs
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    // The useEffect hook will handle fetching new data
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle delete job (you can implement this function)
  const handleDeleteJob = async (jobId) => {
    if (window.confirm(`Are you sure you want to delete job ${jobId}?`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/jobs-data/${jobId}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        // Remove the deleted job from the state
        setJobs(jobs.filter((job) => job.id !== jobId));
      } catch (err) {
        alert(`Error deleting job: ${err.message}`);
      }
    }
  };

  // Handle inspect job (you can implement this function)
  const handleInspectJob = (jobId) => {
    // Redirect to job details page or open modal
    console.log(`Inspect job ${jobId}`);
  };

  return (
    <div>
      <h2 className="mb-4">Search Jobs</h2>

      {/* Search Form */}
      <Form onSubmit={handleSearch}>
        <Row>
          <Col md={4}>
            <Form.Group controlId="searchLabel">
              <Form.Label>Search Label</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter label to search"
                value={searchLabel}
                onChange={(e) => setSearchLabel(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="jobState">
              <Form.Label>Job State</Form.Label>
              <Form.Control
                as="select"
                value={jobState}
                onChange={(e) => setJobState(e.target.value)}
              >
                <option value="">Any</option>
                <option value="finished">Finished</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
              </Form.Control>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="properties">
              <Form.Label>Properties</Form.Label>
              <div className="d-flex flex-wrap">
                {Object.keys(properties).map((prop) => (
                  <Form.Check
                    key={prop}
                    inline
                    type="checkbox"
                    label={prop}
                    checked={properties[prop]}
                    onChange={() => setProperties({ ...properties, [prop]: !properties[prop] })}
                  />
                ))}
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={4}>
            <Form.Group controlId="startDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="endDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4} className="d-flex align-items-end">
            <Button type="submit" variant="primary" className="w-100">Search</Button>
          </Col>
        </Row>
      </Form>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mt-4">
          Error fetching jobs: {error}
        </Alert>
      )}

      {/* Job Results Table */}
      {!loading && !error && (
        <>
          <Table striped bordered hover responsive className="mt-4">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  PK {sortConfig.key === 'id' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('creationTime')} style={{ cursor: 'pointer' }}>
                  Creation Time {sortConfig.key === 'creationTime' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                </th>
                <th>Structure</th>
                <th>State</th>
                <th>Label</th>
                <th>Relax Type</th>
                <th>Delete</th>
                <th>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {paginatedJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{new Date(job.creationTime).toLocaleString()}</td>
                  <td>{job.structure}</td>
                  <td>{job.state}</td>
                  <td>{job.label}</td>
                  <td>{job.relaxType}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteJob(job.id)}>
                      Delete
                    </Button>
                  </td>
                  <td>
                    <Button variant="info" size="sm" onClick={() => handleInspectJob(job.id)}>
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {jobs.length > jobsPerPage && (
            <Pagination>
              {Array.from({ length: Math.ceil(jobs.length / jobsPerPage) }).map((_, idx) => (
                <Pagination.Item
                  key={idx + 1}
                  active={idx + 1 === currentPage}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default JobHistory;
