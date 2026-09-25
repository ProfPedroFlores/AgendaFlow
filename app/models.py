from datetime import date, datetime, time

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Integer,
    JSON,
    String,
    Text,
    Time,
    func
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Atividade(Base):
    __tablename__ = "atividades"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    titulo: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    descricao: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    categoria: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Pessoal"
    )

    data: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    hora_inicio: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )

    hora_fim: Mapped[time | None] = mapped_column(
        Time,
        nullable=True
    )

    prioridade: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="media"
    )

    concluida: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    recorrente: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )


    tipo_recorrencia: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )


    dias_semana: Mapped[list[str] | None] = mapped_column(
        JSON,
        nullable=True
    )


    data_fim_recorrencia: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    criado_em: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now()
    )