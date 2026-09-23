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
    document.querySelector(
        "#filtro-categoria"
    );


const filtroPrioridade =
    document.querySelector(
        "#filtro-prioridade"
    );


const filtroStatus =
    document.querySelector(
        "#filtro-status"
    );


const botaoLimparFiltros =
    document.querySelector(
        "#limpar-filtros"
    );

const HORA_INICIAL = 6;

const HORA_FINAL = 24;

const ALTURA_HORA = 56;


let atividadesCarregadas = [];

let inicioSemanaExibida =
    obterInicioSemana(
        new Date()
    );

let atividadeEmEdicao = null;


// ===============================
// GET - LISTAR ATIVIDADES
// ===============================

async function carregarAtividades() {

    try {

        const resposta =
            await fetch("/atividades");


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar as atividades."
            );

        }


        const atividades =
            await resposta.json();


        atividadesCarregadas =
            atividades;

        aplicarFiltros();


    } catch (erro) {

        console.error(
            erro
        );


        listaAtividades.textContent =
            "Erro ao carregar atividades.";

    }

}


// ===============================
// EXIBIR ATIVIDADES
// ===============================

function exibirAtividades(atividades) {

    listaAtividades.innerHTML = "";

    if (atividades.length === 0) {

        const aviso =
            document.createElement("div");


        aviso.className =
            "sem-atividades";


        aviso.textContent =
            "Nenhuma atividade cadastrada.";


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

// ===============================
// CRIAR CARD
// ===============================

function criarCardAtividade(atividade) {

    const card =
        document.createElement("article");


    card.className =
        "atividade";


    if (atividade.concluida) {

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


    const acoes =
        document.createElement("div");


    acoes.className =
        "acoes-atividade";


    // BOTÃO CONCLUIR

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


    // BOTÃO EDITAR

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


    // BOTÃO EXCLUIR

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


    card.appendChild(
        acoes
    );


    return card;

}


// ===============================
// FORMATAR DATA
// ===============================

function formatarData(data) {

    const [
        ano,
        mes,
        dia
    ] = data.split("-");


    return `${dia}/${mes}/${ano}`;

}


// ===============================
// FORMATAR HORA
// ===============================

function formatarHora(hora) {

    if (!hora) {

        return "--:--";

    }


    return hora.slice(
        0,
        5
    );

}


// ===============================
// DATA ATUAL
// ===============================

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


// ===============================
// PREPARAR EDIÇÃO
// ===============================

function iniciarEdicao(atividade) {

    atividadeEmEdicao =
        atividade.id;


    form.titulo.value =
        atividade.titulo;


    form.descricao.value =
        atividade.descricao ?? "";


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


// ===============================
// CANCELAR EDIÇÃO
// ===============================

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


botaoCancelarEdicao.addEventListener(
    "click",
    cancelarEdicao
);


// ===============================
// POST / PATCH
// ===============================

form.addEventListener(
    "submit",
    async evento => {

        evento.preventDefault();


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
            atividadeEmEdicao !== null;


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

                        method: metodo,

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


            if (!resposta.ok) {

                const erro =
                    await resposta.json();


                console.error(
                    erro
                );


                mensagem.textContent =
                    erro.detail
                    ?? "Não foi possível salvar a atividade.";


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
                erro
            );


            mensagem.textContent =
                "Erro ao comunicar com a API.";

        }

    }
);


// ===============================
// PATCH - CONCLUIR
// ===============================

async function concluirAtividade(id) {

    try {

        const resposta =
            await fetch(
                `/atividades/${id}/concluir`,
                {
                    method: "PATCH"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível concluir a atividade."
            );

        }


        mensagem.textContent =
            "Atividade concluída!";


        await carregarAtividades();


    } catch (erro) {

        console.error(
            erro
        );


        mensagem.textContent =
            "Erro ao concluir atividade.";

    }

}


// ===============================
// DELETE
// ===============================

async function excluirAtividade(id) {

    const confirmar =
        window.confirm(
            "Deseja realmente excluir esta atividade?"
        );


    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await fetch(
                `/atividades/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível excluir a atividade."
            );

        }


        if (atividadeEmEdicao === id) {

            cancelarEdicao();

        }


        mensagem.textContent =
            "Atividade excluída com sucesso!";


        await carregarAtividades();


    } catch (erro) {

        console.error(
            erro
        );


        mensagem.textContent =
            "Erro ao excluir atividade.";

    }

}

function obterInicioSemana(data) {

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

function dataParaISO(data) {

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

function renderizarAgendaSemanal(
    atividades
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


        const cabecalho =
            criarCabecalhoDia(
                data
            );


        grade.appendChild(
            cabecalho
        );

    }


    const colunaHoras =
        criarColunaHoras();


    grade.appendChild(
        colunaHoras
    );


    const colunasDias = [];


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
                === dataParaISO(new Date())
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


    atividades.forEach(
        atividade => {

            const indiceDia =
                diasSemana.findIndex(
                    data =>
                        dataParaISO(data)
                        === atividade.data
                );


            if (indiceDia === -1) {

                return;

            }


            const bloco =
                criarBlocoAgenda(
                    atividade
                );


            if (bloco !== null) {

                colunasDias[
                    indiceDia
                ].appendChild(
                    bloco
                );

            }

        }
    );


    agendaSemana.appendChild(
        grade
    );

}

function criarCabecalhoDia(data) {

    const cabecalho =
        document.createElement("div");


    cabecalho.className =
        "agenda-dia-cabecalho";


    if (
        dataParaISO(data)
        === dataParaISO(new Date())
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
        data.toLocaleDateString(
            "pt-BR",
            {
                weekday: "short"
            }
        ).replace(
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

function horarioParaMinutos(
    horario
) {

    const [
        hora,
        minuto
    ] = horario
        .split(":")
        .map(Number);


    return (
        hora * 60
        + minuto
    );

}

function criarBlocoAgenda(
    atividade
) {

    const inicio =
        horarioParaMinutos(
            atividade.hora_inicio
        );


    let fim;


    if (atividade.hora_fim) {

        fim =
            horarioParaMinutos(
                atividade.hora_fim
            );

    } else {

        fim =
            inicio + 60;

    }


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
        document.createElement(
            "button"
        );


    bloco.type =
        "button";


    bloco.className =
        "agenda-evento";


    if (atividade.concluida) {

        bloco.classList.add(
            "concluida"
        );

    }


    bloco.style.top =
        `${topo}px`;


    bloco.style.height =
        `${altura}px`;


    const titulo =
        document.createElement(
            "strong"
        );


    titulo.textContent =
        atividade.titulo;


    const horario =
        document.createElement(
            "span"
        );


    horario.textContent =
        `${formatarHora(
            atividade.hora_inicio
        )} - ${formatarHora(
            atividade.hora_fim
        )
        }`;


    const categoria =
        document.createElement(
            "span"
        );


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


    bloco.title =
        `${atividade.titulo} — clique para editar`;


    bloco.addEventListener(
        "click",
        () =>
            iniciarEdicao(
                atividade
            )
    );


    return bloco;

}

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
// ===============================
// INICIALIZAÇÃO
// ===============================

definirDataAtual();

carregarAtividades();