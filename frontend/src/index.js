import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { WizardContext } from './components/wizard/WizardContext';

// Expose the exact same WizardContext object to plugins
window.WizardContext = WizardContext;
// plugins can do window.React.useContext(...)
window.React = React;
window.ReactDOM = ReactDOM;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


