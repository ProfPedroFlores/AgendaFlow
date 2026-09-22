from pathlib import Path

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from fastapi import Depends, FastAPI, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Atividade
from app.schemas import (
    AtividadeCreate,
    AtividadeResponse,
    AtividadeUpdate
)


Base.metadata.create_all(bind=engine)


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

    dados_atualizacao = dados.model_dump(
        exclude_unset=True
    )

    nova_hora_inicio = dados_atualizacao.get(
        "hora_inicio",
        atividade.hora_inicio
    )

    nova_hora_fim = dados_atualizacao.get(
        "hora_fim",
        atividade.hora_fim
    )

    if (
        nova_hora_fim is not None
        and nova_hora_fim <= nova_hora_inicio
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A hora final deve ser posterior à hora inicial."
        )

    for campo, valor in dados_atualizacao.items():
        setattr(
            atividade,
            campo,
            valor
        )

    db.commit()

    db.refresh(atividade)

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

    atividade.concluida = True

    db.commit()

    db.refresh(atividade)

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