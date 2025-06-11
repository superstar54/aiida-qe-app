import React, { useEffect, useState, useContext, useRef } from 'react';
import { Form, ToggleButtonGroup, ToggleButton, Row, Col } from 'react-bootstrap';
import { WizardContext } from '../wizard/WizardContext';

const PSEUDODOJO_VERSION = '0.4';
const SSSP_VERSION = '1.3';

const PseudopotentialSetting = () => {
  const stepIndex = 1;
  const tabTitle = 'Pseudopotential Settings';
  const { steps, handleDataChange } = useContext(WizardContext);
  const data = steps[stepIndex]?.data?.[tabTitle] || {};

  const structure = steps[0]?.data?.['Structure Selection']?.selectedStructure || null;
  const spinOrbit = steps[1]?.data?.['Advanced Settings']?.spinOrbit || 'off';
  const protocol = steps[1]?.data?.['Basic Settings']?.protocol || 'moderate';

  const [cutoffs, setCutoffs] = useState(data.cutoffs || {});
  const [pseudopotentials, setPseudopotentials] = useState(data.pseudos || {});
  const [librarySelection, setLibrarySelection] = useState(data.librarySelection || 'SSSP efficiency');
  const [exchangeFunctional, setExchangeFunctional] = useState(data.exchangeFunctional || 'PBE');
  const [wavefunctionCutoff, setWavefunctionCutoff] = useState(data.wavefunctionCutoff || 50);
  const [chargeDensityCutoff, setChargeDensityCutoff] = useState(data.chargeDensityCutoff || 400);
  const [error, setError] = useState(null); // New error state

  const pseudopotentialOptions = {
    "SSSP Efficiency": "SSSP efficiency",
    "SSSP Precision": "SSSP precision",
    "PseudoDojo Standard": "PseudoDojo standard",
    "PseudoDojo Stringent": "PseudoDojo stringent"
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current && Object.keys(pseudopotentials).length !== 0) {
      isInitialMount.current = false;
      return; // Skip the effect on the initial mount
    }

    if (!structure) {
      return;
    }

    const fetchCutoffs = async () => {
      try {
        setError(null); // Reset error before fetching
        const body = { structure, exchange_functional: exchangeFunctional, library_selection: librarySelection, spin_orbit: spinOrbit };
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/calculation/get_pseudos/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error(`Error fetching cutoffs: ${response.statusText}`);
        
        const result = await response.json();
        setPseudopotentials(result.pseudos);
        setCutoffs(result.cutoffs);
        const cutoff_wfc = Math.max(...Object.values(result.cutoffs).map(c => c.cutoff_wfc));
        const cutoff_rho = Math.max(...Object.values(result.cutoffs).map(c => c.cutoff_rho));
        setWavefunctionCutoff(cutoff_wfc);
        setChargeDensityCutoff(cutoff_rho);

        let pseudoFamily;
        if (librarySelection === 'SSSP efficiency') {
          pseudoFamily = `SSSP/${SSSP_VERSION}/${exchangeFunctional}/efficiency`;
        } else if (librarySelection === 'SSSP precision') {
          pseudoFamily = `SSSP/${SSSP_VERSION}/${exchangeFunctional}/precision`;
        } else if (librarySelection === 'PseudoDojo standard') {
          pseudoFamily = spinOrbit === 'on' 
            ? `PseudoDojo/${PSEUDODOJO_VERSION}/${exchangeFunctional}/FR/standard/upf` 
            : `PseudoDojo/${PSEUDODOJO_VERSION}/${exchangeFunctional}/SR/standard/upf`;
        } else if (librarySelection === 'PseudoDojo stringent') {
          pseudoFamily = spinOrbit === 'on' 
            ? `PseudoDojo/${PSEUDODOJO_VERSION}/${exchangeFunctional}/FR/stringent/upf` 
            : `PseudoDojo/${PSEUDODOJO_VERSION}/${exchangeFunctional}/SR/stringent/upf`;
        }

        const newData = { 
          ...data,
          pseudos: result.pseudos,
          cutoffs: result.cutoffs,
          pseudo_family: pseudoFamily,
          wavefunctionCutoff: cutoff_wfc,
          chargeDensityCutoff: cutoff_rho,
        };
        handleDataChange(stepIndex, tabTitle, newData);
      } catch (error) {
        setError(`Failed to fetch pseudopotential: the selected pseudopotential library may not be available for the selected structure or exchange-correlation functional.`);
        console.error('Failed to fetch cutoffs:', error);
      }
    };

    if (structure) fetchCutoffs();
  }, [structure, exchangeFunctional, librarySelection, spinOrbit]);

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    handleDataChange(stepIndex, tabTitle, newData);
  };


  return (
    <div className="container py-4">
       {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-4 text-muted">
      The exchange-correlation functional and pseudopotential library is set by the protocol configured in the "Basic Settings" tab.
      </div>
  
      <div className="mb-4">
        <label htmlFor="exchangeFunctional" className="form-label fw-bold">Exchange-Correlation Functional</label>
        <select
          id="exchangeFunctional"
          value={exchangeFunctional}
          onChange={(e) => {
            const value = e.target.value;
            setExchangeFunctional(value);
            handleChange("exchangeFunctional", value);
          }}
          className="form-select"
        >
          <option value="PBE">PBE</option>
          <option value="PBEsol">PBEsol</option>
        </select>
        <small className="text-muted d-block mt-2">
        The exchange-correlation energy is calculated using this functional. We currently provide support for two well-established generalised gradient approximation (GGA) functionals: PBE and PBEsol.
        </small>
      </div>
  
      <div className="mb-4">
        <div htmlFor="librarySelection" className="form-label fw-bold">Pseudopotential Family</div>
        <div className="btn-group" role="group">
          {Object.entries(pseudopotentialOptions).map(([label, value]) => (
            (spinOrbit === 'off' || value.startsWith('PseudoDojo')) && (
              <button
                key={value}
                id={value}
                type="button"
                onClick={() => {
                  setLibrarySelection(value);
                  handleChange("librarySelection", value);
                }}
                className={`btn ${librarySelection === value ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                {label}
              </button>
            )
          ))}
        </div>
        <small className="text-muted d-block mt-2">
        If you are unsure, select 'SSSP efficiency', which for most calculations will produce sufficiently accurate results at comparatively small computational costs. If your calculations require a higher accuracy, select 'SSSP accuracy' or 'PseudoDojo stringent', which will be computationally more expensive. SSSP is the standard solid-state pseudopotentials. The PseudoDojo used here has the SR relativistic type.
        </small>
      </div>
  
      <h5 className="mb-3">Pseudopotential Files</h5>
      {structure ? (
        <div>
          {Array.from(new Set(structure.symbols)).map((symbol) => (
            <div key={symbol} className="row align-items-center mb-3">
              <div className="col-md-2 fw-bold">{symbol}</div>
              <div className="col-md-6">
                <input
                  type="text"
                  value={pseudopotentials[symbol]?.name || 'Not available'}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="col-md-4 text-muted">
                Recommended ecwfc: {cutoffs[symbol]?.cutoff_wfc || 'N/A'} Ry, ecrho: {cutoffs[symbol]?.cutoff_rho || 'N/A'} Ry
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">Upload pseudopotentials for each symbol in the structure.</p>
      )}
  
      <h5 className="mb-3 mt-4">Calculation Cutoffs</h5>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="wavefunctionCutoff" className="form-label">Wavefunction Cutoff (Ry)</label>
          <input
            type="number"
            id="wavefunctionCutoff"
            value={wavefunctionCutoff}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setWavefunctionCutoff(value);
              handleChange("wavefunctionCutoff", value);
            }}
            className="form-control"
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="chargeDensityCutoff" className="form-label">Charge Density Cutoff (Ry)</label>
          <input
            type="number"
            id="chargeDensityCutoff"
            value={chargeDensityCutoff}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setChargeDensityCutoff(value);
              handleChange("chargeDensityCutoff", value);
            }}
            className="form-control"
          />
        </div>
      </div>
    </div>
  );
  
};

export default PseudopotentialSetting;
