const form = document.querySelector("#form-atividade");

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


const HORA_INICIAL = 6;
const HORA_FINAL = 24;
const ALTURA_HORA = 56;


let atividadeEmEdicao = null;
let atividadesCarregadas = [];

let inicioSemanaExibida =
    obterInicioSemana(new Date());


// =====================================================
// API - CARREGAR ATIVIDADES
// =====================================================

async function carregarAtividades() {

    try {

        const resposta =
            await fetch("/atividades");


        if (!resposta.ok) {

            throw new Error(
                `Erro ${resposta.status} ao carregar atividades.`
            );

        }


        const atividades =
            await resposta.json();


        atividadesCarregadas =
            atividades;


        aplicarFiltros();


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


        if (agendaSemana) {

            agendaSemana.innerHTML =
                "<p>Não foi possível carregar a agenda.</p>";

        }

    }

}


// =====================================================
// FILTROS
// =====================================================

function obterAtividadesFiltradas() {

    const categoriaSelecionada =
        filtroCategoria.value;

    const prioridadeSelecionada =
        filtroPrioridade.value;

    const statusSelecionado =
        filtroStatus.value;


    return atividadesCarregadas.filter(
        atividade => {

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
                statusSelecionado === "pendentes"
                &&
                atividade.concluida
            ) {

                return false;

            }


            if (
                statusSelecionado === "concluidas"
                &&
                !atividade.concluida
            ) {

                return false;

            }


            return true;

        }
    );

}


function aplicarFiltros() {

    const atividadesFiltradas =
        obterAtividadesFiltradas();


    exibirAtividades(
        atividadesFiltradas
    );


    renderizarAgendaSemanal(
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
            `${quantidadeTotal} atividade${quantidadeTotal === 1
                ? ""
                : "s"
            }`;


        return;

    }


    contadorAtividades.textContent =
        `${quantidadeFiltrada} de ${quantidadeTotal} atividades`;

}


// =====================================================
// LISTA DE ATIVIDADES
// =====================================================

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
            filtroStatus.value !== "todas";


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

            const card =
                criarCardAtividade(
                    atividade
                );


            listaAtividades.appendChild(
                card
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


    data.textContent =
        `${formatarData(atividade.data)}
        •
        ${formatarHora(atividade.hora_inicio)}
        -
        ${formatarHora(atividade.hora_fim)}`;


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
        atividadeTemConflito(
            atividade
        )
    ) {

        const avisoConflito =
            document.createElement("p");


        avisoConflito.className =
            "aviso-conflito";


        avisoConflito.textContent =
            "Conflito de horário";


        card.appendChild(
            avisoConflito
        );

    }


    const acoes =
        document.createElement("div");


    acoes.className =
        "acoes-atividade";


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
            atividade.id
        )
    );


    acoes.appendChild(
        botaoConcluir
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


// =====================================================
// DATAS E HORÁRIOS
// =====================================================

function formatarData(
    data
) {

    const [
        ano,
        mes,
        dia
    ] = data.split("-");


    return `${dia}/${mes}/${ano}`;

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
        document.querySelector("#data");


    const hoje =
        new Date();


    const ano =
        hoje.getFullYear();


    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            hoje.getDate()
        ).padStart(
            2,
            "0"
        );


    campoData.value =
        `${ano}-${mes}-${dia}`;

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


    return `${ano}-${mes}-${dia}`;

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


    return `${inicioFormatado} — ${fimFormatado}`;

}


