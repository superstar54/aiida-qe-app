from fastapi import APIRouter, HTTPException, Query
from aiida import orm
from typing import List, Dict, Union
import time

router = APIRouter()


@router.get("/api/jobs-data")
async def read_workgraph_data(search: str = Query(None)):
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
        return {"jobs": data}
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Workgraph {id} not found")



@router.get("/api/jobs/{id}")
async def read_workgraph(id: int):
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

