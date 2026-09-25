const form =
    document.querySelector("#form-atividade");

const listaAtividades =
    document.querySelector("#lista-atividades");

const contadorAtividades =
    document.querySelector("#contador-atividades");

const mensagem =
    document.querySelector("#mensagem");

const botaoSalvar =
    document.querySelector("#botao-salvar");

const botaoCancelarEdicao =
    document.querySelector("#botao-cancelar-edicao");

const agendaSemana =
    document.querySelector("#agenda-semana");

const periodoSemana =
    document.querySelector("#periodo-semana");

const botaoSemanaAnterior =
    document.querySelector("#semana-anterior");

const botaoSemanaAtual =
    document.querySelector("#semana-atual");

const botaoSemanaProxima =
    document.querySelector("#semana-proxima");

const filtroCategoria =
    document.querySelector("#filtro-categoria");

const filtroPrioridade =
    document.querySelector("#filtro-prioridade");

const filtroStatus =
    document.querySelector("#filtro-status");

const botaoLimparFiltros =
    document.querySelector("#limpar-filtros");

const campoRecorrente =
    document.querySelector("#recorrente");

const painelRecorrencia =
    document.querySelector("#painel-recorrencia");

const campoTipoRecorrencia =
    document.querySelector("#tipo_recorrencia");

const grupoDiasSemana =
    document.querySelector("#grupo-dias-semana");

const campoDataFimRecorrencia =
    document.querySelector("#data_fim_recorrencia");

const checkboxesDias =
    Array.from(
        document.querySelectorAll(
            'input[name="dias_semana"]'
        )
    );

const HORA_INICIAL = 6;
const HORA_FINAL = 24;
const ALTURA_HORA = 56;

let atividadeEmEdicao = null;
let atividadesCarregadas = [];
let ocorrenciasCarregadas = [];

let inicioSemanaExibida =
    obterInicioSemana(
        new Date()
    );

async function carregarAtividades() {
    try {
        const resposta =
            await fetch("/atividades");

        if (!resposta.ok) {
            throw new Error(
                `Erro ${resposta.status} ao carregar atividades.`
            );
        }

        atividadesCarregadas =
            await resposta.json();

        exibirAtividadesFiltradas();
    } catch (erro) {
        console.error(
            "Erro em carregarAtividades:",
            erro
        );

        listaAtividades.innerHTML = "";

        const aviso =
            document.createElement("div");

        aviso.className =
            "sem-atividades";

        aviso.textContent =
            "Erro ao carregar as atividades.";

        listaAtividades.appendChild(
            aviso
        );
    }
}

async function carregarOcorrenciasSemana() {
    try {
        const dataInicio =
            dataParaISO(
                inicioSemanaExibida
            );

        const dataFim =
            dataParaISO(
                adicionarDias(
                    inicioSemanaExibida,
                    6
                )
            );

        const parametros =
            new URLSearchParams({
                data_inicio:
                    dataInicio,

                data_fim:
                    dataFim
            });

        const resposta =
            await fetch(
                `/ocorrencias?${parametros.toString()}`
            );

        if (!resposta.ok) {
            throw new Error(
                `Erro ${resposta.status} ao carregar ocorrências.`
            );
        }

        ocorrenciasCarregadas =
            await resposta.json();

        renderizarAgendaSemanal(
            obterOcorrenciasFiltradas()
        );
    } catch (erro) {
        console.error(
            "Erro em carregarOcorrenciasSemana:",
            erro
        );

        ocorrenciasCarregadas = [];

        agendaSemana.innerHTML = "";

        const aviso =
            document.createElement("p");

        aviso.textContent =
            "Não foi possível carregar a agenda semanal.";

        agendaSemana.appendChild(
            aviso
        );
    }
}

async function carregarTudo() {
    await Promise.all([
        carregarAtividades(),
        carregarOcorrenciasSemana()
    ]);
}

function atividadePassaNosFiltros(
    atividade
) {
    const categoriaSelecionada =
        filtroCategoria.value;

    const prioridadeSelecionada =
        filtroPrioridade.value;

    const statusSelecionado =
        filtroStatus.value;

    if (
        categoriaSelecionada
        &&
        atividade.categoria
        !== categoriaSelecionada
    ) {
        return false;
    }

    if (
        prioridadeSelecionada
        &&
        atividade.prioridade
        !== prioridadeSelecionada
    ) {
        return false;
    }

    if (
        statusSelecionado
        === "pendentes"
        &&
        atividade.concluida
    ) {
        return false;
    }

    if (
        statusSelecionado
        === "concluidas"
        &&
        !atividade.concluida
    ) {
        return false;
    }

    return true;
}

