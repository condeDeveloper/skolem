// O juiz. Nao importa nada de `sequencias.js`.
//
// A busca constroi colocando pares e nunca re-le o que escreveu. O juiz faz o
// contrario: recebe um vetor pronto, PROCURA as duas copias de cada rotulo e
// mede a distancia entre elas. Se os dois concordam, o numero vale.

/**
 * Confere um vetor pronto contra a definicao do feitio.
 *
 * Devolve `{ ok, motivo }` em vez de so um booleano: quando a busca erra, o
 * motivo diz onde, e isso ja poupou tempo.
 */
export function conferir(vetor, n, distanciaDe, buraco = -1) {
  const v = Array.from(vetor);

  if (buraco >= 0 && v[buraco] !== -1) {
    return { ok: false, motivo: `a casa ${buraco} deveria ser o buraco` };
  }

  for (let k = 1; k <= n; k++) {
    const onde = [];
    for (let i = 0; i < v.length; i++) if (v[i] === k) onde.push(i);
    if (onde.length !== 2) {
      return { ok: false, motivo: `o rotulo ${k} aparece ${onde.length} vezes` };
    }
    const d = onde[1] - onde[0];
    if (d !== distanciaDe(k)) {
      return { ok: false, motivo: `o rotulo ${k} ficou a distancia ${d}, nao ${distanciaDe(k)}` };
    }
  }

  const ocupadas = v.filter((x) => x > 0).length;
  if (ocupadas !== 2 * n) {
    return { ok: false, motivo: `${ocupadas} casas ocupadas, esperava ${2 * n}` };
  }
  return { ok: true, motivo: '' };
}

/**
 * As condicoes de existencia, como PREVISAO a ser conferida.
 *
 * Nenhuma delas e assumida pelo codigo da busca: a varredura e cega e varre
 * toda ordem. Se uma previsao destas falhar, e a previsao que cai.
 */
export const EXISTENCIA = {
  skolem: (n) => n % 4 === 0 || n % 4 === 1,
  hooked: (n) => n % 4 === 2 || n % 4 === 3,
  langford: (n) => n % 4 === 0 || n % 4 === 3,
};

/**
 * Forca bruta de verdade: gera TODAS as permutacoes do multiconjunto
 * {1,1,2,2,...,n,n} e conta as que satisfazem a condicao.
 *
 * So existe para n <= 4 — (2n)! / 2^n ja passa de 2.500 em n = 4 e de 100 mil
 * em n = 5 com repeticao. E lenta de proposito: e o unico caminho que nao
 * compartilha ideia nenhuma com a busca por pares.
 */
export function contarPorForcaBruta(n, distanciaDe) {
  if (n > 5) throw new RangeError('a forca bruta so vai ate n = 5');
  const casas = 2 * n;
  const multiconjunto = [];
  for (let k = 1; k <= n; k++) multiconjunto.push(k, k);

  let conta = 0;
  const vetor = new Array(casas).fill(0);
  const usado = new Array(multiconjunto.length).fill(false);

  function desce(pos) {
    if (pos === casas) {
      const r = conferir(vetor, n, distanciaDe);
      if (r.ok) conta++;
      return;
    }
    const jaTentados = new Set();
    for (let i = 0; i < multiconjunto.length; i++) {
      if (usado[i]) continue;
      const valor = multiconjunto[i];
      if (jaTentados.has(valor)) continue; // copias iguais dao a mesma arrumacao
      jaTentados.add(valor);
      usado[i] = true;
      vetor[pos] = valor;
      desce(pos + 1);
      vetor[pos] = 0;
      usado[i] = false;
    }
  }

  desce(0);
  return conta;
}
