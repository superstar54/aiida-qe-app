# backend/app/api/endpoints.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from aiida.engine import submit
from aiida.orm import StructureData, load_code
from qeapp.workflows.qeapp_workchain import QeAppWorkChain
router = APIRouter()



class CalculationData(BaseModel):
    # Define the expected structure of the calculation data
    # Adjust fields as necessary to match the data sent from the front-end
    structure: dict
    workflow_settings: dict
    computational_resources: dict

def prepare_inputs(data: CalculationData):
    """
    Prepare inputs for the calculation
    """
    from ase import Atoms
    parameters = {}
    parameters["workchain"] = data.workflow_settings.get('Basic workflow settings', {})
    parameters["workchain"].setdefault("protocol", "fast")
    parameters["workchain"].setdefault("relax_type", "positions")
    parameters["workchain"].setdefault("spin_type", "none")
    parameters["workchain"].setdefault("electronic_type", "insulator")
    parameters["advanced"] = data.workflow_settings.get('Advanced workflow settings', {})
    parameters["advanced"].setdefault("pw", {"pseudos": {}})
    parameters["advanced"].setdefault("initial_magnetic_moments", None)
    parameters["advanced"].setdefault("clean_workdir", False)
    structure = data.structure["Structure Selection"]["selectedStructure"]
    if isinstance(structure, list):
        structure = structure[0]
    atoms = Atoms(symbols=structure["symbols"], positions=structure["positions"],
                    cell=structure["cell"], pbc=structure["pbc"])
    structure=StructureData(ase=atoms)
    structure.store()
    pw_code = load_code(data.computational_resources.get("pw_code", "qe-7.2-pw@localhost"))
    parameters["codes"] = {"pw": {"code": pw_code.uuid}}
    return {
        "structure": structure,
        "parameters": parameters,
    }


@router.post("/api/submit")
async def submit_calculation(data: CalculationData):
    try:
        # Process the data
        # For example, start the calculation using AiiDA
        # Return a success response with job details
        inputs = prepare_inputs(data)
        print("inputs: ", inputs)
        builder = QeAppWorkChain.get_builder_from_protocol(**inputs)
        print("builder: ", builder)
        process = submit(builder)
        return {"status": "success", "job_id": process.pk}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