function obterAtividadesFiltradas() {
    return atividadesCarregadas.filter(
        atividadePassaNosFiltros
    );
}

function obterOcorrenciasFiltradas() {
    return ocorrenciasCarregadas.filter(
        atividadePassaNosFiltros
    );
}

function aplicarFiltros() {
    exibirAtividadesFiltradas();

    renderizarAgendaSemanal(
        obterOcorrenciasFiltradas()
    );
}

function exibirAtividadesFiltradas() {
    const atividadesFiltradas =
        obterAtividadesFiltradas();

    exibirAtividades(
        atividadesFiltradas
    );

    atualizarContador(
        atividadesFiltradas.length,
        atividadesCarregadas.length
    );
}

function atualizarContador(
    quantidadeFiltrada,
    quantidadeTotal
) {
    if (
        quantidadeFiltrada
        === quantidadeTotal
    ) {
        contadorAtividades.textContent =
            `${quantidadeTotal} atividade${
                quantidadeTotal === 1
                    ? ""
                    : "s"
            }`;

        return;
    }

    contadorAtividades.textContent =
        `${quantidadeFiltrada} de ${quantidadeTotal} atividades`;
}

function exibirAtividades(
    atividades
) {
    listaAtividades.innerHTML = "";

    if (
        atividades.length === 0
    ) {
        const aviso =
            document.createElement("div");

        aviso.className =
            "sem-atividades";

        const existemFiltros =
            filtroCategoria.value
            ||
            filtroPrioridade.value
            ||
            filtroStatus.value
            !== "todas";

        aviso.textContent =
            existemFiltros
                ? "Nenhuma atividade corresponde aos filtros selecionados."
                : "Nenhuma atividade cadastrada.";

        listaAtividades.appendChild(
            aviso
        );

        return;
    }

    atividades.forEach(
        atividade => {
            listaAtividades.appendChild(
                criarCardAtividade(
                    atividade
                )
            );
        }
    );
}

function criarCardAtividade(
    atividade
) {
    const card =
        document.createElement("article");

    card.className =
        "atividade";

    if (
        atividade.concluida
        &&
        !atividade.recorrente
    ) {
        card.classList.add(
            "atividade-concluida"
        );
    }

    const cabecalho =
        document.createElement("div");

    cabecalho.className =
        "atividade-cabecalho";

    const titulo =
        document.createElement("h3");

    titulo.textContent =
        atividade.titulo;

    const prioridade =
        document.createElement("span");

    prioridade.className =
        "prioridade";

    prioridade.textContent =
        atividade.prioridade;

    cabecalho.appendChild(
        titulo
    );

    cabecalho.appendChild(
        prioridade
    );

    const categoria =
        document.createElement("p");

    categoria.textContent =
        atividade.categoria;

    const descricao =
        document.createElement("p");

    descricao.textContent =
        atividade.descricao
        ?? "Sem descrição.";

    const data =
        document.createElement("p");

    data.className =
        "atividade-data";

    if (
        atividade.recorrente
    ) {
        data.textContent =
            criarDescricaoRecorrencia(
                atividade
            );
    } else {
        data.textContent =
            `${formatarData(
                atividade.data
            )} • ${formatarHora(
                atividade.hora_inicio
            )} - ${formatarHora(
                atividade.hora_fim
            )}`;
    }

    card.appendChild(
        cabecalho
    );

    card.appendChild(
        categoria
    );

    card.appendChild(
        descricao
    );

    card.appendChild(
        data
    );

    if (
        atividade.recorrente
    ) {
        const orientacao =
            document.createElement("p");

        orientacao.className =
            "orientacao-recorrencia";

        orientacao.textContent =
            "Conclua cada ocorrência diretamente na agenda semanal.";

        card.appendChild(
            orientacao
        );
    }

    if (
        atividadeTemConflitoNaSemana(
            atividade
        )
    ) {
        const avisoConflito =
            document.createElement("p");

        avisoConflito.className =
            "aviso-conflito";

        avisoConflito.textContent =
            "Conflito de horário nesta semana";

        card.appendChild(
            avisoConflito
        );
    }

    const acoes =
        document.createElement("div");

    acoes.className =
        "acoes-atividade";

    if (
        !atividade.recorrente
    ) {
        const botaoConcluir =
            document.createElement("button");

        botaoConcluir.type =
            "button";

        botaoConcluir.className =
            "botao-acao";

        botaoConcluir.textContent =
            atividade.concluida
                ? "Concluída"
                : "Concluir";

        botaoConcluir.disabled =
            atividade.concluida;

        botaoConcluir.addEventListener(
            "click",
            () => concluirAtividade(
                atividade.id
            )
        );

        acoes.appendChild(
            botaoConcluir
        );
    }

    const botaoEditar =
        document.createElement("button");

    botaoEditar.type =
        "button";

    botaoEditar.className =
        "botao-acao";

    botaoEditar.textContent =
        "Editar";

    botaoEditar.addEventListener(
        "click",
        () => iniciarEdicao(
            atividade
        )
    );

    const botaoExcluir =
        document.createElement("button");

    botaoExcluir.type =
        "button";

    botaoExcluir.className =
        "botao-acao botao-excluir";

    botaoExcluir.textContent =
        "Excluir";

    botaoExcluir.addEventListener(
        "click",
        () => excluirAtividade(
            atividade.id,
            atividade.recorrente
        )
    );

    acoes.appendChild(
        botaoEditar
    );

    acoes.appendChild(
        botaoExcluir
    );

    card.appendChild(
        acoes
    );

    return card;
}

