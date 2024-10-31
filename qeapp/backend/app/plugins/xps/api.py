from fastapi import APIRouter, HTTPException
from aiida import orm
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Tuple
from qeapp.backend.app.models import StructureModel
import traceback

class CalculationRequest(BaseModel):
    structure: Optional[StructureModel] = None
    pseudo_group: str = "pseudo_demo_pbe"

router = APIRouter()

def export_xps_data(outputs):
    """Export the data from the XPS workchain"""

    chemical_shifts = {}
    symmetry_analysis_data = outputs.symmetry_analysis_data.get_dict()
    equivalent_sites_data = symmetry_analysis_data["equivalent_sites_data"]
    if "chemical_shifts" in outputs:
        for key, data in outputs.chemical_shifts.items():
            ele = key[:-4]
            chemical_shifts[ele] = data.get_dict()
    binding_energies = {}
    if "binding_energies" in outputs:
        for key, data in outputs.binding_energies.items():
            ele = key[:-3]
            binding_energies[ele] = data.get_dict()

    return (
        chemical_shifts,
        binding_energies,
        equivalent_sites_data,
    )

@router.get("/api/xps/{id}")
async def read_job(id: int):

    try:
        node = orm.load_node(id)
        # output structure
        if "structure" in node.outputs:
            structure = node.outputs.structure.backend_entity.attributes
        else:
            structure = node.inputs.structure.backend_entity.attributes
        # xps
        if "xps" in node.outputs:
            # get data
            xps_data = export_xps_data(node.outputs.xps)
        else:
            xps_data = None
        return {
                "structure": structure,
                "xps": xps_data}
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Process {id} not found")




@router.post("/api/xps/get_supported_xps_core_level")
async def get_supported_xps_core_level(request: CalculationRequest):
    from aiida.orm import QueryBuilder, Group

    try:
        structure = request.structure
        kind_list = set(list(structure.symbols))
        qb = QueryBuilder()
        qb.append(Group, filters={"label": request.pseudo_group})
        if len(qb.all()) == 0:
            raise ValueError(f"Group with label {request.pseudo_group} not found)")
        group = qb.all()[0][0]
        correction_energies = group.base.extras.get("correction")
        supported_core_levels = {}
        for key in correction_energies:
            ele, orbital = key.split("_")
            if ele not in supported_core_levels:
                supported_core_levels[ele] = [key]
            else:
                supported_core_levels[ele].append(key)
        # print("supported_core_levels: ", supported_core_levels)
        supported_elements = []
        not_supported_elements = []
        for ele in kind_list:
            if ele in supported_core_levels:
                for orbital in supported_core_levels[ele]:
                    supported_elements.append(orbital)
            else:
                not_supported_elements.append(ele)
        correction_energies = {key: correction_energies[key] for key in supported_elements}
        data = {"supported_elements": supported_elements,
                "not_supported_elements": not_supported_elements,
                "correction_energies": correction_energies}
        return data
    except KeyError as e:
        traceback.print_exc()
        raise HTTPException(status_code=404, detail=f"Error: {str(e)}")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")