function horarioParaMinutos(
    horario
) {

    if (
        !horario
        ||
        typeof horario !== "string"
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


    const fimCalculado =
        atividade.hora_fim
            ? horarioParaMinutos(
                atividade.hora_fim
            )
            : inicio + 60;


    if (
        fimCalculado === null
    ) {

        return null;

    }


    return {
        inicio,
        fim: fimCalculado
    };

}


// =====================================================
// CONFLITOS
// =====================================================

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


function atividadeTemConflito(
    atividade
) {

    return atividadesCarregadas.some(
        outraAtividade => {

            if (
                outraAtividade.id
                === atividade.id
            ) {

                return false;

            }


            return horariosConflitam(
                atividade,
                outraAtividade
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

            const fimDasColunas = [];


            grupo.forEach(
                evento => {

                    let coluna =
                        fimDasColunas.findIndex(
                            fim =>
                                fim <= evento.inicio
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


// =====================================================
// AGENDA SEMANAL
// =====================================================

function renderizarAgendaSemanal(
    atividades
) {

    if (
        !agendaSemana
    ) {

        return;

    }


    agendaSemana.innerHTML =
        "";


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


    const diasSemana = [];


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


    const colunasDias = [];


    diasSemana.forEach(
        data => {

            const coluna =
                document.createElement("div");


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


            const atividadesDoDia =
                atividades.filter(
                    atividade =>
                        atividade.data
                        === dataISO
                );


            const atividadesOrganizadas =
                organizarConflitos(
                    atividadesDoDia
                );


            atividadesOrganizadas.forEach(
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
                    weekday: "short"
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
                day: "2-digit",
                month: "2-digit"
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
            `${(
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
    atividade,
    layout
) {

    const intervalo =
        obterIntervaloAtividade(
            atividade
        );


    if (
        intervalo === null
    ) {

        return null;

    }


    const inicio =
        intervalo.inicio;


    const fim =
        intervalo.fim;


    const limiteInicial =
        HORA_INICIAL * 60;


    const limiteFinal =
        HORA_FINAL * 60;


    const inicioVisivel =
        Math.max(
            inicio,
            limiteInicial
        );


    const fimVisivel =
        Math.min(
            fim,
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
        atividade.concluida
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
        atividade.titulo;


    const horario =
        document.createElement("span");


    horario.textContent =
        `${formatarHora(
            atividade.hora_inicio
        )} - ${formatarHora(
            atividade.hora_fim
        )}`;


    const categoria =
        document.createElement("span");


    categoria.textContent =
        atividade.categoria;


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


    bloco.title =
        `${atividade.titulo} — clique para editar`;


    bloco.addEventListener(
        "click",
        () => iniciarEdicao(
            atividade
        )
    );


    return bloco;

}


// =====================================================
// EDIÇÃO
// =====================================================

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


    botaoSalvar.textContent =
        "Adicionar atividade";


    botaoCancelarEdicao.hidden =
        true;


    mensagem.textContent =
        "";

}


// =====================================================
// POST / PATCH
// =====================================================

form.addEventListener(
    "submit",
    async evento => {

        evento.preventDefault();


        mensagem.textContent =
            "";


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
                form.prioridade.value

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


                if (
                    typeof erro.detail
                    === "string"
                ) {

                    mensagem.textContent =
                        erro.detail;

                } else {

                    mensagem.textContent =
                        "Não foi possível salvar a atividade.";

                }


                return;

            }


            mensagem.textContent =
                editando
                    ? "Atividade atualizada com sucesso!"
                    : "Atividade cadastrada com sucesso!";


            atividadeEmEdicao =
                null;


            form.reset();


            definirDataAtual();


            botaoSalvar.textContent =
                "Adicionar atividade";


            botaoCancelarEdicao.hidden =
                true;


            await carregarAtividades();


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


// =====================================================
// PATCH - CONCLUIR
// =====================================================

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


        await carregarAtividades();


    } catch (erro) {

        console.error(
            "Erro ao concluir:",
            erro
        );


        mensagem.textContent =
            "Erro ao concluir atividade.";

    }

}


// =====================================================
// DELETE
// =====================================================

async function excluirAtividade(
    id
) {

    const confirmar =
        window.confirm(
            "Deseja realmente excluir esta atividade?"
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
            "Atividade excluída com sucesso!";


        await carregarAtividades();


    } catch (erro) {

        console.error(
            "Erro ao excluir:",
            erro
        );


        mensagem.textContent =
            "Erro ao excluir atividade.";

    }

}


// =====================================================
// EVENTOS DOS FILTROS
// =====================================================

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

        filtroCategoria.value =
            "";


        filtroPrioridade.value =
            "";


        filtroStatus.value =
            "todas";


        aplicarFiltros();

    }
);


// =====================================================
// NAVEGAÇÃO DA SEMANA
// =====================================================

botaoSemanaAnterior.addEventListener(
    "click",
    () => {

        inicioSemanaExibida =
            adicionarDias(
                inicioSemanaExibida,
                -7
            );


        renderizarAgendaSemanal(
            obterAtividadesFiltradas()
        );

    }
);


botaoSemanaAtual.addEventListener(
    "click",
    () => {

        inicioSemanaExibida =
            obterInicioSemana(
                new Date()
            );


        renderizarAgendaSemanal(
            obterAtividadesFiltradas()
        );

    }
);


botaoSemanaProxima.addEventListener(
    "click",
    () => {

        inicioSemanaExibida =
            adicionarDias(
                inicioSemanaExibida,
                7
            );


        renderizarAgendaSemanal(
            obterAtividadesFiltradas()
        );

    }
);


// =====================================================
// BOTÃO CANCELAR EDIÇÃO
// =====================================================

botaoCancelarEdicao.addEventListener(
    "click",
    cancelarEdicao
);


// =====================================================
// INICIALIZAÇÃO
// =====================================================

definirDataAtual();

carregarAtividades();