function criarDescricaoRecorrencia(
    atividade
) {
    const horario =
        `${formatarHora(
            atividade.hora_inicio
        )} - ${formatarHora(
            atividade.hora_fim
        )}`;

    const ate =
        atividade.data_fim_recorrencia
            ? ` até ${formatarData(
                atividade.data_fim_recorrencia
            )}`
            : "";

    if (
        atividade.tipo_recorrencia
        === "diaria"
    ) {
        return (
            `Diariamente • ${horario}${ate}`
        );
    }

    if (
        atividade.tipo_recorrencia
        === "semanal"
    ) {
        const nomes = {
            segunda: "Seg",
            terca: "Ter",
            quarta: "Qua",
            quinta: "Qui",
            sexta: "Sex",
            sabado: "Sáb",
            domingo: "Dom"
        };

        const dias =
            (
                atividade.dias_semana
                ?? []
            )
                .map(
                    dia =>
                        nomes[dia]
                        ?? dia
                )
                .join(
                    ", "
                );

        return (
            `${dias} • ${horario}${ate}`
        );
    }

    return (
        `${formatarData(
            atividade.data
        )} • ${horario}`
    );
}

function formatarData(
    data
) {
    if (
        !data
    ) {
        return "";
    }

    const [
        ano,
        mes,
        dia
    ] = data.split("-");

    return (
        `${dia}/${mes}/${ano}`
    );
}

function formatarHora(
    hora
) {
    if (
        !hora
    ) {
        return "--:--";
    }

    return hora.slice(
        0,
        5
    );
}

function definirDataAtual() {
    const campoData =
        document.querySelector(
            "#data"
        );

    campoData.value =
        dataParaISO(
            new Date()
        );
}

function obterInicioSemana(
    data
) {
    const resultado =
        new Date(
            data.getFullYear(),
            data.getMonth(),
            data.getDate()
        );

    const diaSemana =
        resultado.getDay();

    const deslocamento =
        diaSemana === 0
            ? -6
            : 1 - diaSemana;

    resultado.setDate(
        resultado.getDate()
        + deslocamento
    );

    return resultado;
}

function adicionarDias(
    data,
    quantidade
) {
    const resultado =
        new Date(
            data.getFullYear(),
            data.getMonth(),
            data.getDate()
        );

    resultado.setDate(
        resultado.getDate()
        + quantidade
    );

    return resultado;
}

function dataParaISO(
    data
) {
    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            data.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        `${ano}-${mes}-${dia}`
    );
}

function formatarPeriodoSemana(
    inicio
) {
    const fim =
        adicionarDias(
            inicio,
            6
        );

    const inicioFormatado =
        inicio.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short"
            }
        );

    const fimFormatado =
        fim.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    return (
        `${inicioFormatado} — ${fimFormatado}`
    );
}

function horarioParaMinutos(
    horario
) {
    if (
        !horario
        ||
        typeof horario
        !== "string"
    ) {
        return null;
    }

    const partes =
        horario.split(":");

    if (
        partes.length < 2
    ) {
        return null;
    }

    const hora =
        Number(
            partes[0]
        );

    const minuto =
        Number(
            partes[1]
        );

    if (
        Number.isNaN(hora)
        ||
        Number.isNaN(minuto)
    ) {
        return null;
    }

    return (
        hora * 60
        + minuto
    );
}

