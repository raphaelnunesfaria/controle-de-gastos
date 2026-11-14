CONTROLE DE GASTOS

Disciplina: Programacao de Computadores I - CEFET-MG, Campus Divinopolis
Integrante: Raphael Nunes (trabalho individual)
Site publicado: https://raphaelnunesfaria.github.io/controle-de-gastos/


OBJETIVO

Programa web para registrar receitas e despesas em um lugar so e saber
quanto sobra no mes. Foi feito com HTML, CSS e JavaScript, sem servidor
e sem bibliotecas externas.


FUNCIONALIDADES

- Cadastrar receitas e despesas, fixas ou variaveis, com descricao,
  valor, data e categoria
- Listar todos os lancamentos em uma tabela
- Mostrar o total de receitas, o total de despesas e o saldo
- Filtrar por categoria, tipo, natureza, mes e por parte da descricao
- Editar e remover lancamentos
- Apagar todos os lancamentos (pede confirmacao antes)
- Exportar os dados para um arquivo dados.json e importar de volta


ARQUIVOS

index.html   pagina com o formulario, os totais e a tabela
estilo.css   aparencia da pagina
app.js       logica do programa
dados.json   dados de exemplo para testar


COMO EXECUTAR

Nao precisa instalar nada.

1. No GitHub, clique em Code > Download ZIP e extraia a pasta.
2. Abra o arquivo index.html no navegador (duplo clique).

Tambem da para usar direto pelo site publicado, no link do inicio.


COMO TESTAR COM OS DADOS DE EXEMPLO

1. Clique em "Importar dados" e escolha o arquivo dados.json.
2. Aparecem 6 lancamentos.
3. Resultado esperado nos totais: receitas R$ 1.540,00, despesas
   R$ 203,40 e saldo R$ 1.336,60.


COMO OS DADOS SAO GUARDADOS

Os lancamentos ficam salvos no proprio navegador (localStorage), no
computador de quem esta usando. Ao fechar e abrir a pagina de novo, eles
continuam la. Nada e enviado para servidor nenhum.

Para guardar uma copia ou levar os dados para outro computador, use
"Exportar dados", que baixa o arquivo dados.json, e depois "Importar
dados" no outro lugar.


FORMATO DO ARQUIVO dados.json

E uma lista de lancamentos. Cada lancamento tem:

- descricao: texto
- valor: numero
- tipo: "receita" ou "despesa"
- natureza: "fixa" ou "variavel"
- categoria: texto
- data: no formato AAAA-MM-DD

Exemplo de um lancamento:

{ "descricao": "Salario", "valor": 1500, "tipo": "receita",
  "natureza": "fixa", "categoria": "trabalho", "data": "2026-10-05" }


LIMITACOES CONHECIDAS

- Os dados ficam so no navegador usado. Em outro computador ou outro
  navegador, a lista abre vazia.
- Se os dados do navegador forem apagados, os lancamentos se perdem. Por
  isso existe a exportacao.
- Nao tem login nem mais de um usuario.
- Importar um arquivo substitui todos os dados que estavam na pagina.
- A busca por descricao diferencia acentos (cafe nao encontra "cafe" com
  acento).
