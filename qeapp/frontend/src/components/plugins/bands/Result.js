import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Alert, Spinner, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Plot from 'react-plotly.js';

const ResultTab = ({ JobId = null, jobStatus = null }) => {
  
  return (
    <div>
      <h4 className="mb-4">Bands Results</h4>
    </div>
  );
};

export default ResultTab;