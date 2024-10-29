import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import CodeSelector from './CodeSelector';

const CodeResourcesTab = ({ codesConfig = {}, data = {}, onDataChange, codes }) => {

  useEffect(() => {
    // Initialize codes with defaults and existing data
    const initialCodes = { ...codesConfig, ...data.codes };

    // Merge default properties for each code
    Object.keys(codesConfig).forEach((codeKey) => {
      if (!initialCodes[codeKey]) {
        initialCodes[codeKey] = { ...codesConfig[codeKey] };
      } else {
        // Filter out codeOptions using the `input_plugin` key
        let codeOptions;
        if (codes) {
          codeOptions = codes.filter((code) => code.attributes.input_plugin === codesConfig[codeKey].input_plugin);
        } else {
          codeOptions = [];
        }
        initialCodes[codeKey] = {
          ...codesConfig[codeKey],
          ...initialCodes[codeKey],
          codeOptions: codeOptions,
        };
      }
    });

    // Update data if initialCodes differ from current data.codes
    const newData = { ...data, codes: initialCodes };
    if (JSON.stringify(data.codes || {}) !== JSON.stringify(initialCodes)) {
      onDataChange(newData);
    }
  }, [codesConfig, data, onDataChange, codes]);

  const handleCodeChange = (codeKey, field, value) => {
    let updatedValue = value;

    if (field === 'nodes' || field === 'cpus') {
      const parsedValue = parseInt(value, 10);
      updatedValue = !isNaN(parsedValue) && parsedValue > 0 ? parsedValue : 1;
    }

    const updatedCodes = {
      ...data.codes,
      [codeKey]: {
        ...data.codes[codeKey],
        [field]: updatedValue,
      },
    };
    const newData = { ...data, codes: updatedCodes };
    onDataChange(newData);
  };

  return (
    <Form>
      {data.codes &&
        Object.entries(data.codes).map(([codeKey, codeConfig]) => (
          <div key={codeKey} className="mb-4">
            <CodeSelector
              codeLabel={codeKey}
              codeValue={codeConfig.label}
              onCodeChange={(value) => handleCodeChange(codeKey, 'label', value)}
              nodeValue={codeConfig.nodes}
              onNodeChange={(value) => handleCodeChange(codeKey, 'nodes', value)}
              cpuValue={codeConfig.cpus}
              onCpuChange={(value) => handleCodeChange(codeKey, 'cpus', value)}
              codeOptions={codeConfig.codeOptions}
            />
          </div>
        ))}
    </Form>
  );
};

export default CodeResourcesTab;
