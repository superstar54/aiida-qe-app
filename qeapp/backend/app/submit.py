# backend/app/api/endpoints.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from aiida_quantumespresso.workflows.pw.base import PwBaseWorkChain
from aiida.engine import submit
from aiida.orm import StructureData, load_code

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

    structure = data.structure["Structure Selection"]["selectedStructure"]
    if isinstance(structure, list):
        structure = structure[0]
    atoms = Atoms(symbols=structure["symbols"], positions=structure["positions"],
                    cell=structure["cell"], pbc=structure["pbc"])
    structure=StructureData(ase=atoms)
    structure.store()
    pw_code = load_code(data.computational_resources.get("pw_code", "qe-7.2-pw@localhost"))
    protocol = data.workflow_settings.get("protocol", "fast")
    return {
        "structure": structure,
        "code": pw_code,
        "protocol": protocol,
    }


@router.post("/api/submit")
async def submit_calculation(data: CalculationData):
    try:
        # Process the data
        # For example, start the calculation using AiiDA
        # Return a success response with job details
        inputs = prepare_inputs(data)
        builder = PwBaseWorkChain.get_builder_from_protocol(**inputs)
        process = submit(builder)
        return {"status": "success", "job_id": process.pk}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


