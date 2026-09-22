from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AtividadeBase(BaseModel):
    titulo: str = Field(
        min_length=3,
        max_length=120
    )

    descricao: str | None = None

    categoria: str = "Pessoal"

    data: date

    hora_inicio: time

    hora_fim: time | None = None

    prioridade: Literal[
        "baixa",
        "media",
        "alta"
    ] = "media"

    @model_validator(mode="after")
    def validar_horarios(self):
        if (
            self.hora_fim is not None
            and self.hora_fim <= self.hora_inicio
        ):
            raise ValueError(
                "A hora final deve ser posterior à hora inicial."
            )

        return self


class AtividadeCreate(AtividadeBase):
    pass


class AtividadeUpdate(BaseModel):
    titulo: str | None = Field(
        default=None,
        min_length=3,
        max_length=120
    )

    descricao: str | None = None

    categoria: str | None = None

    data: date | None = None

    hora_inicio: time | None = None

    hora_fim: time | None = None

    prioridade: Literal[
        "baixa",
        "media",
        "alta"
    ] | None = None


class AtividadeResponse(AtividadeBase):
    id: int

    concluida: bool

    criado_em: datetime

    model_config = ConfigDict(
        from_attributes=True
    )