function obterIntervaloAtividade(
    atividade
) {
    const inicio =
        horarioParaMinutos(
            atividade.hora_inicio
        );

    if (
        inicio === null
    ) {
        return null;
    }

    const fim =
        atividade.hora_fim
            ? horarioParaMinutos(
                atividade.hora_fim
            )
            : inicio + 60;

    if (
        fim === null
    ) {
        return null;
    }

    return {
        inicio,
        fim
    };
}

function horariosConflitam(
    atividadeA,
    atividadeB
) {
    if (
        atividadeA.data
        !== atividadeB.data
    ) {
        return false;
    }

    const intervaloA =
        obterIntervaloAtividade(
            atividadeA
        );

    const intervaloB =
        obterIntervaloAtividade(
            atividadeB
        );

    if (
        intervaloA === null
        ||
        intervaloB === null
    ) {
        return false;
    }

    return (
        intervaloA.inicio
        < intervaloB.fim
        &&
        intervaloA.fim
        > intervaloB.inicio
    );
}

function ocorrenciaTemConflito(
    ocorrencia
) {
    return ocorrenciasCarregadas.some(
        outra => {
            const mesmaOcorrencia =
                outra.id
                === ocorrencia.id
                &&
                outra.data
                === ocorrencia.data;

            if (
                mesmaOcorrencia
            ) {
                return false;
            }

            return horariosConflitam(
                ocorrencia,
                outra
            );
        }
    );
}

function atividadeTemConflitoNaSemana(
    atividade
) {
    return ocorrenciasCarregadas.some(
        ocorrencia => {
            if (
                ocorrencia.id
                !== atividade.id
            ) {
                return false;
            }

            return ocorrenciaTemConflito(
                ocorrencia
            );
        }
    );
}

function organizarConflitos(
    atividades
) {
    const eventos =
        atividades
            .map(
                atividade => {
                    const intervalo =
                        obterIntervaloAtividade(
                            atividade
                        );

                    if (
                        intervalo === null
                    ) {
                        return null;
                    }

                    return {
                        atividade,
                        inicio:
                            intervalo.inicio,
                        fim:
                            intervalo.fim
                    };
                }
            )
            .filter(
                evento =>
                    evento !== null
            )
            .sort(
                (a, b) => {
                    if (
                        a.inicio
                        !== b.inicio
                    ) {
                        return (
                            a.inicio
                            - b.inicio
                        );
                    }

                    return (
                        a.fim
                        - b.fim
                    );
                }
            );

    const grupos = [];

    let grupoAtual = [];
    let fimGrupo =
        -Infinity;

    eventos.forEach(
        evento => {
            if (
                grupoAtual.length === 0
                ||
                evento.inicio < fimGrupo
            ) {
                grupoAtual.push(
                    evento
                );

                fimGrupo =
                    Math.max(
                        fimGrupo,
                        evento.fim
                    );
            } else {
                grupos.push(
                    grupoAtual
                );

                grupoAtual = [
                    evento
                ];

                fimGrupo =
                    evento.fim;
            }
        }
    );

    if (
        grupoAtual.length > 0
    ) {
        grupos.push(
            grupoAtual
        );
    }

    const resultado = [];

    grupos.forEach(
        grupo => {
            const fimDasColunas =
                [];

            grupo.forEach(
                evento => {
                    let coluna =
                        fimDasColunas.findIndex(
                            fim =>
                                fim
                                <= evento.inicio
                        );

                    if (
                        coluna === -1
                    ) {
                        coluna =
                            fimDasColunas.length;

                        fimDasColunas.push(
                            evento.fim
                        );
                    } else {
                        fimDasColunas[
                            coluna
                        ] =
                            evento.fim;
                    }

                    evento.coluna =
                        coluna;
                }
            );

            const totalColunas =
                Math.max(
                    fimDasColunas.length,
                    1
                );

            grupo.forEach(
                evento => {
                    resultado.push(
                        {
                            atividade:
                                evento.atividade,
                            coluna:
                                evento.coluna,
                            totalColunas,
                            conflito:
                                totalColunas > 1
                        }
                    );
                }
            );
        }
    );

    return resultado;
}

