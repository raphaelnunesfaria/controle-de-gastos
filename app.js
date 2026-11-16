// ============================================================
// CONTROLE DE GASTOS - versao web
// ============================================================


// ---------- VARIAVEIS GLOBAIS ----------

// lista com todos os lancamentos (a versao "viva" dos dados)
let lancamentos = [];

// nome da "gaveta" do localStorage onde os dados ficam guardados
const chaveArmazenamento = "lancamentos";

// posicao do lancamento que esta sendo editado
// -1 = nao esta editando nada (esta cadastrando)
let indiceEdicao = -1;


// ============================================================
// FUNCOES PRONTAS: SALVAR, CARREGAR, EXPORTAR, IMPORTAR
// ============================================================

// grava o array no localStorage do navegador
// chamar depois de TODA alteracao (cadastrar, editar, remover)
function salvar() {
    let texto = JSON.stringify(lancamentos);
    localStorage.setItem(chaveArmazenamento, texto);
}

// le o localStorage e coloca os dados no array
// chamar uma vez, quando a pagina abre
function carregar() {
    let texto = localStorage.getItem(chaveArmazenamento);

    if (texto != null) {
        lancamentos = JSON.parse(texto);
    }
}

// baixa os dados como um arquivo dados.json
function exportar() {
    let texto = JSON.stringify(lancamentos, null, 2);
    let arquivo = new Blob([texto], { type: "application/json" });
    let endereco = URL.createObjectURL(arquivo);

    let link = document.createElement("a");
    link.href = endereco;
    link.download = "dados.json";
    link.click();

    URL.revokeObjectURL(endereco);
}

// le um arquivo .json escolhido pelo usuario e troca os dados atuais por ele
// "evento" e o aviso que o navegador manda quando o usuario escolhe o arquivo
function importar(evento) {
    let arquivo = evento.target.files[0];

    if (arquivo == undefined) {
        return;
    }

    let confirmou = confirm("Importar vai substituir os dados atuais. Continuar?");

    if (confirmou == false) {
        evento.target.value = "";
        return;
    }

    let leitor = new FileReader();

    leitor.onload = function () {
        try {
            let dados = JSON.parse(leitor.result);

            if (Array.isArray(dados) == false) {
                alert("O arquivo precisa conter uma lista de lancamentos.");
                return;
            }

            lancamentos = dados;
            salvar();
            preencherFiltroCategorias();
            listar();
            verSaldo();
        } catch (erro) {
            alert("Arquivo invalido. Escolha um dados.json valido.");
        }
    };

    leitor.readAsText(arquivo);

    // limpa o campo para permitir importar o mesmo arquivo de novo
    evento.target.value = "";
}


// ============================================================
// VERSAO PARCIAL (ate 27/10) - FUNCOES PARA IMPLEMENTAR
// ============================================================

function formatarMoeda(numero) {
    let texto = numero.toFixed(2);
    texto = texto.replace('.', ',');
    return `R$ ${texto}`;
}

function formatarData (data){
    const datas = data.split("-");
    const ano = datas[0];
    const mes = datas[1];
    const dia = datas[2];
    return `${dia}/${mes}/${ano}`;
}

function cadastrar(evento) {
    evento.preventDefault(); 
    let descricao = document.getElementById("campoDescricao").value;
    let valor = Number(document.getElementById("campoValor").value);
    let data = document.getElementById("campoData").value;
    let tipo = document.getElementById("campoTipo").value;
    let natureza = document.getElementById("campoNatureza").value;
    let categoria = document.getElementById("campoCategoria").value;
    if (descricao.trim() == "" || categoria.trim() == "" || data == "" || isNaN(valor) || valor <= 0){
        mostrarFeedback("Preencha todos os campos corretamente.", "erro");
        return
    }

    const cadastroNovo = {
        descricao: descricao,
        valor: valor,
        data: data,
        tipo: tipo,
        natureza: natureza,
        categoria: categoria
    }

    let mensagem = "";

    if (indiceEdicao === -1) {
        lancamentos.push(cadastroNovo);
        mensagem = "Lançamento cadastrado!";
    } else {
        lancamentos[indiceEdicao] = cadastroNovo;
        mensagem = "Lançamento atualizado!";
        cancelarEdicao();
    }

    salvar();
    preencherFiltroCategorias();
    aplicarFiltros();
    verSaldo();
    limparFormulario();
    mostrarFeedback(mensagem, "sucesso");
}

