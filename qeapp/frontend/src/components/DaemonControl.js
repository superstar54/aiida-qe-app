import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DaemonControl = ({ workers, handleDaemonControl, adjustWorkers }) => {
  return (
    <div>
      <h2>Daemon Control</h2>
      <ToastContainer />
      <table className="table">
        <thead>
          <tr>
            <th>PID</th>
            <th>Memory %</th>
            <th>CPU %</th>
            <th>Started</th>
          </tr>
        </thead>
        <tbody>
          {workers.map(worker => (
            <tr key={worker.pid}>
              <td>{worker.pid}</td>
              <td>{worker.mem}</td>
              <td>{worker.cpu}</td>
              <td>{new Date(worker.started * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="button button-start" onClick={() => handleDaemonControl('start')}>Start Daemon</button>
      <button className="button button-stop" onClick={() => handleDaemonControl('stop')}>Stop Daemon</button>
      <button className="button button-adjust" onClick={() => adjustWorkers('increase')}>Increase Workers</button>
      <button className="button button-adjust" onClick={() => adjustWorkers('decrease')}>Decrease Workers</button>
    </div>
  );
};

export default DaemonControl;