function renderizarAgendaSemanal(
    ocorrencias
) {
    agendaSemana.innerHTML = "";

    periodoSemana.textContent =
        formatarPeriodoSemana(
            inicioSemanaExibida
        );

    const grade =
        document.createElement("div");

    grade.className =
        "agenda-grade";

    const alturaTotal =
        (
            HORA_FINAL
            - HORA_INICIAL
        )
        * ALTURA_HORA;

    grade.style.setProperty(
        "--altura-agenda",
        `${alturaTotal}px`
    );

    grade.style.setProperty(
        "--altura-hora",
        `${ALTURA_HORA}px`
    );

    const canto =
        document.createElement("div");

    canto.className =
        "agenda-canto";

    canto.textContent =
        "Horário";

    grade.appendChild(
        canto
    );

    const diasSemana =
        [];

    for (
        let indice = 0;
        indice < 7;
        indice++
    ) {
        const data =
            adicionarDias(
                inicioSemanaExibida,
                indice
            );

        diasSemana.push(
            data
        );

        grade.appendChild(
            criarCabecalhoDia(
                data
            )
        );
    }

    grade.appendChild(
        criarColunaHoras()
    );

    const colunasDias =
        [];

    diasSemana.forEach(
        data => {
            const coluna =
                document.createElement(
                    "div"
                );

            coluna.className =
                "agenda-dia-coluna";

            coluna.dataset.data =
                dataParaISO(
                    data
                );

            if (
                dataParaISO(data)
                === dataParaISO(
                    new Date()
                )
            ) {
                coluna.classList.add(
                    "hoje"
                );
            }

            colunasDias.push(
                coluna
            );

            grade.appendChild(
                coluna
            );
        }
    );

    diasSemana.forEach(
        (data, indiceDia) => {
            const dataISO =
                dataParaISO(
                    data
                );

            const ocorrenciasDoDia =
                ocorrencias.filter(
                    ocorrencia =>
                        ocorrencia.data
                        === dataISO
                );

            const organizadas =
                organizarConflitos(
                    ocorrenciasDoDia
                );

            organizadas.forEach(
                item => {
                    const bloco =
                        criarBlocoAgenda(
                            item.atividade,
                            item
                        );

                    if (
                        bloco !== null
                    ) {
                        colunasDias[
                            indiceDia
                        ].appendChild(
                            bloco
                        );
                    }
                }
            );
        }
    );

    agendaSemana.appendChild(
        grade
    );
}

function criarCabecalhoDia(
    data
) {
    const cabecalho =
        document.createElement("div");

    cabecalho.className =
        "agenda-dia-cabecalho";

    if (
        dataParaISO(data)
        === dataParaISO(
            new Date()
        )
    ) {
        cabecalho.classList.add(
            "hoje"
        );
    }

    const nome =
        document.createElement("span");

    nome.className =
        "agenda-dia-nome";

    nome.textContent =
        data
            .toLocaleDateString(
                "pt-BR",
                {
                    weekday:
                        "short"
                }
            )
            .replace(
                ".",
                ""
            );

    const numero =
        document.createElement("span");

    numero.className =
        "agenda-dia-data";

    numero.textContent =
        data.toLocaleDateString(
            "pt-BR",
            {
                day:
                    "2-digit",
                month:
                    "2-digit"
            }
        );

    cabecalho.appendChild(
        nome
    );

    cabecalho.appendChild(
        numero
    );

    return cabecalho;
}

function criarColunaHoras() {
    const coluna =
        document.createElement("div");

    coluna.className =
        "agenda-horas";

    for (
        let hora = HORA_INICIAL;
        hora < HORA_FINAL;
        hora++
    ) {
        const marcador =
            document.createElement("span");

        marcador.className =
            "agenda-hora";

        marcador.textContent =
            `${String(hora).padStart(
                2,
                "0"
            )}:00`;

        marcador.style.top =
            `${
                (
                    hora
                    - HORA_INICIAL
                )
                * ALTURA_HORA
            }px`;

        coluna.appendChild(
            marcador
        );
    }

    return coluna;
}

