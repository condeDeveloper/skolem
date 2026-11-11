# skolem

Sequências de Skolem, varridas ordem a ordem, junto com as duas primas que
vivem ao lado delas.

Uma sequência de Skolem de ordem `n` arruma `{1,1,2,2,...,n,n}` em `2n` casas de
modo que as duas cópias de `k` fiquem a distância exatamente `k`:

```
ordem 4:  4 1 1 3 4 2 3 2
          ^-------^          as duas copias de 4, distancia 4
            ^-^              as duas copias de 1, distancia 1
```

A prima **hooked** usa `2n+1` casas e deixa um buraco na penúltima. A prima de
**Langford** pede distância `k+1` em vez de `k`. As três têm condição de
existência diferente, e é disso que o projeto trata.

Sem dependência nenhuma. 27 testes.

## Os quatro achados

**1. As três condições de existência acertam nas 27 previsões, sem exceção.**
Skolem pede `n ≡ 0` ou `1 (mod 4)`, a hooked pede `n ≡ 2` ou `3`, Langford pede
`n ≡ 0` ou `3`. A varredura é cega — não conhece nenhuma das três — e mesmo
assim devolveu **zero** soluções em toda ordem proibida e **pelo menos uma** em
toda ordem permitida, nas nove ordens de cada feitio.

**2. Skolem e hooked juntas cobrem toda ordem; nenhuma das duas sozinha cobre.**
As duas condições são complementares mod 4 e não se sobrepõem em ordem nenhuma:
em dezesseis ordens, exatamente uma das duas vale, sempre. Langford não tem
companheira assim e deixa oito das dezesseis de fora.

**3. Achar a primeira custa 4.379 vezes menos que contar todas, e a distância
cresce.** Em Skolem de ordem 9: 14 nós para a primeira, 61.316 para todas. E o
detalhe que eu não esperava — **achar fica mais barato da ordem 8 para a 9**, de
24 nós para 14, enquanto contar fica 5,9 vezes mais caro. Mais soluções no
espaço significa esbarrar numa delas mais cedo.

**4. Na hooked, refletir não é simetria.** O buraco fica na penúltima casa, e
virar a sequência de ponta a ponta o joga para a segunda — o refletido deixa de
ser uma sequência hooked. É o único dos três feitios em que a contagem bruta e a
contagem por reflexão coincidem, e coincidem por isso, não por simetria.

## Como rodar

```bash
node --test testes/*.test.js
node ferramentas/medidor.js
node ferramentas/medidor.js existencia
```

## As tabelas

### Quantas sequências de cada feitio

```
   n    skolem   hooked  langford
   1         1        0         0
   2         0        1         0
   3         0        2         2
   4         6        0         2
   5        10        0         0
   6         0       38         0
   7         0      124        52
   8       504        0       300
   9      2656        0         0
```

Contadas cruas. Por reflexão, Skolem dá 1, 3, 5, 252 e 1.328 nas ordens 1, 4, 5,
8 e 9; Langford dá 1, 1, 26 e 150 nas ordens 3, 4, 7 e 8.

### Achar a primeira contra contar todas

```
  feitio     n  achar  contar  razao
  skolem     4      5      35      7.0x
  skolem     5      8     114     14.3x
  skolem     8     24   10429    434.5x
  skolem     9     14   61316   4379.7x
  hooked     6      7     476     68.0x
  hooked     7      8    2173    271.6x
  langford   7     17    1335     78.5x
  langford   8     33    6994    211.9x
```

### A cobertura

```
   n  skolem  hooked  uma das duas  langford
   1    true   false          true     false
   2   false    true          true     false
   3   false    true          true      true
   4    true   false          true      true
   5    true   false          true     false
   6   false    true          true     false
   7   false    true          true      true
   8    true   false          true      true
```

## O que as medidas me corrigiram

**Contei "por reflexão" num feitio onde refletir não é simetria.** A função que
junta cada solução com a sua refletida foi escrita para os três feitios de uma
vez, e na hooked ela devolveu exatamente o mesmo número da contagem bruta. Isso
*parece* um achado — "toda sequência hooked é simétrica" — e é falso. O que
acontece é que a reflexão tira a sequência do conjunto, porque leva o buraco da
penúltima casa para a segunda. A contagem não estava medindo simetria nenhuma,
estava medindo nada. Virou a tabela `REFLEXAO_E_SIMETRIA`, que é **conferida por
varredura** em vez de assumida, e o teste exige que a reflexão saia inválida na
hooked e válida nos outros dois.

**Um teste meu estava errado, não o juiz.** Montei o vetor `1 0 1 2` esperando
que o juiz reclamasse de "rótulo 2 aparece uma vez só"; ele reclamou de "rótulo
1 ficou a distância 2", que é verdade e vem antes. O caso certo é `1 1 2 0`, com
o rótulo 1 correto para o juiz chegar até o 2. Erro meu de construir o exemplo
sem conferir o que ele de fato continha.

**Eu esperava que achar ficasse mais caro com a ordem.** Da ordem 8 para a 9 o
custo de achar a primeira *cai* de 24 para 14 nós. Mais soluções espalhadas pelo
espaço significam esbarrar numa delas mais cedo, e isso não tem nada a ver com
o espaço ter ficado maior.

## Os arquivos

```
src/sequencias.js  os tres feitios e a busca, do maior rotulo para o menor
src/juiz.js        procura as duas copias de cada rotulo e mede a distancia
src/medidas.js     uma funcao por tabela
ferramentas/medidor.js
testes/nucleo.test.js    15 testes
testes/medidas.test.js   12 testes
```

A busca coloca pares e nunca relê o que escreveu; o juiz recebe o vetor pronto,
procura as duas cópias de cada rótulo e mede a distância entre elas. E uma
terceira via, a força bruta, gera todas as arrumações do multiconjunto e filtra
— ela concorda com a busca nos dez casos em que consegue rodar.
