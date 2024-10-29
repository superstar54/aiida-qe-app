from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Tuple
import traceback

router = APIRouter()

# Define a Pydantic model for the structure input
class StructureModel(BaseModel):
    symbols: List[str]
    pbc: Optional[Tuple[bool, bool, bool]] = (True, True, True)  # Periodic boundary conditions

# Define a Pydantic model that includes protocol and structure
class CalculationRequest(BaseModel):
    protocol: str = "moderate"
    structure: Optional[StructureModel] = None
    pseudo_group: str = "pseudo_demo_pbe"
    exchange_functional: str = "PBE"
    library_selection: str = "SSSP efficiency"
    spin_orbit: str = "no"

@router.post("/api/calculation/pw_parameters_from_protocol")
async def get_pw_parameters_from_protocol(request: CalculationRequest):
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



@router.post("/api/calculation/get_supported_xps_core_level")
async def get_supported_xps_core_level(request: CalculationRequest):
    from aiida.orm import QueryBuilder, Group
    
    try:
        structure = request.structure
        kind_list = set(list(structure.symbols))
        checkbox_list = []
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

def get_pseudo_family_label(library_selection, exchange_functional, spin_orbit):
    """Get the pseudo family string based on the library selection.
    """
    PSEUDODOJO_VERSION = "0.4"
    SSSP_VERSION = "1.3"
    library, accuracy = library_selection.split()
    functional = exchange_functional
    if library == "PseudoDojo":
        if spin_orbit == "on":
            pseudo_family_label = (
                f"PseudoDojo/{PSEUDODOJO_VERSION}/{functional}/FR/{accuracy}/upf"
            )
        else:
            pseudo_family_label = (
                f"PseudoDojo/{PSEUDODOJO_VERSION}/{functional}/SR/{accuracy}/upf"
            )
    elif library == "SSSP":
        pseudo_family_label = f"SSSP/{SSSP_VERSION}/{functional}/{accuracy}"
    else:
        raise ValueError(
            f"Unknown pseudo family library '{library}' selected. "
        )
    return pseudo_family_label

@router.post("/api/calculation/get_pseudos")
async def get_pseudos(request: CalculationRequest):
    from aiida.orm import QueryBuilder, Group
    from aiida.plugins import DataFactory, GroupFactory
    from aiida_pseudo.common.units import U

    UpfData = DataFactory("pseudo.upf")
    SsspFamily = GroupFactory("pseudo.family.sssp")
    PseudoDojoFamily = GroupFactory("pseudo.family.pseudo_dojo")
    CutoffsPseudoPotentialFamily = GroupFactory("pseudo.family.cutoffs")

    
    try:
        structure = request.structure
        exchange_functional = request.exchange_functional
        library_selection = request.library_selection
        spin_orbit = request.spin_orbit
        pseudo_family_label = get_pseudo_family_label(library_selection, exchange_functional, spin_orbit)
        # print("pseudo_family_label: ", pseudo_family_label)
        kind_list = list(set(list(structure.symbols)))
        pseudo_set = (PseudoDojoFamily, SsspFamily, CutoffsPseudoPotentialFamily)
        pseudo_family = (
            QueryBuilder()
            .append(pseudo_set, filters={"label": pseudo_family_label})
            .one()[0]
        )
        pseudos = pseudo_family.get_pseudos(elements=kind_list)
        pseudos = {k: {"name": v.filename, "uuid": v.uuid} for k, v in pseudos.items()}
        all_cutoffs = pseudo_family.get_cutoffs()
        current_unit = pseudo_family.get_cutoffs_unit()
        cutoffs = {}
        for element in kind_list:
            cutoff = all_cutoffs.get(element, {})
            cutoffs[element] = {
                k: U.Quantity(v, current_unit).to("Ry").to_tuple()[0]
                for k, v in cutoff.items()
            }
        
        data = {
            "pseudos": pseudos,
            "cutoffs": cutoffs,
        }
        print("data: ", data)
        return data
    except KeyError as e:
        traceback.print_exc()
        raise HTTPException(status_code=404, detail=f"Error: {str(e)}")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
