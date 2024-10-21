from aiida_workgraph import WorkGraph, task
from aiida import orm
from aiida_quantumespresso.workflows.pw.relax import PwRelaxWorkChain
from aiida_quantumespresso.workflows.pw.bands import PwBandsWorkChain
from aiida_quantumespresso.workflows.pdos import PdosWorkChain
from aiida_quantumespresso.common.types import ElectronicType, RelaxType, SpinType


@task()
def inspect_relax(parameters):
    """Inspect relax calculation."""
    return orm.Int(parameters.get_dict()["number_of_bands"])

@task.calcfunction()
def update_scf_parameters(parameters, current_number_of_bands = None):
    """Update scf parameters."""
    parameters = parameters.get_dict()
    parameters.setdefault('SYSTEM', {}).setdefault('nbnd', current_number_of_bands)
    return orm.Dict(parameters)

@task.calcfunction()
def update_bands_parameters(parameters, scf_parameters, nbands_factor=None):
    """Update bands parameters."""
    parameters = parameters.get_dict()
    parameters.setdefault("SYSTEM", {})
    scf_parameters = scf_parameters.get_dict()
    if nbands_factor:
        factor = nbands_factor.value
        nbands = int(scf_parameters["number_of_bands"])
        nelectron = int(scf_parameters["number_of_electrons"])
        nbnd = max(int(0.5 * nelectron * factor), int(0.5 * nelectron) + 4, nbands)
        parameters["SYSTEM"]["nbnd"] = nbnd
    # Otherwise set the current number of bands, unless explicitly set in the inputs
    else:
        parameters["SYSTEM"].setdefault("nbnd", scf_parameters["number_of_bands"])
    return orm.Dict(parameters)

@task.graph_builder()
def qeapp_workgraph(structure: orm.StructureData = None,
                    parameters: orm.Dict = None,
                    ) -> WorkGraph:
    """BandsWorkGraph."""
    inputs = {} if inputs is None else inputs
    properties = parameters["workchain"].pop("properties", [])
    protocol = parameters["workchain"]["protocol"]
    codes = parameters.pop("codes", {})
    # load codes from uuid
    for _, value in codes.items():
        if value["code"] is not None:
            value["code"] = orm.load_node(value["code"])
    # Initialize some variables which can be overridden in the following
    bands_kpoints = None
    current_number_of_bands = None
    # Load the pseudopotential family.
    if pseudo_family is not None:
        pseudo_family = orm.load_group(pseudo_family)
        pseudos = pseudo_family.get_pseudos(structure=structure)
    # Initialize the workgraph
    wg = WorkGraph("BandsStructure")
    # ------- relax -----------
    if "relax" in properties:
        relax_overrides = {
            "base": parameters["advanced"],
            "base_final_scf": parameters["advanced"],
        }
        relax_builder = PwRelaxWorkChain.get_builder_from_protocol(
            code=codes.get("pw")["code"],
            structure=structure,
            protocol=protocol,
            relax_type=RelaxType(parameters["workchain"]["relax_type"]),
            electronic_type=ElectronicType(parameters["workchain"]["electronic_type"]),
            spin_type=SpinType(parameters["workchain"]["spin_type"]),
            initial_magnetic_moments=parameters["advanced"]["initial_magnetic_moments"],
            overrides=relax_overrides,
        )
        relax_task = wg.add_task(PwRelaxWorkChain, name="relax", structure=structure)
        # retrieve the relax inputs from the inputs, and set the relax inputs
        relax_task.set(relax_builder)
        # override the input structure with the relaxed structure
        structure = relax_task.outputs["output_structure"]
        # -------- inspect_relax -----------
        inspect_relax_task = wg.add_task(
            inspect_relax,
            name="inspect_relax",
            parameters=relax_task.outputs["output_parameters"],
        )
        current_number_of_bands = inspect_relax_task.outputs["result"]
    # -------- plugins -----------
    # -------- bands -----------
    if "bands" in properties:
        from copy import deepcopy
        pw_code = codes.get("pw")["code"]
        protocol = parameters["workchain"]["protocol"]
        scf_overrides = deepcopy(parameters["advanced"])
        relax_overrides = {
            "base": deepcopy(parameters["advanced"]),
            "base_final_scf": deepcopy(parameters["advanced"]),
        }
        bands_overrides = deepcopy(parameters["advanced"])
        bands_overrides.pop("kpoints_distance", None)
        bands_overrides["pw"]["parameters"]["SYSTEM"].pop("smearing", None)
        bands_overrides["pw"]["parameters"]["SYSTEM"].pop("degauss", None)

        overrides = {
            "scf": scf_overrides,
            "bands": bands_overrides,
            "relax": relax_overrides,
        }

        bands_builder = PwBandsWorkChain.get_builder_from_protocol(
            code=pw_code,
            structure=structure,
            protocol=protocol,
            electronic_type=ElectronicType(parameters["workchain"]["electronic_type"]),
            spin_type=SpinType(parameters["workchain"]["spin_type"]),
            overrides=overrides,
        )
        bands_task = wg.add_task(PwBandsWorkChain, name="bands", structure=structure)
        # retrieve the bands inputs from the inputs, and set the bands inputs
        bands_task.set(bands_builder)

    return wg

