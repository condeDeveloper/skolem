// Sequencias de Skolem, e as duas primas que vivem ao lado.
//
// Uma sequencia de Skolem de ordem n arruma {1,1,2,2,...,n,n} em 2n casas de
// modo que as DUAS copias de k fiquem a distancia exatamente k:
//
//     ordem 4:  4 1 1 3 4 2 3 2
//               ^-------^        as duas copias de 4, distancia 4
//
// A prima HOOKED usa 2n+1 casas e deixa um buraco na penultima.
// A prima de LANGFORD pede distancia k+1 em vez de k.
//
// As tres tem condicao de existencia diferente, e e disso que o projeto trata:
//
//     Skolem          n = 0 ou 1 (mod 4)
//     Skolem hooked   n = 2 ou 3 (mod 4)
//     Langford        n = 0 ou 3 (mod 4)
//
// Juntas, Skolem e a hooked cobrem TODA ordem. Nenhuma das tres sozinha cobre.

/** Os tres feitios, com a distancia que cada um exige e o tamanho do vetor. */
export const FEITIOS = {
  skolem: { distancia: (k) => k, casas: (n) => 2 * n, buraco: null },
  hooked: { distancia: (k) => k, casas: (n) => 2 * n + 1, buraco: (n) => 2 * n - 1 },
  langford: { distancia: (k) => k + 1, casas: (n) => 2 * n, buraco: null },
};

/**
 * Varre as sequencias de um feitio na ordem n.
 *
 * A busca coloca os rotulos do MAIOR para o menor. Nao e detalhe: o rotulo
 * grande e o que tem menos lugares possiveis, entao decidi-lo primeiro corta o
 * ramo cedo. Comecar pelo 1 adia toda a decisao dificil para o fundo da arvore.
 *
 * @param {object} opcoes
 *   - `pararNoPrimeiro`: devolve a primeira encontrada e para
 *   - `aoAchar`: chamada com uma copia do vetor a cada solucao
 *   - `orcamento`: teto de nos
 */
export function varrer(n, feitio = 'skolem', opcoes = {}) {
  const { pararNoPrimeiro = false, aoAchar = null, orcamento = Infinity } = opcoes;
  const f = FEITIOS[feitio];
  if (!f) throw new RangeError(`feitio desconhecido: ${feitio}`);

  const casas = f.casas(n);
  const buraco = f.buraco ? f.buraco(n) : -1;
  const vetor = new Int32Array(casas).fill(0);
  if (buraco >= 0) vetor[buraco] = -1; // marcado: ninguem pode pousar ali

  let achados = 0;
  let nos = 0;
  let primeira = null;
  let parou = false;
  let estourou = false;

  function desce(k) {
    if (parou) return;
    nos++;
    if (nos >= orcamento) {
      estourou = true;
      parou = true;
      return;
    }

    if (k === 0) {
      achados++;
      if (primeira === null) primeira = Array.from(vetor);
      if (aoAchar) aoAchar(Array.from(vetor));
      if (pararNoPrimeiro) parou = true;
      return;
    }

    const d = f.distancia(k);
    for (let i = 0; i + d < casas; i++) {
      if (vetor[i] !== 0 || vetor[i + d] !== 0) continue;
      vetor[i] = k;
      vetor[i + d] = k;
      desce(k - 1);
      vetor[i] = 0;
      vetor[i + d] = 0;
      if (parou) return;
    }
  }

  desce(n);
  return { n, feitio, achados, nos, primeira, completou: !estourou };
}

/**
 * Vira a sequencia de tras para frente.
 *
 * Toda solucao vem em par com a refletida, e as duas sao a mesma arrumacao
 * vista do outro lado. Contar as duas infla a conta pela metade — por isso o
 * medidor sempre mostra as duas contagens, a bruta e a por reflexao.
 */
export function refletir(vetor) {
  return Array.from(vetor).reverse();
}

/** Quantas solucoes existem, juntando cada uma com a sua reflexao. */
export function contarPorReflexao(n, feitio = 'skolem') {
  const vistas = new Set();
  varrer(n, feitio, {
    aoAchar(v) {
      const a = v.join(',');
      const b = refletir(v).join(',');
      vistas.add(a < b ? a : b);
    },
  });
  return vistas.size;
}

/** Uma solucao e simetrica se ela e igual a propria reflexao. */
export function quantasSimetricas(n, feitio = 'skolem') {
  let conta = 0;
  varrer(n, feitio, {
    aoAchar(v) {
      if (v.join(',') === refletir(v).join(',')) conta++;
    },
  });
  return conta;
}
