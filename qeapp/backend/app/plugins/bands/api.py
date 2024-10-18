from fastapi import APIRouter, HTTPException
from aiida import orm
from qeapp.backend.app.plugins.electronic_structure.utils import get_bands_data_from_node

router = APIRouter()

@router.get("/api/bands/{id}")
async def get_bands_data(id: int):

    try:
        node = orm.load_node(id)
        # output structure
        structure = None
        if "relax" in node.base.links.get_outgoing().all_link_labels():
                relax_node = node.base.links.get_outgoing().get_node_by_label("relax")
                if "output_structure" in relax_node.outputs:
                    structure = relax_node.outputs.output_structure.backend_entity.attributes

        # bands
        bands_data = None
        if "bands" in node.base.links.get_outgoing().all_link_labels():
            bands_node = node.base.links.get_outgoing().get_node_by_label("bands")
            bands_data = get_bands_data_from_node(bands_node)

        # Return the data as JSON
        data = {
            'structure': structure,
            'bands_data': bands_data,
        }
        return data
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Process {id} not found")