function criarBlocoAgenda(
    ocorrencia,
    layout
) {
    const intervalo =
        obterIntervaloAtividade(
            ocorrencia
        );

    if (
        intervalo === null
    ) {
        return null;
    }

    const limiteInicial =
        HORA_INICIAL
        * 60;

    const limiteFinal =
        HORA_FINAL
        * 60;

    const inicioVisivel =
        Math.max(
            intervalo.inicio,
            limiteInicial
        );

    const fimVisivel =
        Math.min(
            intervalo.fim,
            limiteFinal
        );

    if (
        fimVisivel <= limiteInicial
        ||
        inicioVisivel >= limiteFinal
        ||
        fimVisivel <= inicioVisivel
    ) {
        return null;
    }

    const minutosDesdeInicio =
        inicioVisivel
        - limiteInicial;

    const duracao =
        fimVisivel
        - inicioVisivel;

    const topo =
        (
            minutosDesdeInicio
            / 60
        )
        * ALTURA_HORA;

    const altura =
        Math.max(
            (
                duracao
                / 60
            )
            * ALTURA_HORA,
            32
        );

    const bloco =
        document.createElement("button");

    bloco.type =
        "button";

    bloco.className =
        "agenda-evento";

    if (
        ocorrencia.concluida
    ) {
        bloco.classList.add(
            "concluida"
        );
    }

    if (
        layout.conflito
    ) {
        bloco.classList.add(
            "conflito"
        );
    }

    bloco.style.top =
        `${topo}px`;

    bloco.style.height =
        `${altura}px`;

    const largura =
        100
        / layout.totalColunas;

    const esquerda =
        largura
        * layout.coluna;

    bloco.style.left =
        `calc(${esquerda}% + 3px)`;

    bloco.style.width =
        `calc(${largura}% - 6px)`;

    const titulo =
        document.createElement("strong");

    titulo.textContent =
        ocorrencia.titulo;

    const horario =
        document.createElement("span");

    horario.textContent =
        `${formatarHora(
            ocorrencia.hora_inicio
        )} - ${formatarHora(
            ocorrencia.hora_fim
        )}`;

    const categoria =
        document.createElement("span");

    categoria.textContent =
        ocorrencia.categoria;

    bloco.appendChild(
        titulo
    );

    bloco.appendChild(
        horario
    );

    bloco.appendChild(
        categoria
    );

    if (
        ocorrencia.recorrente
    ) {
        const indicadorRecorrencia =
            document.createElement("span");

        indicadorRecorrencia.className =
            "indicador-recorrencia";

        indicadorRecorrencia.textContent =
            "↻ Recorrente";

        bloco.appendChild(
            indicadorRecorrencia
        );

        if (
            ocorrencia.concluida
        ) {
            const indicadorConclusao =
                document.createElement("span");

            indicadorConclusao.className =
                "indicador-conclusao";

            indicadorConclusao.textContent =
                "✓ Concluída";

            bloco.appendChild(
                indicadorConclusao
            );
        }
    }

    if (
        layout.conflito
    ) {
        const aviso =
            document.createElement("span");

        aviso.className =
            "indicador-conflito";

        aviso.textContent =
            "Conflito";

        bloco.appendChild(
            aviso
        );
    }

    if (
        ocorrencia.recorrente
    ) {
        bloco.title =
            ocorrencia.concluida
                ? `${ocorrencia.titulo} — clique para reabrir esta ocorrência`
                : `${ocorrencia.titulo} — clique para concluir esta ocorrência`;

        bloco.addEventListener(
            "click",
            () => alternarConclusaoOcorrencia(
                ocorrencia
            )
        );
    } else {
        bloco.title =
            `${ocorrencia.titulo} — clique para editar`;

        bloco.addEventListener(
            "click",
            () => {
                const atividadeBase =
                    atividadesCarregadas.find(
                        atividade =>
                            atividade.id
                            === ocorrencia.id
                    );

                if (
                    atividadeBase
                ) {
                    iniciarEdicao(
                        atividadeBase
                    );
                }
            }
        );
    }

    return bloco;
}

function atualizarCamposRecorrencia() {
    const recorrente =
        campoRecorrente.checked;

    painelRecorrencia.hidden =
        !recorrente;

    if (
        !recorrente
    ) {
        campoTipoRecorrencia.value = "";
        campoDataFimRecorrencia.value = "";

        checkboxesDias.forEach(
            checkbox => {
                checkbox.checked = false;
            }
        );

        grupoDiasSemana.hidden = true;

        return;
    }

    const semanal =
        campoTipoRecorrencia.value
        === "semanal";

    grupoDiasSemana.hidden =
        !semanal;
}

function obterDiasSemanaSelecionados() {
    return checkboxesDias
        .filter(
            checkbox =>
                checkbox.checked
        )
        .map(
            checkbox =>
                checkbox.value
        );
}

