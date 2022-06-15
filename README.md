# Simulador do Algoritmo de Tomasulo - Arquitetura de Computadores III
### Criado por Leonardo Faria, Luiza Parente e Raíssa Lopes

Este trabalho tem como objetivo simular o alogoritmo de Tomasulo, desenvolvido por Robert Tomasulo em 1967.

O algoritmo é uma técnica de escalonamento dinâmico de instruções que utiliza renomeação e “buferização” de registradores com o intuito de gerenciar esses conflitos de dados e extrair um melhor desempenho dos processadores.

A interface gráfica do simulador criado é composta por uma **Fila de Instruções**, uma **Estação de Reserva**, um **Banco de Registradores** e um **Buffer de Reordenamento**.

## Rodando a aplicação

Com o `Angular` e o `Npm` já instalados na máquina, é necessário:

* Dar git clone no projeto, com o comando `git clone https://github.com/Ra-Lopess/trab02.git` em uma pasta desejada
* Rodar `npm i` para instalar as dependências
* Rodar `ng serve` para rodar a aplicação e acesse http://localhost:4200/

## O simulador

![image](https://user-images.githubusercontent.com/64044014/173719166-570fbb9b-1758-4c88-9a02-7a4084aa5732.png)

Na parte esquerda da interface é possível fazer a customização do simulador, sendo possível:
* Adicionar instruções MIPS na fila de instruções, sendo elas: ADD, SUB, LW, SW, MULT, DIV, BEQ e ADDI;
* Alterar a quantidade de ciclos por instruções, caso não seja adicionado nenhum valor, é enviado um valor default do campo

É importante ressaltar que a quantidade de estações e reserva por unidade lógica e a quantidade de registradores são valores estáticos, sendo possível fazer a alteração deles apenas no código.

Já na parte direita da interface podemos acompanhar o diretamente andamento do simulador:
* O botão começar dá início ao simulador e, após iniciado, se torna o botão para ir para o próximo ciclo
* Para uma melhor visualização das etapas, no momento em que uma instrução entra no Buffer de Reordenamento ela recebe uma cor de acordo com seu status:
  *  Amarelo para _Issue_
  *  Azul escuro para _Executing_
  *  Verde para _Written_
