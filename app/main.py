from fastapi import Depends, FastAPI, status
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Atividade
from app.schemas import AtividadeCreate, AtividadeResponse


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AgendaFlow API",
    description="API para gerenciamento pessoal de atividades e tempo.",
    version="0.1.0"
)


@app.get("/")
def inicio():
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
    db: Session = Depends(get_db)
):

    atividades = (
        db.query(Atividade)
        .order_by(
            Atividade.data,
            Atividade.hora_inicio
        )
        .all()
    )

    return atividades