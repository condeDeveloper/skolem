// Uma funcao por tabela do README. Nenhum numero do README e digitado a mao.

import { varrer, refletir, FEITIOS, contarPorReflexao } from './sequencias.js';
import { EXISTENCIA, conferir, contarPorForcaBruta } from './juiz.js';

/**
 * Refletir e simetria do problema?
 *
 * Para Skolem e Langford, sim: o vetor refletido ainda satisfaz a definicao,
 * porque a distancia entre as duas copias nao muda ao virar tudo de ponta a
 * ponta. Para a HOOKED, nao: o buraco fica na penultima casa, e a reflexao o
 * joga para a segunda. O refletido deixa de ser uma sequencia hooked.
 *
 * Isto nao e detalhe de arrumacao — e o que decide se a contagem "por
 * reflexao" quer dizer alguma coisa naquele feitio.
 */
export const REFLEXAO_E_SIMETRIA = {
  skolem: true,
  hooked: false,
  langford: true,
};

/** Confere, varrendo, que a reflexao leva solucao em solucao (ou nao leva). */
export function reflexaoLevaEmSolucao(n, feitio) {
  const f = FEITIOS[feitio];
  const buraco = f.buraco ? f.buraco(n) : -1;
  let todas = true;
  let houve = false;
  varrer(n, feitio, {
    aoAchar(v) {
      houve = true;
      const r = conferir(refletir(v), n, f.distancia, buraco);
      if (!r.ok) todas = false;
    },
  });
  return { n, feitio, houve, reflexaoSempreValida: houve ? todas : null };
}

/** Tabela 1 — as contagens dos tres feitios, ordem a ordem. */
export function tabelaContagens(ate = 9) {
  const linhas = [];
  for (let n = 1; n <= ate; n++) {
    const linha = { n };
    for (const feitio of Object.keys(FEITIOS)) {
      const r = varrer(n, feitio);
      linha[feitio] = r.achados;
      linha[`${feitio}Nos`] = r.nos;
    }
    linhas.push(linha);
  }
  return linhas;
}

/**
 * Tabela 2 — a previsao de existencia contra a varredura.
 *
 * Tres condicoes, cada uma facil de derrubar: bastaria UMA solucao numa ordem
 * proibida, ou NENHUMA numa permitida.
 */
export function tabelaExistencia(ate = 9) {
  const linhas = [];
  for (const feitio of Object.keys(FEITIOS)) {
    for (let n = 1; n <= ate; n++) {
      const achou = varrer(n, feitio, { pararNoPrimeiro: true }).achados > 0;
      const previu = EXISTENCIA[feitio](n);
      linhas.push({ feitio, n, previu, achou, acertou: previu === achou });
    }
  }
  return linhas;
}

/**
 * Tabela 3 — Skolem e hooked juntas cobrem TODA ordem.
 *
 * Skolem pede n = 0 ou 1 (mod 4); a hooked pede n = 2 ou 3. Nenhuma das duas
 * sozinha cobre, e juntas nao sobra resto nenhum. Langford deixa buracos.
 */
export function tabelaCobertura(ate = 16) {
  const linhas = [];
  for (let n = 1; n <= ate; n++) {
    const s = EXISTENCIA.skolem(n);
    const h = EXISTENCIA.hooked(n);
    const l = EXISTENCIA.langford(n);
    linhas.push({ n, skolem: s, hooked: h, langford: l, skolemOuHooked: s || h });
  }
  return linhas;
}

/** Tabela 4 — a contagem bruta contra a contagem por reflexao. */
export function tabelaReflexao(ate = 9) {
  const linhas = [];
  for (const feitio of Object.keys(FEITIOS)) {
    for (let n = 1; n <= ate; n++) {
      const bruta = varrer(n, feitio).achados;
      if (bruta === 0) continue;
      linhas.push({
        feitio,
        n,
        bruta,
        porReflexao: contarPorReflexao(n, feitio),
        reflexaoEhSimetria: REFLEXAO_E_SIMETRIA[feitio],
      });
    }
  }
  return linhas;
}

/**
 * Tabela 5 — a busca contra a forca bruta.
 *
 * A forca bruta gera todas as arrumacoes do multiconjunto e filtra; a busca
 * coloca pares. Dois caminhos sem ideia em comum.
 */
export function tabelaContraForcaBruta(ate = 5) {
  const linhas = [];
  for (const feitio of Object.keys(FEITIOS)) {
    if (FEITIOS[feitio].buraco) continue; // a forca bruta nao modela o buraco
    for (let n = 1; n <= ate; n++) {
      linhas.push({
        feitio,
        n,
        busca: varrer(n, feitio).achados,
        forcaBruta: contarPorForcaBruta(n, FEITIOS[feitio].distancia),
      });
    }
  }
  return linhas;
}

/** Tabela 6 — achar a primeira contra contar todas. */
export function tabelaAcharContraContar(ate = 9) {
  const linhas = [];
  for (const feitio of Object.keys(FEITIOS)) {
    for (let n = 1; n <= ate; n++) {
      const todas = varrer(n, feitio);
      if (todas.achados === 0) continue;
      const primeira = varrer(n, feitio, { pararNoPrimeiro: true });
      linhas.push({
        feitio,
        n,
        nosParaAchar: primeira.nos,
        nosParaContar: todas.nos,
        razao: todas.nos / primeira.nos,
      });
    }
  }
  return linhas;
}
