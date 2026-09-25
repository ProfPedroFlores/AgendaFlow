from pathlib import Path

from pydantic import ValidationError

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from fastapi import Depends, FastAPI, HTTPException, Response, status
from sqlalchemy.orm import Session

from datetime import date, timedelta

from app.database import Base, engine, get_db
from app.models import Atividade, OcorrenciaConcluida
from app.schemas import (
    AtividadeCreate,
    AtividadeResponse,
    AtividadeUpdate,
    OcorrenciaResponse,
    OcorrenciaConclusaoResponse
)


Base.metadata.create_all(bind=engine)

DIAS_SEMANA = {
    0: "segunda",
    1: "terca",
    2: "quarta",
    3: "quinta",
    4: "sexta",
    5: "sabado",
    6: "domingo"
}

app = FastAPI(
    title="AgendaFlow API",
    description="API para gerenciamento pessoal de atividades e tempo.",
    version="0.1.0"
)

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)

@app.get(
    "/",
    include_in_schema=False
)
def pagina_inicial():
    return FileResponse(
        FRONTEND_DIR / "index.html"
    )

def buscar_atividade_por_id(
    atividade_id: int,
    db: Session
):
    atividade = (
        db.query(Atividade)
        .filter(Atividade.id == atividade_id)
        .first()
    )

    if atividade is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atividade não encontrada."
        )

    return atividade

@app.get("/status")
def status_api():
    return {
        "mensagem": "AgendaFlow está funcionando!"
    }

@app.post(
    "/atividades",
    response_model=AtividadeResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_atividade(
    atividade: AtividadeCreate,
    db: Session = Depends(get_db)
):

    nova_atividade = Atividade(
        **atividade.model_dump()
    )

    db.add(nova_atividade)

    db.commit()

    db.refresh(nova_atividade)

    return nova_atividade

@app.get(
    "/atividades",
    response_model=list[AtividadeResponse]
)
def listar_atividades(
    categoria: str | None = None,
    concluida: bool | None = None,
    db: Session = Depends(get_db)
):

    consulta = db.query(Atividade)

    if categoria is not None:
        consulta = consulta.filter(
            Atividade.categoria == categoria
        )

    if concluida is not None:
        consulta = consulta.filter(
            Atividade.concluida == concluida
        )

    atividades = (
        consulta
        .order_by(
            Atividade.data,
            Atividade.hora_inicio
        )
        .all()
    )

    return atividades

@app.get(
    "/atividades/{atividade_id}",
    response_model=AtividadeResponse
)
def buscar_atividade(
    atividade_id: int,
    db: Session = Depends(get_db)
):

    return buscar_atividade_por_id(
        atividade_id,
        db
    )

@app.patch(
    "/atividades/{atividade_id}",
    response_model=AtividadeResponse
)
def atualizar_atividade(
    atividade_id: int,
    dados: AtividadeUpdate,
    db: Session = Depends(get_db)
):

    atividade = buscar_atividade_por_id(
        atividade_id,
        db
    )


    dados_atualizacao = (
        dados.model_dump(
            exclude_unset=True
        )
    )


    dados_completos = {

        "titulo":
            atividade.titulo,

        "descricao":
            atividade.descricao,

        "categoria":
            atividade.categoria,

        "data":
            atividade.data,

        "hora_inicio":
            atividade.hora_inicio,

        "hora_fim":
            atividade.hora_fim,

        "prioridade":
            atividade.prioridade,

        "recorrente":
            atividade.recorrente,

        "tipo_recorrencia":
            atividade.tipo_recorrencia,

        "dias_semana":
            atividade.dias_semana,

        "data_fim_recorrencia":
            atividade.data_fim_recorrencia
    }


    dados_completos.update(
        dados_atualizacao
    )


    try:

        dados_validados = (
            AtividadeCreate(
                **dados_completos
            )
        )

    except ValidationError as erro:

        raise HTTPException(
            status_code=
                status.HTTP_422_UNPROCESSABLE_ENTITY,

            detail=
                erro.errors()
        )


    valores_validados = (
        dados_validados.model_dump()
    )


    campos_alterados = set(
        dados_atualizacao.keys()
    )


    # Mudanças na recorrência podem exigir
    # limpeza de campos relacionados.
    if (
        "recorrente"
        in campos_alterados
        or "tipo_recorrencia"
        in campos_alterados
    ):

        campos_alterados.update(
            {
                "recorrente",
                "tipo_recorrencia",
                "dias_semana",
                "data_fim_recorrencia"
            }
        )


    for campo in campos_alterados:

        setattr(
            atividade,
            campo,
            valores_validados[campo]
        )


    db.commit()

    db.refresh(
        atividade
    )


    return atividade

@app.patch(
    "/atividades/{atividade_id}/concluir",
    response_model=AtividadeResponse
)
def concluir_atividade(
    atividade_id: int,
    db: Session = Depends(get_db)
):

    atividade = buscar_atividade_por_id(
        atividade_id,
        db
    )

    if atividade.recorrente:

        raise HTTPException(
            status_code=
                status.HTTP_422_UNPROCESSABLE_ENTITY,

            detail=(
                "Atividades recorrentes devem ser "
                "concluídas por ocorrência."
            )
        )


    atividade.concluida = True


    db.commit()


    db.refresh(
        atividade
    )


    return atividade

@app.delete(
    "/atividades/{atividade_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def excluir_atividade(
    atividade_id: int,
    db: Session = Depends(get_db)
):

    atividade = buscar_atividade_por_id(
        atividade_id,
        db
    )

    db.delete(atividade)

    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )

