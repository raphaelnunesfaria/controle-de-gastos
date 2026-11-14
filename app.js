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

    lancamentos.push(cadastroNovo);
    salvar();
    listar();
    verSaldo();
    limparFormulario();
    mostrarFeedback("Lançamento cadastrado!", "sucesso");
    mostrarErro("", "Erro!")
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
        linha.appendChild(celulaData);
        linha.appendChild(celulaDescricao);
        linha.appendChild(celulaCategoria);
        linha.appendChild(celulaTipo);
        linha.appendChild(celulaNatureza);
        linha.appendChild(celulaValor);
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
    listar();
    verSaldo();
}

// ============================================================
// VERSAO FINAL (ate 10/11) - FUNCOES PARA IMPLEMENTAR
// ============================================================

// ---------- filtros ----------

// TODO: preencher o select campoFiltroCategoria com as categorias que existem nos lancamentos
// passos: guardar a opcao "Todas" (value "") -> percorrer os lancamentos -> adicionar cada
//         categoria so uma vez (sem repetir) -> manter selecionada a escolha atual, se ainda existir
// chamar depois de cadastrar, editar, remover e importar
function preencherFiltroCategorias() {
    // TODO
}

// TODO: aplicar TODOS os filtros ao mesmo tempo e mostrar o resultado
// ids usados: campoFiltroCategoria, campoFiltroTipo, campoFiltroNatureza, campoFiltroMes
// passos: ler os 4 valores -> for percorrendo lancamentos -> guardar em um novo array
//         so os itens que passam em cada filtro ("" = nao filtrar) -> listar(novoArray)
// dica: a data esta no formato "2026-10-21", entao o mes sao os 7 primeiros caracteres
//       (data.substring(0, 7) bate com o valor do campoFiltroMes, "2026-10")
function aplicarFiltros() {
    // TODO
}

// TODO: voltar os 4 filtros para o valor inicial e mostrar a lista completa
function limparFiltros() {
    // TODO
}

// ---------- editar e remover ----------

// TODO: levar os dados do lancamento da posicao "indice" (do array lancamentos) para o formulario
// passos: guardar o indice em indiceEdicao -> preencher os campos
//         -> trocar o texto do tituloFormulario e do botaoSalvarLancamento
//         -> adicionar a classe painel-edicao no painelFormulario
//         -> mostrar o botaoCancelarEdicao (tirar a classe escondido)
function editar(indice) {
    // TODO
}

// TODO: sair do modo de edicao
// passos: indiceEdicao volta para -1 -> limparFormulario() -> restaurar os textos
//         -> tirar a classe painel-edicao -> esconder o botaoCancelarEdicao
function cancelarEdicao() {
    // TODO
}

// TODO: remover o lancamento da posicao "indice" (do array lancamentos)
// dica: pedir confirmacao com confirm(); depois lancamentos.splice(indice, 1)
//       e chamar salvar(), preencherFiltroCategorias(), aplicarFiltros() e verSaldo()
function remover(indice) {
    // TODO
}

// ---------- validacoes e avisos ----------

// TODO: conferir os campos do formulario; devolver true (tudo certo) ou false (tem erro)
// regras sugeridas: descricao nao vazia | valor numerico maior que zero
//                   data preenchida | categoria nao vazia
// para cada erro, chamar mostrarErro("Descricao", "texto do erro")
// dica: trim() tira os espacos do comeco e do fim do texto
function validarFormulario() {
    // TODO
}



// TODO: esconder todas as mensagens de erro e tirar a classe campo-invalido dos campos
function limparErros() {
    // TODO
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
