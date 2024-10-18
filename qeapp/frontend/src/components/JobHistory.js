import React, { useState } from 'react';
import { Table, Form, Row, Col, Button, Pagination } from 'react-bootstrap';

const JobHistory = () => {
  // State for search inputs (as before)
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

  // Example jobs data (replace with actual data from API or backend)
  const jobs = [
    { id: 30729, creationTime: '2024-09-17 07:18:31', structure: 'Si2', state: 'finished', label: 'Si2 structure is not relaxed , properties on bands, pdos', relaxType: 'none' },
    { id: 30656, creationTime: '2024-05-23 09:25:22', structure: 'Si2', state: 'finished', label: 'Si2 structure is not relaxed , properties on bands', relaxType: 'none' },
    // Add more job data here
  ];

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

  // Handle search form submit (same as before)
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic here
    console.log('Searching with:', { searchLabel, jobState, startDate, endDate, properties });
  };

  // Handle pagination (same as before)
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2 className="mb-4">Search results:</h2>

      {/* Search Form (same as before) */}
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
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="endDate">
              <Form.Label>End Time</Form.Label>
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

      {/* Job Results Table */}
      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>
              PK {sortConfig.key === 'id' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('creationTime')}>
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
              <td><Button variant="danger" size="sm">Delete</Button></td>
              <td><Button variant="info" size="sm">Inspect</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination>
        {Array.from({ length: Math.ceil(jobs.length / jobsPerPage) }).map((_, idx) => (
          <Pagination.Item key={idx + 1} active={idx + 1 === currentPage} onClick={() => handlePageChange(idx + 1)}>
            {idx + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
};

export default JobHistory;
