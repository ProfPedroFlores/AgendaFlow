from datetime import date, datetime, time
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator
)


TipoRecorrencia = Literal[
    "diaria",
    "semanal"
]


DiaSemana = Literal[
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "domingo"
]


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


    recorrente: bool = False

    tipo_recorrencia: TipoRecorrencia | None = None

    dias_semana: list[DiaSemana] | None = None

    data_fim_recorrencia: date | None = None


    @model_validator(mode="after")
    def validar_atividade(self):

        # -----------------------------
        # HORÁRIOS
        # -----------------------------

        if (
            self.hora_fim is not None
            and self.hora_fim <= self.hora_inicio
        ):

            raise ValueError(
                "A hora final deve ser posterior à hora inicial."
            )


        # -----------------------------
        # NÃO RECORRENTE
        # -----------------------------

        if not self.recorrente:

            self.tipo_recorrencia = None

            self.dias_semana = None

            self.data_fim_recorrencia = None

            return self


        # -----------------------------
        # RECORRENTE
        # -----------------------------

        if self.tipo_recorrencia is None:

            raise ValueError(
                "Informe o tipo de recorrência."
            )


        if self.data_fim_recorrencia is None:

            raise ValueError(
                "Informe até quando a atividade deve se repetir."
            )


        if (
            self.data_fim_recorrencia
            < self.data
        ):

            raise ValueError(
                "A data final da recorrência não pode ser anterior à data inicial."
            )


        # -----------------------------
        # SEMANAL
        # -----------------------------

        if (
            self.tipo_recorrencia
            == "semanal"
        ):

            if not self.dias_semana:

                raise ValueError(
                    "Selecione pelo menos um dia da semana."
                )


        # -----------------------------
        # DIÁRIA
        # -----------------------------

        if (
            self.tipo_recorrencia
            == "diaria"
        ):

            self.dias_semana = None


        return self


class AtividadeCreate(
    AtividadeBase
):
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


    recorrente: bool | None = None

    tipo_recorrencia: TipoRecorrencia | None = None

    dias_semana: list[DiaSemana] | None = None

    data_fim_recorrencia: date | None = None


class AtividadeResponse(
    AtividadeBase
):

    id: int

    concluida: bool

    criado_em: datetime


    model_config = ConfigDict(
        from_attributes=True
    )


class OcorrenciaResponse(BaseModel):

    id: int

    titulo: str

    descricao: str | None

    categoria: str

    data: date

    hora_inicio: time

    hora_fim: time | None

    prioridade: Literal[
        "baixa",
        "media",
        "alta"
    ]

    concluida: bool

    recorrente: bool

    tipo_recorrencia: TipoRecorrencia | None