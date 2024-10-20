# backend/app/api/endpoints.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from aiida.engine import submit
from aiida.orm import StructureData, load_code
import traceback
from qeapp.workflows.qeapp_workchain import QeAppWorkChain

router = APIRouter()



class CalculationData(BaseModel):
    # Define the expected structure of the calculation data
    # Adjust fields as necessary to match the data sent from the front-end
    structure: dict
    workflow_settings: dict
    computational_resources: dict

def get_advanced_setting_value(data):
    # basic workflow settings
    parameters = {"workchain": {}, "advanced": {}}
    basic_settings = data.workflow_settings.get('Basic workflow settings', {})
    mapping = {
        "relax_type": "relaxType",
        "electronic_type": "electronicType",
        "spin_type": "spinType",
        "protocol": "protocol",
    }
    for key, value in mapping.items():
        parameters["workchain"][key] = basic_settings.pop(value, None)
    parameters["workchain"]["properties"] = ["relax"] if parameters["workchain"]["relax_type"] != "none" else []
    # all the remaining settings, which are True will be considered as properties
    for key, value in basic_settings.items():
        if value:
            parameters["workchain"]["properties"].append(key)
    # create the the initial_magnetic_moments as None (Default)
    # advanced settings
    advanced_settings = data.workflow_settings.get('Advanced workflow settings', {})
    parameters["advanced"] = {
        "initial_magnetic_moments": None,
        "pw": {
            "parameters": {
                "SYSTEM": {},
                "CONTROL": {},
                "ELECTRONS": {},
            },
            "pseudos": {},
        },
        "clean_workdir": advanced_settings["cleanUp"],
        "pseudo_family": advanced_settings.get("pseudoFamily", "SSSP/1.3/PBEsol/efficiency"),
        "kpoints_distance": advanced_settings["kPointsDistance"],
    }
    # Set total charge
    # parameters["pw"]["parameters"]["SYSTEM"]["tot_charge"] = advanced_settings["totalCharge"]
    parameters["advanced"]["kpoints_distance"] =  advanced_settings["kPointsDistance"]
    if parameters["workchain"]["electronic_type"] == "metal":
        # smearing type setting
        parameters["advanced"]["pw"]["parameters"]["SYSTEM"]["smearing"] = advanced_settings["smearingType"]
        # smearing degauss setting
        parameters["advanced"]["pw"]["parameters"]["SYSTEM"]["degauss"] = advanced_settings["smearingWidth"]
    # convergence threshold setting
    parameters["advanced"]["pw"]["parameters"]["CONTROL"]["forc_conv_thr"] = advanced_settings["forceConvergence"]
    parameters["advanced"]["pw"]["parameters"]["ELECTRONS"]["conv_thr"] = advanced_settings["scfConvergence"]
    parameters["advanced"]["pw"]["parameters"]["CONTROL"]["etot_conv_thr"] = advanced_settings["energyConvergence"]
    # Spin-Orbit calculation
    if advanced_settings["spinOrbit"] == "soc":
        parameters["advanced"]["pw"]["parameters"]["SYSTEM"]["lspinorb"] = True
        parameters["advanced"]["pw"]["parameters"]["SYSTEM"]["noncolin"] = True
        parameters["advanced"]["pw"]["parameters"]["SYSTEM"]["nspin"] = 4
    return parameters

def prepare_inputs(data: CalculationData):
    """
    Prepare inputs for the calculation
    """
    from ase import Atoms
    # structure
    structure = data.structure["Structure Selection"]["selectedStructure"]
    if isinstance(structure, list):
        structure = structure[0]
    atoms = Atoms(symbols=structure["symbols"], positions=structure["positions"],
                    cell=structure["cell"], pbc=structure["pbc"])
    structure=StructureData(ase=atoms)
    structure.store()
    # workflow settings
    parameters = get_advanced_setting_value(data)
    # computational resources
    pw_code = load_code(data.computational_resources.get("pw_code", "qe-7.2-pw@localhost"))
    parameters["codes"] = {"pw": {"code": pw_code.uuid}}
    return {
        "structure": structure,
        "parameters": parameters,
    }


@router.post("/api/submit")
async def submit_calculation(data: CalculationData):
    from aiida.orm.utils.serialize import serialize
    try:
        # Process the data
        # For example, start the calculation using AiiDA
        # Return a success response with job details
        inputs = prepare_inputs(data)
        print("inputs: ", inputs)
        builder = QeAppWorkChain.get_builder_from_protocol(**inputs)
        print("builder: ", builder)
        process = submit(builder)
        process.base.extras.set("ui_parameters", serialize(data))
        # store the workchain name in extras, this will help to filter the workchain in the future
        process.base.extras.set("workchain", inputs["parameters"]["workchain"])
        process.base.extras.set("structure", inputs["structure"].get_formula())
        return {"status": "success", "job_id": process.pk}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