function listar(listaParaMostrar) {
    if (!listaParaMostrar){
        listaParaMostrar = lancamentos;
    }

    let tabela = document.getElementById("corpoTabela");
    let mensagemVazia = document.getElementById("mensagemVazia");
    tabela.innerHTML = "";
    
    if (listaParaMostrar.length === 0){
        mensagemVazia.classList.remove("escondido");  
    } else {
        mensagemVazia.classList.add("escondido");
    }

    for (let item of listaParaMostrar){
        let linha = document.createElement("tr");
        let celulaData = document.createElement("td"); 
        let celulaDescricao = document.createElement("td"); 
        let celulaCategoria = document.createElement("td");
        let celulaTipo = document.createElement("td"); 
        let celulaNatureza = document.createElement("td"); 
        let celulaValor = document.createElement("td"); 

        celulaData.textContent = formatarData(item.data);
        celulaDescricao.textContent = item.descricao;
        celulaCategoria.textContent = item.categoria;
        celulaTipo.textContent = item.tipo;
        celulaNatureza.textContent = item.natureza;

        if (item.tipo === "receita") {
            celulaValor.textContent = "+ " + formatarMoeda(item.valor);
            celulaValor.classList.add("valor-receita");
        } else {
            celulaValor.textContent = "- " + formatarMoeda(item.valor);
            celulaValor.classList.add("valor-despesa");
        }

        let indiceReal = lancamentos.indexOf(item);
        let celulaAcoes = document.createElement("td");
        celulaAcoes.classList.add("acoes");

        let botaoEditar = document.createElement("button");
        botaoEditar.textContent = "Editar";
        botaoEditar.classList.add("botao-editar");
        botaoEditar.addEventListener("click", function () {
            editar(indiceReal);
        });

        let botaoRemover = document.createElement("button");
        botaoRemover.textContent = "Remover";
        botaoRemover.classList.add("botao-remover");
        botaoRemover.addEventListener("click", function () {
            remover(indiceReal);
        });

        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoRemover);

        if (indiceReal === indiceEdicao) {
            linha.classList.add("linha-em-edicao");
        }
        linha.appendChild(celulaData);
        linha.appendChild(celulaDescricao);
        linha.appendChild(celulaCategoria);
        linha.appendChild(celulaTipo);
        linha.appendChild(celulaNatureza);
        linha.appendChild(celulaValor);
        linha.appendChild(celulaAcoes);
        tabela.appendChild(linha);   
    }

    let textoLanc = document.getElementById("textoContagem");
    textoLanc.textContent = `${listaParaMostrar.length} de ${lancamentos.length} lançamentos`;
}

function verSaldo() {
    let totalReceitas = 0;
    let totalDespesas = 0;
    for (let item of lancamentos){
        if (item.tipo == "receita") {
            totalReceitas += item.valor;
        } else {
            totalDespesas += item.valor;
        }
    } 

        let saldo = totalReceitas - totalDespesas;
        let textoReceitas = document.getElementById("textoReceitas");
        let textoDespesas = document.getElementById("textoDespesas");
        let textoSaldo = document.getElementById("textoSaldo");
        textoReceitas.textContent = formatarMoeda(totalReceitas);
        textoDespesas.textContent = formatarMoeda(totalDespesas);
        textoSaldo.textContent = formatarMoeda(saldo);

        if (saldo < 0) {
            textoSaldo.classList.remove("saldo-positivo");
            textoSaldo.classList.add("saldo-negativo");
        } else {
            textoSaldo.classList.remove("saldo-negativo");
            textoSaldo.classList.add("saldo-positivo");
        }

}

function limparFormulario() {
    document.getElementById("campoDescricao").value = "";
    document.getElementById("campoValor").value = "";
    document.getElementById("campoData").value = "";
    document.getElementById("campoCategoria").value = "";
    document.getElementById("campoTipo").value = "receita";
    document.getElementById("campoNatureza").value = "fixa";
}

function apagarTudo(){
    if (lancamentos.length === 0){
        alert ("Não há nada para ser apagado");
        return
    }
    let confirmou = confirm("Apagar todos os lançamentos? Isso não pode ser desfeito.");
    if (confirmou === false) {
        return;
    }
    lancamentos = [];

    salvar();
    preencherFiltroCategorias();
    aplicarFiltros();
    verSaldo();
}

// ============================================================
// VERSAO FINAL (ate 10/11) - FUNCOES PARA IMPLEMENTAR
// ============================================================

// ---------- filtros ----------

function preencherFiltroCategorias() {
    let select = document.getElementById("campoFiltroCategoria");
    let categoriaAtual = select.value;
    select.innerHTML = "";

    let opcaoTodas = document.createElement("option");
    opcaoTodas.value = "";
    opcaoTodas.textContent = "Todas";
    select.appendChild(opcaoTodas);

    let categoriasVistas = [];

    for (let item of lancamentos) {
        if (categoriasVistas.includes(item.categoria) === false) {
            categoriasVistas.push(item.categoria);
            let opcao = document.createElement("option");
            opcao.value = item.categoria;
            opcao.textContent = item.categoria;
            select.appendChild(opcao);
        }
    }

    if (categoriasVistas.includes(categoriaAtual)) {
        select.value = categoriaAtual;
    }
}


