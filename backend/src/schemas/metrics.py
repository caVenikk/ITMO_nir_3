from pydantic import BaseModel

from app_types.project import ProjectType


class ProjectsGet(BaseModel):
    projects: list[ProjectType]


class IterationsGet(BaseModel):
    iterations: list[int]
