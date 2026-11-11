// Os numeros do README, presos. Nenhum foi digitado de cabeca.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { varrer, contarPorReflexao } from '../src/sequencias.js';
import {
  tabelaContagens, tabelaExistencia, tabelaCobertura, tabelaReflexao,
  tabelaContraForcaBruta, tabelaAcharContraContar, REFLEXAO_E_SIMETRIA,
  reflexaoLevaEmSolucao,
} from '../src/medidas.js';

test('as contagens de Skolem, ordem a ordem', () => {
  const esperado = [1, 0, 0, 6, 10, 0, 0, 504, 2656];
  for (let n = 1; n <= 9; n++) {
    assert.equal(varrer(n, 'skolem').achados, esperado[n - 1], `n=${n}`);
  }
});

test('as contagens da hooked, ordem a ordem', () => {
  const esperado = [0, 1, 2, 0, 0, 38, 124, 0, 0];
  for (let n = 1; n <= 9; n++) {
    assert.equal(varrer(n, 'hooked').achados, esperado[n - 1], `n=${n}`);
  }
});

test('as contagens de Langford, ordem a ordem', () => {
  const esperado = [0, 0, 2, 2, 0, 0, 52, 300, 0];
  for (let n = 1; n <= 9; n++) {
    assert.equal(varrer(n, 'langford').achados, esperado[n - 1], `n=${n}`);
  }
});

test('as contagens por reflexao batem com as conhecidas', () => {
  // Langford por reflexao: 1, 1, 26, 150 nas ordens 3, 4, 7, 8
  assert.equal(contarPorReflexao(3, 'langford'), 1);
  assert.equal(contarPorReflexao(4, 'langford'), 1);
  assert.equal(contarPorReflexao(7, 'langford'), 26);
  assert.equal(contarPorReflexao(8, 'langford'), 150);
  // Skolem por reflexao
  assert.equal(contarPorReflexao(4, 'skolem'), 3);
  assert.equal(contarPorReflexao(5, 'skolem'), 5);
  assert.equal(contarPorReflexao(8, 'skolem'), 252);
  assert.equal(contarPorReflexao(9, 'skolem'), 1328);
});

test('as 27 previsoes de existencia acertam todas', () => {
  const linhas = tabelaExistencia(9);
  assert.equal(linhas.length, 27);
  assert.equal(linhas.filter((l) => l.acertou).length, 27);
});

test('Skolem e hooked juntas cobrem TODA ordem ate 16, e Langford nao', () => {
  const linhas = tabelaCobertura(16);
  assert.equal(linhas.length, 16);
  assert.ok(linhas.every((l) => l.skolemOuHooked), 'alguma ordem ficou descoberta');
  // Langford deixa buraco: as ordens 1, 2, 5, 6, ... ficam de fora
  assert.equal(linhas.filter((l) => !l.langford).length, 8);
  // e nenhuma ordem tem Skolem E hooked ao mesmo tempo
  assert.equal(linhas.filter((l) => l.skolem && l.hooked).length, 0);
});

test('a reflexao e simetria em Skolem e Langford, e nao e na hooked', () => {
  assert.equal(REFLEXAO_E_SIMETRIA.skolem, true);
  assert.equal(REFLEXAO_E_SIMETRIA.langford, true);
  assert.equal(REFLEXAO_E_SIMETRIA.hooked, false);

  assert.equal(reflexaoLevaEmSolucao(8, 'skolem').reflexaoSempreValida, true);
  assert.equal(reflexaoLevaEmSolucao(8, 'langford').reflexaoSempreValida, true);
  assert.equal(reflexaoLevaEmSolucao(6, 'hooked').reflexaoSempreValida, false);
  assert.equal(reflexaoLevaEmSolucao(7, 'hooked').reflexaoSempreValida, false);
});

test('a busca e a forca bruta concordam nos dez casos cruzados', () => {
  const linhas = tabelaContraForcaBruta(5);
  assert.equal(linhas.length, 10);
  for (const l of linhas) {
    assert.equal(l.busca, l.forcaBruta, `${l.feitio} n=${l.n}`);
  }
});

test('achar a primeira custa 4.379 vezes menos que contar todas em Skolem n=9', () => {
  const linha = tabelaAcharContraContar(9)
    .find((l) => l.feitio === 'skolem' && l.n === 9);
  assert.equal(linha.nosParaAchar, 14);
  assert.equal(linha.nosParaContar, 61316);
  // 61316 / 14 = 4379,71...
  assert.equal(linha.razao.toFixed(1), '4379.7');
});

test('o custo de contar cresce muito mais rapido que o de achar', () => {
  const skolem = tabelaAcharContraContar(9).filter((l) => l.feitio === 'skolem');
  const n8 = skolem.find((l) => l.n === 8);
  const n9 = skolem.find((l) => l.n === 9);
  // achar fica mais BARATO de 8 para 9; contar fica quase 6 vezes mais caro
  assert.ok(n9.nosParaAchar < n8.nosParaAchar, 'achar deveria ficar mais barato');
  assert.ok(n9.nosParaContar > 5 * n8.nosParaContar, 'contar deveria explodir');
});

test('a tabela de contagens tem os nos de cada feitio', () => {
  const l = tabelaContagens(9).find((x) => x.n === 9);
  assert.equal(l.skolem, 2656);
  assert.equal(l.skolemNos, 61316);
  assert.equal(l.hooked, 0);
  assert.equal(l.langford, 0);
});

test('a contagem bruta da hooked e igual a por reflexao, porque reflexao nao e simetria la', () => {
  for (const n of [6, 7]) {
    const l = tabelaReflexao(9).find((x) => x.feitio === 'hooked' && x.n === n);
    assert.equal(l.bruta, l.porReflexao, `n=${n}`);
    assert.equal(l.reflexaoEhSimetria, false);
  }
});
