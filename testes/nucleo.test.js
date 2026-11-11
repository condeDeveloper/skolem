import { test } from 'node:test';
import assert from 'node:assert/strict';

import { varrer, refletir, FEITIOS, contarPorReflexao, quantasSimetricas } from '../src/sequencias.js';
import { conferir, EXISTENCIA, contarPorForcaBruta } from '../src/juiz.js';

test('toda solucao encontrada passa pelo juiz, rotulo a rotulo', () => {
  for (const feitio of Object.keys(FEITIOS)) {
    const f = FEITIOS[feitio];
    for (let n = 1; n <= 7; n++) {
      const buraco = f.buraco ? f.buraco(n) : -1;
      varrer(n, feitio, {
        aoAchar(v) {
          const r = conferir(v, n, f.distancia, buraco);
          assert.equal(r.ok, true, `${feitio} n=${n}: ${r.motivo}`);
        },
      });
    }
  }
});

test('o juiz recusa rotulo na distancia errada', () => {
  // 1 1 2 2 -> o 2 esta a distancia 1, deveria ser 2
  const r = conferir([1, 1, 2, 2], 2, (k) => k);
  assert.equal(r.ok, false);
  assert.match(r.motivo, /rotulo 2/);
});

test('o juiz recusa rotulo que aparece uma vez so', () => {
  // o rotulo 1 esta certo (distancia 1), entao o juiz chega mesmo ate o 2
  const r = conferir([1, 1, 2, 0], 2, (k) => k);
  assert.equal(r.ok, false);
  assert.match(r.motivo, /aparece 1 vezes/);
});

test('a sequencia de ordem 1 e a unica de Skolem com duas casas', () => {
  const r = varrer(1, 'skolem');
  assert.equal(r.achados, 1);
  assert.deepEqual(r.primeira, [1, 1]);
});

test('as distancias de cada feitio sao as da definicao', () => {
  assert.equal(FEITIOS.skolem.distancia(5), 5);
  assert.equal(FEITIOS.langford.distancia(5), 6);
  assert.equal(FEITIOS.skolem.casas(4), 8);
  assert.equal(FEITIOS.hooked.casas(4), 9);
  assert.equal(FEITIOS.hooked.buraco(4), 7);
});

test('a hooked deixa o buraco na penultima casa, e ninguem pousa nele', () => {
  for (const n of [2, 3, 6, 7]) {
    varrer(n, 'hooked', {
      aoAchar(v) {
        assert.equal(v.length, 2 * n + 1);
        assert.equal(v[2 * n - 1], -1, `n=${n}: o buraco saiu do lugar`);
      },
    });
  }
});

test('refletir duas vezes volta ao comeco', () => {
  for (const v of [[1, 1], [4, 1, 1, 3, 4, 2, 3, 2], [2, 3, 2, 4, 3, 1, 1, 4]]) {
    assert.deepEqual(refletir(refletir(v)), v);
  }
});

test('a reflexao leva solucao em solucao no Skolem e no Langford', () => {
  for (const feitio of ['skolem', 'langford']) {
    const f = FEITIOS[feitio];
    for (let n = 1; n <= 8; n++) {
      varrer(n, feitio, {
        aoAchar(v) {
          const r = conferir(refletir(v), n, f.distancia);
          assert.equal(r.ok, true, `${feitio} n=${n}: a reflexao saiu invalida`);
        },
      });
    }
  }
});

test('a reflexao NAO leva solucao em solucao na hooked', () => {
  const f = FEITIOS.hooked;
  for (const n of [6, 7]) {
    let alguma = false;
    varrer(n, 'hooked', {
      aoAchar(v) {
        const r = conferir(refletir(v), n, f.distancia, f.buraco(n));
        if (!r.ok) alguma = true;
      },
    });
    assert.equal(alguma, true, `n=${n}: esperava reflexao invalida`);
  }
});

test('a busca e a forca bruta contam o mesmo ate n = 5', () => {
  for (const feitio of ['skolem', 'langford']) {
    for (let n = 1; n <= 5; n++) {
      assert.equal(
        varrer(n, feitio).achados,
        contarPorForcaBruta(n, FEITIOS[feitio].distancia),
        `${feitio} n=${n}`
      );
    }
  }
});

test('a forca bruta se recusa a passar de n = 5', () => {
  assert.throws(() => contarPorForcaBruta(6, (k) => k), RangeError);
});

test('a contagem por reflexao e metade da bruta menos as simetricas', () => {
  for (const feitio of ['skolem', 'langford']) {
    for (let n = 1; n <= 8; n++) {
      const bruta = varrer(n, feitio).achados;
      if (bruta === 0) continue;
      const classes = contarPorReflexao(n, feitio);
      const simetricas = quantasSimetricas(n, feitio);
      assert.equal(2 * classes - simetricas, bruta, `${feitio} n=${n}`);
    }
  }
});

test('o feitio desconhecido estoura, em vez de devolver zero em silencio', () => {
  assert.throws(() => varrer(4, 'inventado'), RangeError);
});

test('o orcamento para a varredura e marca que ela nao completou', () => {
  const r = varrer(9, 'skolem', { orcamento: 100 });
  assert.equal(r.completou, false);
  assert.ok(r.nos <= 100);
  assert.equal(varrer(9, 'skolem').completou, true);
});

test('as condicoes de existencia sao previsoes sobre n, nao sobre o codigo', () => {
  assert.equal(EXISTENCIA.skolem(4), true);
  assert.equal(EXISTENCIA.skolem(6), false);
  assert.equal(EXISTENCIA.hooked(6), true);
  assert.equal(EXISTENCIA.langford(3), true);
  assert.equal(EXISTENCIA.langford(5), false);
});
