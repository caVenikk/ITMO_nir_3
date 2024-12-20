from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import TypeAdapter

from app_types.project import ProjectType
from constants import DATA_DIR
from schemas.metrics import IterationsGet, ProjectsGet

router = APIRouter()


@router.get("/projects")
async def get_projects() -> ProjectsGet:
    """Get projects"""
    projects = [path.name for path in DATA_DIR.iterdir() if path.is_dir()]
    return TypeAdapter(ProjectsGet).validate_python({"projects": projects})


@router.get("/iterations/{project}")
async def get_iterations_variants(project: ProjectType):
    """Get iterations variants"""
    iterations_variants = [int(path.stem.split("_")[-1]) for path in DATA_DIR.glob(f"{project}/metrics_data_*.csv")]
    return TypeAdapter(IterationsGet).validate_python({"iterations": sorted(iterations_variants)})


@router.get("/{project}")
async def get_metrics(project: ProjectType, iterations: int = 10000) -> FileResponse:
    """Get metrics data file"""
    data_path = DATA_DIR / project / f"metrics_data_{iterations}.csv"
    if not data_path.exists():
        raise HTTPException(status_code=404, detail="Metrics data file not found")

    return FileResponse(data_path, media_type="text/csv", filename=f"metrics_data_{iterations}.csv")