@app.get(
    "/ocorrencias",
    response_model=list[OcorrenciaResponse]
)
def listar_ocorrencias(
    data_inicio: date,
    data_fim: date,
    db: Session = Depends(get_db)
):

    if (
        data_fim < data_inicio
    ):

        raise HTTPException(
            status_code=
                status.HTTP_422_UNPROCESSABLE_ENTITY,

            detail=
                "A data final deve ser posterior ou igual à data inicial."
        )


    quantidade_dias = (
        data_fim
        - data_inicio
    ).days


    if (
        quantidade_dias > 62
    ):

        raise HTTPException(
            status_code=
                status.HTTP_422_UNPROCESSABLE_ENTITY,

            detail=
                "O intervalo máximo para consulta é de 62 dias."
        )


    atividades = (
        db.query(Atividade)
        .all()
    )


    registros_concluidos = (
        db.query(OcorrenciaConcluida)
        .filter(
            OcorrenciaConcluida.data_ocorrencia
            >= data_inicio,

            OcorrenciaConcluida.data_ocorrencia
            <= data_fim
        )
        .all()
    )


    ocorrencias_concluidas = {
        (
            registro.atividade_id,
            registro.data_ocorrencia
        )
        for registro
        in registros_concluidos
    }


    ocorrencias = []


    data_atual = data_inicio


    while (
        data_atual <= data_fim
    ):

        for atividade in atividades:

            if not atividade_ocorre_na_data(
                atividade,
                data_atual
            ):
                continue


            if atividade.recorrente:

                concluida = (
                    atividade.id,
                    data_atual
                ) in ocorrencias_concluidas

            else:

                concluida = (
                    atividade.concluida
                )


            ocorrencias.append(
                {
                    "id":
                        atividade.id,

                    "titulo":
                        atividade.titulo,

                    "descricao":
                        atividade.descricao,

                    "categoria":
                        atividade.categoria,

                    "data":
                        data_atual,

                    "hora_inicio":
                        atividade.hora_inicio,

                    "hora_fim":
                        atividade.hora_fim,

                    "prioridade":
                        atividade.prioridade,

                    "concluida":
                        concluida,

                    "recorrente":
                        atividade.recorrente,

                    "tipo_recorrencia":
                        atividade.tipo_recorrencia
                }
            )


        data_atual += timedelta(
            days=1
        )


    ocorrencias.sort(
        key=lambda ocorrencia: (
            ocorrencia["data"],
            ocorrencia["hora_inicio"]
        )
    )


    return ocorrencias

@app.patch(
    "/ocorrencias/{atividade_id}/{data_ocorrencia}/concluir",
    response_model=OcorrenciaConclusaoResponse
)
def concluir_ocorrencia(
    atividade_id: int,
    data_ocorrencia: date,
    db: Session = Depends(get_db)
):

    atividade = buscar_atividade_por_id(
        atividade_id,
        db
    )


    validar_ocorrencia_recorrente(
        atividade,
        data_ocorrencia
    )


    ocorrencia = (
        db.query(OcorrenciaConcluida)
        .filter(
            OcorrenciaConcluida.atividade_id
            == atividade_id,

            OcorrenciaConcluida.data_ocorrencia
            == data_ocorrencia
        )
        .first()
    )


    if ocorrencia is None:

        ocorrencia = OcorrenciaConcluida(
            atividade_id=atividade_id,
            data_ocorrencia=data_ocorrencia
        )

        db.add(
            ocorrencia
        )

        db.commit()

        db.refresh(
            ocorrencia
        )


    return {
        "atividade_id":
            ocorrencia.atividade_id,

        "data_ocorrencia":
            ocorrencia.data_ocorrencia,

        "concluida":
            True,

        "concluida_em":
            ocorrencia.concluida_em
    }

@app.delete(
    "/ocorrencias/{atividade_id}/{data_ocorrencia}/concluir",
    status_code=status.HTTP_204_NO_CONTENT
)
def reabrir_ocorrencia(
    atividade_id: int,
    data_ocorrencia: date,
    db: Session = Depends(get_db)
):

    atividade = buscar_atividade_por_id(
        atividade_id,
        db
    )


    validar_ocorrencia_recorrente(
        atividade,
        data_ocorrencia
    )


    ocorrencia = (
        db.query(OcorrenciaConcluida)
        .filter(
            OcorrenciaConcluida.atividade_id
            == atividade_id,

            OcorrenciaConcluida.data_ocorrencia
            == data_ocorrencia
        )
        .first()
    )


    if ocorrencia is not None:

        db.delete(
            ocorrencia
        )

        db.commit()


    return Response(
        status_code=
            status.HTTP_204_NO_CONTENT
    )

def atividade_ocorre_na_data(
    atividade: Atividade,
    data_consultada: date
) -> bool:

    # A recorrência ainda não começou.
    if (
        data_consultada
        < atividade.data
    ):
        return False


    # Atividade normal.
    if not atividade.recorrente:

        return (
            data_consultada
            == atividade.data
        )


    # A recorrência já terminou.
    if (
        atividade.data_fim_recorrencia
        is not None
        and data_consultada
        > atividade.data_fim_recorrencia
    ):
        return False


    # Recorrência diária.
    if (
        atividade.tipo_recorrencia
        == "diaria"
    ):
        return True


    # Recorrência semanal.
    if (
        atividade.tipo_recorrencia
        == "semanal"
    ):

        dia_semana = DIAS_SEMANA[
            data_consultada.weekday()
        ]

        return (
            dia_semana
            in (
                atividade.dias_semana
                or []
            )
        )


    return False

def validar_ocorrencia_recorrente(
    atividade: Atividade,
    data_ocorrencia: date
):

    if not atividade.recorrente:

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Esta atividade não é recorrente."
        )


    if not atividade_ocorre_na_data(
        atividade,
        data_ocorrencia
    ):

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não existe ocorrência desta atividade nesta data."
        )
