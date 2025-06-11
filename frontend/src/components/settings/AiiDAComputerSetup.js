import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import YAML from 'yaml';

const AddComputer = () => {
  const [yamlData, setYamlData] = useState('');
  const [formData, setFormData] = useState({
    label: '',
    hostname: '',
    description: '',
    transport: '',
    scheduler: '',
    shebang: '#!/bin/bash',
    workdir: '',
    mpirunCommand: '',
    mpiprocsPerMachine: '',
    defaultMemoryPerMachine: '',
    prependText: '',
    appendText: '',
  });
  const [message, setMessage] = useState(null);
  const [useForm, setUseForm] = useState(true);
  const navigate = useNavigate();

  // Update YAML when form data changes
  useEffect(() => {
    if (useForm) {
      const yamlObject = {
        label: formData.label,
        hostname: formData.hostname,
        description: formData.description,
        transport: formData.transport,
        scheduler: formData.scheduler,
        shebang: formData.shebang,
        workdir: formData.workdir,
        mpirun_command: formData.mpirunCommand.split(' '),
        mpiprocs_per_machine: parseInt(formData.mpiprocsPerMachine, 10) || null,
        default_memory_per_machine: parseFloat(formData.defaultMemoryPerMachine) || null,
        prepend_text: formData.prependText,
        append_text: formData.appendText,
      };
      setYamlData(YAML.stringify(yamlObject));
    }
  }, [formData, useForm]);

  // Update form data when YAML changes
  useEffect(() => {
    if (!useForm) {
      try {
        const parsedData = YAML.parse(yamlData);
        setFormData({
          label: parsedData.label || '',
          hostname: parsedData.hostname || '',
          description: parsedData.description || '',
          transport: parsedData.transport || '',
          scheduler: parsedData.scheduler || '',
          shebang: parsedData.shebang || '#!/bin/bash',
          workdir: parsedData.workdir || '',
          mpirunCommand: parsedData.mpirun_command ? parsedData.mpirun_command.join(' ') : '',
          mpiprocsPerMachine: parsedData.mpiprocs_per_machine ? parsedData.mpiprocs_per_machine.toString() : '',
          defaultMemoryPerMachine: parsedData.default_memory_per_machine ? parsedData.default_memory_per_machine.toString() : '',
          prependText: parsedData.prepend_text || '',
          appendText: parsedData.append_text || '',
        });
      } catch (error) {
        // Handle parsing error if needed
      }
    }
  }, [yamlData, useForm]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const yamlText = event.target.result;
        YAML.parse(yamlText); // Ensure it's valid YAML
        setYamlData(yamlText);
        setUseForm(false); // Switch to YAML mode
      } catch (error) {
        alert('Invalid YAML file');
      }
    };
    reader.readAsText(file);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleYamlChange = (e) => {
    setYamlData(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const parsedData = YAML.parse(yamlData);

      const response = await fetch(`./api/computers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Computer added successfully!' });
        setTimeout(() => navigate('/settings'), 2000);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: `Error: ${errorData.message}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add computer. Please check the YAML format.' });
    }
  };

  return (
    <div>
      <h3>Add New Computer</h3>

      <div className="mb-3">
        <button onClick={() => setUseForm(true)} className="btn btn-secondary mr-2">
          Use Form
        </button>
        <button onClick={() => setUseForm(false)} className="btn btn-secondary">
          Use YAML
        </button>
      </div>

      {useForm ? (
        <form>
          {/* Label */}
          <div className="form-group">
            <label>Label</label>
            <input
              type="text"
              className="form-control"
              name="label"
              value={formData.label}
              onChange={handleFormChange}
            />
          </div>
          {/* Hostname */}
          <div className="form-group">
            <label>Hostname</label>
            <input
              type="text"
              className="form-control"
              name="hostname"
              value={formData.hostname}
              onChange={handleFormChange}
            />
          </div>
          {/* Transport */}
          <div className="form-group">
          <label>Transport</label>
          <select
            className="form-control"
            name="transport"
            value={formData.transport}
            onChange={handleFormChange}
          >
            <option value="">Select Transport</option>
            <option value="core.ssh">SSH</option>
            <option value="core.local">Local</option>
            {/* Add other options as needed */}
          </select>
        </div>
          {/* Scheduler */}
          <div className="form-group">
            <label>Scheduler</label>
            <input
              type="text"
              className="form-control"
              name="scheduler"
              value={formData.scheduler}
              onChange={handleFormChange}
            />
          </div>
          {/* Work Directory */}
          <div className="form-group">
            <label>Work Directory</label>
            <input
              type="text"
              className="form-control"
              name="workdir"
              value={formData.workdir}
              onChange={handleFormChange}
            />
          </div>
          {/* Shebang */}
          <div className="form-group">
            <label>Shebang</label>
            <input
              type="text"
              className="form-control"
              name="shebang"
              value={formData.shebang}
              onChange={handleFormChange}
            />
          </div>
          {/* MPI Run Command */}
          <div className="form-group">
            <label>MPI Run Command</label>
            <input
              type="text"
              className="form-control"
              name="mpirunCommand"
              value={formData.mpirunCommand}
              onChange={handleFormChange}
            />
          </div>
          {/* Prepend Text */}
          <div className="form-group">
            <label>Prepend Text</label>
            <textarea
              className="form-control"
              name="prependText"
              value={formData.prependText}
              onChange={handleFormChange}
            ></textarea>
          </div>
          {/* Append Text */}
          <div className="form-group">
            <label>Append Text</label>
            <textarea
              className="form-control"
              name="appendText"
              value={formData.appendText}
              onChange={handleFormChange}
            ></textarea>
          </div>
        </form>
      ) : (
        <div>
          <div className="form-group">
            <label>Edit YAML Data</label>
            <textarea
              className="form-control"
              rows="10"
              value={yamlData}
              onChange={handleYamlChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Upload YAML File</label>
            <input
              type="file"
              className="form-control"
              accept=".yaml, .yml"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}

      <button onClick={handleSubmit} className="btn btn-primary mt-3">
        Submit
      </button>

      {message && (
        <div
          className={`alert ${
            message.type === 'success' ? 'alert-success' : 'alert-danger'
          } mt-3`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default AddComputer;
