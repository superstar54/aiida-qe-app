import React from 'react';
import { Row, Col, Table } from 'react-bootstrap';

const WorkflowSummaryTab = ({ data = {} }) => {
  return (
    <div>
      <h4>Workflow Summary</h4>
      <Row>
        <Col md={6}>
          <h5>Standard Settings</h5>
          <Table bordered>
            <tbody>
              <tr>
                <td>Structure geometry optimized</td>
                <td>{data.standardSettings?.geometryOptimized ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td>Optimization method</td>
                <td>{data.standardSettings?.optimizationMethod || 'N/A'}</td>
              </tr>
              <tr>
                <td>Protocol</td>
                <td>{data.standardSettings?.protocol || 'N/A'}</td>
              </tr>
              <tr>
                <td>Magnetism</td>
                <td>{data.standardSettings?.magnetism || 'none'}</td>
              </tr>
              <tr>
                <td>Electronic type</td>
                <td>{data.standardSettings?.electronicType || 'N/A'}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
        <Col md={6}>
          <h5>Advanced Settings</h5>
          <Table bordered>
            <tbody>
              <tr>
                <td>Functional</td>
                <td>{data.advancedSettings?.functional || 'N/A'}</td>
              </tr>
              <tr>
                <td>Pseudopotential library</td>
                <td>{data.advancedSettings?.pseudopotentialLibrary || 'N/A'}</td>
              </tr>
              <tr>
                <td>Energy cutoff (wave functions)</td>
                <td>{data.advancedSettings?.waveFunctionCutoff || 'N/A'} Ry</td>
              </tr>
              <tr>
                <td>Energy cutoff (charge density)</td>
                <td>{data.advancedSettings?.chargeDensityCutoff || 'N/A'} Ry</td>
              </tr>
              <tr>
                <td>Smearing width (degauss)</td>
                <td>{data.advancedSettings?.smearingWidth || 'N/A'} Ry</td>
              </tr>
              <tr>
                <td>Smearing type</td>
                <td>{data.advancedSettings?.smearingType || 'N/A'}</td>
              </tr>
              <tr>
                <td>K-point mesh distance (SCF)</td>
                <td>{data.advancedSettings?.kpointMeshDistanceSCF || 'N/A'} Å<sup>-1</sup></td>
              </tr>
              <tr>
                <td>K-point mesh distance (Bands)</td>
                <td>{data.advancedSettings?.kpointMeshDistanceBands || 'N/A'} Å<sup>-1</sup></td>
              </tr>
              <tr>
                <td>K-point mesh distance (NSCF)</td>
                <td>{data.advancedSettings?.kpointMeshDistanceNSCF || 'N/A'} Å<sup>-1</sup></td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowSummaryTab;
