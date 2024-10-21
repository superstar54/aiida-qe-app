from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Tuple

router = APIRouter()

# Define a Pydantic model for the structure input
class StructureModel(BaseModel):
    symbols: List[str]
    pbc: Optional[Tuple[bool, bool, bool]] = (True, True, True)  # Periodic boundary conditions

# Define a Pydantic model that includes protocol and structure
class CalculationRequest(BaseModel):
    protocol: str = "moderate"
    structure: Optional[StructureModel] = None

@router.post("/api/calculation/")
async def read_job_data(request: CalculationRequest):
    from aiida_quantumespresso.workflows.pw.base import PwBaseWorkChain
    print("request: ", request)
    try:
        # Get parameters for the specified protocol
        parameters = PwBaseWorkChain.get_protocol_inputs(request.protocol)

        # Handle kpoints distance based on structure (pbc)
        if request.structure:
            if request.structure.pbc == (False, False, False):
                kpoints_distance = 100.0
                kpoints_distance_disabled = True
            else:
                kpoints_distance = parameters["kpoints_distance"]
                kpoints_distance_disabled = False
        else:
            kpoints_distance = parameters["kpoints_distance"]

        # Calculate number of atoms
        num_atoms = len(request.structure.symbols) if request.structure else 1

        # Calculate the values based on the protocol
        etot_value = num_atoms * parameters["meta_parameters"]["etot_conv_thr_per_atom"]
        scf_value = num_atoms * parameters["meta_parameters"]["conv_thr_per_atom"]
        forc_value = parameters["pw"]["parameters"]["CONTROL"]["forc_conv_thr"]
        degauss = parameters["pw"]["parameters"]["SYSTEM"]["degauss"]
        smearing = parameters["pw"]["parameters"]["SYSTEM"]["smearing"]

        # Return the calculated data
        data = {
                "energyConvergence": etot_value,
                "scfConvergence": scf_value,
                "forceConvergence": forc_value,
                "kPointsDistance": kpoints_distance,
                "kpoints_distance_disabled": kpoints_distance_disabled,
                "smearingWidth": degauss,
                "smearingType": smearing,
            }
        return data
    except KeyError as e:
        raise HTTPException(status_code=404, detail=f"Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