function iniciarEdicao(
    atividade
) {
    atividadeEmEdicao =
        atividade.id;

    form.titulo.value =
        atividade.titulo;

    form.descricao.value =
        atividade.descricao
        ?? "";

    form.categoria.value =
        atividade.categoria;

    form.data.value =
        atividade.data;

    form.hora_inicio.value =
        formatarHora(
            atividade.hora_inicio
        );

    form.hora_fim.value =
        atividade.hora_fim
            ? formatarHora(
                atividade.hora_fim
            )
            : "";

    form.prioridade.value =
        atividade.prioridade;

    campoRecorrente.checked =
        atividade.recorrente;

    campoTipoRecorrencia.value =
        atividade.tipo_recorrencia
        ?? "";

    campoDataFimRecorrencia.value =
        atividade.data_fim_recorrencia
        ?? "";

    const diasAtividade =
        atividade.dias_semana
        ?? [];

    checkboxesDias.forEach(
        checkbox => {
            checkbox.checked =
                diasAtividade.includes(
                    checkbox.value
                );
        }
    );

    atualizarCamposRecorrencia();

    botaoSalvar.textContent =
        "Salvar alterações";

    botaoCancelarEdicao.hidden =
        false;

    mensagem.textContent =
        `Editando atividade #${atividade.id}`;

    form.titulo.focus();
}

function cancelarEdicao() {
    atividadeEmEdicao =
        null;

    form.reset();

    definirDataAtual();

    campoRecorrente.checked =
        false;

    atualizarCamposRecorrencia();

    botaoSalvar.textContent =
        "Adicionar atividade";

    botaoCancelarEdicao.hidden =
        true;

    mensagem.textContent =
        "";
}

form.addEventListener(
    "submit",
    async evento => {
        evento.preventDefault();

        mensagem.textContent = "";

        const recorrente =
            campoRecorrente.checked;

        const tipoRecorrencia =
            recorrente
                ? campoTipoRecorrencia.value
                : null;

        const diasSemana =
            recorrente
            &&
            tipoRecorrencia === "semanal"
                ? obterDiasSemanaSelecionados()
                : null;

        const dadosAtividade = {
            titulo:
                form.titulo.value.trim(),

            descricao:
                form.descricao.value.trim()
                || null,

            categoria:
                form.categoria.value,

            data:
                form.data.value,

            hora_inicio:
                form.hora_inicio.value,

            hora_fim:
                form.hora_fim.value
                || null,

            prioridade:
                form.prioridade.value,

            recorrente,

            tipo_recorrencia:
                tipoRecorrencia,

            dias_semana:
                diasSemana,

            data_fim_recorrencia:
                recorrente
                    ? campoDataFimRecorrencia.value
                    : null
        };

        const editando =
            atividadeEmEdicao
            !== null;

        const url =
            editando
                ? `/atividades/${atividadeEmEdicao}`
                : "/atividades";

        const metodo =
            editando
                ? "PATCH"
                : "POST";

        try {
            const resposta =
                await fetch(
                    url,
                    {
                        method:
                            metodo,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                dadosAtividade
                            )
                    }
                );

            if (
                !resposta.ok
            ) {
                const erro =
                    await resposta.json();

                console.error(
                    "Erro ao salvar:",
                    erro
                );

                mensagem.textContent =
                    extrairMensagemErro(
                        erro
                    );

                return;
            }

            mensagem.textContent =
                editando
                    ? "Atividade atualizada com sucesso!"
                    : "Atividade cadastrada com sucesso!";

            atividadeEmEdicao = null;

            form.reset();

            definirDataAtual();

            campoRecorrente.checked =
                false;

            atualizarCamposRecorrencia();

            botaoSalvar.textContent =
                "Adicionar atividade";

            botaoCancelarEdicao.hidden =
                true;

            await carregarTudo();
        } catch (erro) {
            console.error(
                "Erro ao comunicar com a API:",
                erro
            );

            mensagem.textContent =
                "Erro ao comunicar com a API.";
        }
    }
);

function extrairMensagemErro(
    erro
) {
    if (
        typeof erro.detail
        === "string"
    ) {
        return erro.detail;
    }

    if (
        Array.isArray(
            erro.detail
        )
    ) {
        const primeira =
            erro.detail[0];

        if (
            primeira
            &&
            primeira.msg
        ) {
            return primeira.msg.replace(
                /^Value error,\s*/i,
                ""
            );
        }
    }

    return (
        "Não foi possível salvar a atividade."
    );
}