function aplicarFiltros() {
    let categoria = document.getElementById("campoFiltroCategoria").value;
    let tipo = document.getElementById("campoFiltroTipo").value;
    let natureza = document.getElementById("campoFiltroNatureza").value;
    let mes = document.getElementById("campoFiltroMes").value;
    let busca = document.getElementById("campoFiltroBusca").value.trim().toLowerCase();
    let filtrados = [];

    for (let item of lancamentos){
        let passou = true;

        if (categoria !== "" && item.categoria !== categoria){
            passou = false;
        }
        if (tipo !== "" && item.tipo !== tipo){
            passou = false;
        }
        if (natureza !== "" && item.natureza !== natureza){
            passou = false;
        }
        if (mes !== "" && item.data.substring(0, 7) !== mes){
            passou = false;
        }
        if (busca !== "" && item.descricao.toLowerCase().includes(busca) === false) {
            passou = false;
        }
        if (passou === true) {
            filtrados.push(item);
        }
    }

    listar(filtrados);
}

function limparFiltros() {
    document.getElementById("campoFiltroCategoria").value = "";
    document.getElementById("campoFiltroTipo").value = "";
    document.getElementById("campoFiltroNatureza").value = "";
    document.getElementById("campoFiltroMes").value = "";
    document.getElementById("campoFiltroBusca").value = "";

    aplicarFiltros();
}


// ---------- editar e remover ----------

function editar(indice) {
    indiceEdicao = indice;
    item = lancamentos[indice];

    document.getElementById("campoDescricao").value = item.descricao;
    document.getElementById("campoValor").value = item.valor;
    document.getElementById("campoData").value = item.data;
    document.getElementById("campoTipo").value = item.tipo;
    document.getElementById("campoNatureza").value = item.natureza;
    document.getElementById("campoCategoria").value = item.categoria;
    document.getElementById("tituloFormulario").textContent = "Editando lançamento";
    document.getElementById("botaoSalvarLancamento").textContent = "Salvar alterações";
    document.getElementById("painelFormulario").classList.add("painel-edicao");
    document.getElementById("botaoCancelarEdicao").classList.remove("escondido");

    aplicarFiltros();
}

function cancelarEdicao(){
    indiceEdicao = -1;
    limparFormulario(); 
    document.getElementById("tituloFormulario").textContent = "Novo lançamento";
    document.getAnimations("botaoSalvarLancamento").textContent = "Cadastrar";
    document.getElementById("painelFormulario").classList.remove("painel-edicao");
    document.getElementById("botaoCancelarEdicao").classList.add("escondido");

    aplicarFiltros()

}


function remover(indice) {
    let confirmar = confirm("Remover este lançamento? ");

    if (confirmar === false){
        return;
    }

    lancamentos.splice(indice, 1);

    if (indiceEdicao !== -1){
        cancelarEdicao();
    }

    salvar();
    preencherFiltroCategorias();
    aplicarFiltros();
    verSaldo();
    mostrarFeedback("Lançamento removido.", "sucesso");
}


function mostrarFeedback(texto, tipo) {
    let caixa = document.getElementById("mensagemFeedback");
    caixa.textContent = texto;
    caixa.className = "feedback feedback-" + tipo;
    setTimeout(function () {
       caixa.classList.add("escondido");
   }, 3000);
}


// ============================================================
// INICIO DO PROGRAMA
// ============================================================

carregar();
preencherFiltroCategorias();
listar();
verSaldo();

// liga cada elemento da pagina a sua funcao
document.getElementById("formularioLancamento").addEventListener("submit", cadastrar);
document.getElementById("botaoCancelarEdicao").addEventListener("click", cancelarEdicao);
document.getElementById("botaoExportar").addEventListener("click", exportar);
document.getElementById("campoImportar").addEventListener("change", importar);
document.getElementById("botaoApagarTudo").addEventListener("click", apagarTudo); 

// os 4 filtros chamam a mesma funcao
document.getElementById("campoFiltroCategoria").addEventListener("change", aplicarFiltros);
document.getElementById("campoFiltroTipo").addEventListener("change", aplicarFiltros);
document.getElementById("campoFiltroNatureza").addEventListener("change", aplicarFiltros);
document.getElementById("campoFiltroMes").addEventListener("change", aplicarFiltros);
document.getElementById("botaoLimparFiltros").addEventListener("click", limparFiltros);
document.getElementById("campoFiltroBusca").addEventListener("input", aplicarFiltros);
