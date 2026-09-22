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


        exibirAtividades(
            atividades
        );


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


    contadorAtividades.textContent =
        `${atividades.length} atividade${
            atividades.length === 1
                ? ""
                : "s"
        }`;


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


// ===============================
// INICIALIZAÇÃO
// ===============================

definirDataAtual();

carregarAtividades();