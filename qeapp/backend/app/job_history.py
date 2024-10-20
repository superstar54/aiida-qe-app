from fastapi import APIRouter, HTTPException, Query
from aiida import orm
from typing import List, Dict, Union
import time

router = APIRouter()


@router.get("/api/jobs-data")
async def read_job_data(search: str = Query(None)):
    from qeapp.workflows.qeapp_workchain import QeAppWorkChain
    from aiida.orm import QueryBuilder
    
    try:
        projections = [
            "id",
            "extras.structure",
            "ctime",
            "attributes.process_state",
            "label",
            "extras.workchain.relax_type",
            "extras.workchain.properties",
        ]

        qb = QueryBuilder()
        qb.append(QeAppWorkChain, project=projections, tag="process")
        qb.order_by({"process": {"ctime": "desc"}})
        results = qb.all()
        data = []
        for p in results:
            data.append({projections[i]: p[i] for i in range(len(projections))})
        print(data)
        return {"jobs": data}
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Workgraph {id} not found")



@router.get("/api/jobs/{id}")
async def read_job(id: int):
    from .utils import (
        get_node_summary,
        get_node_inputs,
        get_node_outputs,
    )
    from aiida_workgraph.utils import get_parent_workgraphs

    try:
        tstart = time.time()

        node = orm.load_node(id)

        content = node.base.extras.get("_workgraph_short", None)
        if content is None:
            print("No workgraph data found in the node.")
            return
        summary = {
            "table": get_node_summary(node),
            "inputs": get_node_inputs(id),
            "outputs": get_node_outputs(id),
        }

        parent_workgraphs = get_parent_workgraphs(id)
        parent_workgraphs.reverse()
        print(f"Time to load process latest: {time.time() - tstart}")
        tstart = time.time()
        content["summary"] = summary
        content["parent_workgraphs"] = parent_workgraphs
        content["processes_info"] = {}
        return content
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Workgraph {id} not found")


# Route for deleting a job item
@router.delete("/api/jobs-data/{id}")
async def delete_job(
    id: int,
    dry_run: bool = False,
) -> Dict[str, Union[bool, str, List[int]]]:
    from aiida.tools import delete_nodes

    try:
        # Perform the delete action here
        deleted_nodes, was_deleted = delete_nodes([id], dry_run=dry_run)
        if was_deleted:
            return {
                "deleted": True,
                "message": f"Deleted job {id}",
                "deleted_nodes": list(deleted_nodes),
            }
        else:
            message = f"Did not delete job {id}"
            if dry_run:
                message += " [dry-run]"
            return {
                "deleted": False,
                "message": message,
                "deleted_nodes": list(deleted_nodes),
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))