async function alternarConclusaoOcorrencia(
    ocorrencia
) {
    const metodo =
        ocorrencia.concluida
            ? "DELETE"
            : "PATCH";

    const url =
        `/ocorrencias/${ocorrencia.id}/${ocorrencia.data}/concluir`;

    try {
        const resposta =
            await fetch(
                url,
                {
                    method:
                        metodo
                }
            );

        if (
            !resposta.ok
        ) {
            let detalhe =
                "Não foi possível atualizar esta ocorrência.";

            try {
                const erro =
                    await resposta.json();

                if (
                    typeof erro.detail
                    === "string"
                ) {
                    detalhe =
                        erro.detail;
                }
            } catch {
                // Mantém a mensagem padrão.
            }

            throw new Error(
                detalhe
            );
        }

        mensagem.textContent =
            ocorrencia.concluida
                ? "Ocorrência reaberta."
                : "Ocorrência concluída!";

        await carregarOcorrenciasSemana();

        exibirAtividadesFiltradas();

    } catch (erro) {
        console.error(
            "Erro ao atualizar ocorrência:",
            erro
        );

        mensagem.textContent =
            erro.message
            || "Erro ao atualizar ocorrência.";
    }
}

async function concluirAtividade(
    id
) {
    try {
        const resposta =
            await fetch(
                `/atividades/${id}/concluir`,
                {
                    method:
                        "PATCH"
                }
            );

        if (
            !resposta.ok
        ) {
            throw new Error(
                `Erro ${resposta.status} ao concluir atividade.`
            );
        }

        mensagem.textContent =
            "Atividade concluída!";

        await carregarTudo();

    } catch (erro) {
        console.error(
            "Erro ao concluir:",
            erro
        );

        mensagem.textContent =
            "Erro ao concluir atividade.";
    }
}

async function excluirAtividade(
    id,
    recorrente = false
) {
    const texto =
        recorrente
            ? "Deseja realmente excluir esta atividade recorrente? Toda a série será removida."
            : "Deseja realmente excluir esta atividade?";

    const confirmar =
        window.confirm(
            texto
        );

    if (
        !confirmar
    ) {
        return;
    }

    try {
        const resposta =
            await fetch(
                `/atividades/${id}`,
                {
                    method:
                        "DELETE"
                }
            );

        if (
            !resposta.ok
        ) {
            throw new Error(
                `Erro ${resposta.status} ao excluir atividade.`
            );
        }

        if (
            atividadeEmEdicao
            === id
        ) {
            cancelarEdicao();
        }

        mensagem.textContent =
            recorrente
                ? "Série recorrente excluída com sucesso!"
                : "Atividade excluída com sucesso!";

        await carregarTudo();
    } catch (erro) {
        console.error(
            "Erro ao excluir:",
            erro
        );

        mensagem.textContent =
            "Erro ao excluir atividade.";
    }
}

filtroCategoria.addEventListener(
    "change",
    aplicarFiltros
);

filtroPrioridade.addEventListener(
    "change",
    aplicarFiltros
);

filtroStatus.addEventListener(
    "change",
    aplicarFiltros
);

botaoLimparFiltros.addEventListener(
    "click",
    () => {
        filtroCategoria.value = "";
        filtroPrioridade.value = "";
        filtroStatus.value = "todas";

        aplicarFiltros();
    }
);

campoRecorrente.addEventListener(
    "change",
    atualizarCamposRecorrencia
);

campoTipoRecorrencia.addEventListener(
    "change",
    atualizarCamposRecorrencia
);

botaoSemanaAnterior.addEventListener(
    "click",
    async () => {
        inicioSemanaExibida =
            adicionarDias(
                inicioSemanaExibida,
                -7
            );

        await carregarOcorrenciasSemana();
    }
);

botaoSemanaAtual.addEventListener(
    "click",
    async () => {
        inicioSemanaExibida =
            obterInicioSemana(
                new Date()
            );

        await carregarOcorrenciasSemana();
    }
);

botaoSemanaProxima.addEventListener(
    "click",
    async () => {
        inicioSemanaExibida =
            adicionarDias(
                inicioSemanaExibida,
                7
            );

        await carregarOcorrenciasSemana();
    }
);

botaoCancelarEdicao.addEventListener(
    "click",
    cancelarEdicao
);

definirDataAtual();

atualizarCamposRecorrencia();

carregarTudo();
