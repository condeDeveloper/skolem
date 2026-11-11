#!/usr/bin/env node
// Roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js
//   node ferramentas/medidor.js existencia

import {
  tabelaContagens, tabelaExistencia, tabelaCobertura, tabelaReflexao,
  tabelaContraForcaBruta, tabelaAcharContraContar, reflexaoLevaEmSolucao,
} from '../src/medidas.js';

const tabelas = {
  contagens() {
    console.log('Quantas sequencias de cada feitio, ordem a ordem');
    console.log('------------------------------------------------');
    console.log('   n    skolem   hooked  langford');
    for (const l of tabelaContagens(9)) {
      console.log('  %s  %s  %s  %s',
        String(l.n).padStart(2), String(l.skolem).padStart(8),
        String(l.hooked).padStart(7), String(l.langford).padStart(8));
    }
  },

  existencia() {
    console.log('As tres condicoes de existencia, contra a varredura');
    console.log('---------------------------------------------------');
    console.log('  skolem    n = 0 ou 1 (mod 4)');
    console.log('  hooked    n = 2 ou 3 (mod 4)');
    console.log('  langford  n = 0 ou 3 (mod 4)');
    console.log();
    const linhas = tabelaExistencia(9);
    for (const l of linhas) {
      if (!l.acertou) {
        console.log('  ERROU: %s n=%d previu %s achou %s', l.feitio, l.n, l.previu, l.achou);
      }
    }
    console.log('  -> acertou em %d de %d previsoes',
      linhas.filter((l) => l.acertou).length, linhas.length);
  },

  cobertura() {
    console.log('Skolem e hooked juntas cobrem toda ordem');
    console.log('-----------------------------------------');
    console.log('   n  skolem  hooked  uma das duas  langford');
    for (const l of tabelaCobertura(16)) {
      console.log('  %s  %s  %s  %s  %s',
        String(l.n).padStart(2), String(l.skolem).padStart(6),
        String(l.hooked).padStart(6), String(l.skolemOuHooked).padStart(12),
        String(l.langford).padStart(8));
    }
    const todas = tabelaCobertura(16).every((l) => l.skolemOuHooked);
    console.log();
    console.log('  alguma das duas existe em TODA ordem ate 16: %s', todas);
  },

  reflexao() {
    console.log('A contagem bruta contra a contagem por reflexao');
    console.log('-----------------------------------------------');
    console.log('  feitio    n  bruta  por reflexao  reflexao e simetria?');
    for (const l of tabelaReflexao(9)) {
      console.log('  %s  %s  %s  %s  %s',
        l.feitio.padEnd(8), String(l.n).padStart(2),
        String(l.bruta).padStart(5), String(l.porReflexao).padStart(12),
        String(l.reflexaoEhSimetria).padStart(20));
    }
    console.log();
    console.log('  na hooked a reflexao NAO e simetria: o buraco fica na');
    console.log('  penultima casa, e virar tudo o joga para a segunda.');
    for (const n of [6, 7]) {
      const r = reflexaoLevaEmSolucao(n, 'hooked');
      console.log('  hooked n=%d: toda reflexao continua valida? %s', n, r.reflexaoSempreValida);
    }
  },

  forcabruta() {
    console.log('A busca contra a forca bruta');
    console.log('-----------------------------');
    console.log('  a forca bruta gera todas as arrumacoes do multiconjunto e');
    console.log('  filtra; a busca coloca pares. Nenhuma ideia em comum.');
    console.log('  feitio     n  busca  forca bruta');
    let todos = true;
    for (const l of tabelaContraForcaBruta(5)) {
      console.log('  %s  %s  %s  %s  %s',
        l.feitio.padEnd(8), String(l.n).padStart(2),
        String(l.busca).padStart(5), String(l.forcaBruta).padStart(11),
        l.busca === l.forcaBruta ? '' : '<- DISCORDAM');
      todos = todos && l.busca === l.forcaBruta;
    }
    console.log('  ->', todos ? 'concordam em todos' : 'HA DISCORDANCIA');
  },

  custo() {
    console.log('Achar a primeira contra contar todas');
    console.log('-------------------------------------');
    console.log('  feitio     n  achar  contar  razao');
    for (const l of tabelaAcharContraContar(9)) {
      console.log('  %s  %s  %s  %s  %s',
        l.feitio.padEnd(8), String(l.n).padStart(2),
        String(l.nosParaAchar).padStart(5), String(l.nosParaContar).padStart(6),
        (l.razao.toFixed(1) + 'x').padStart(9));
    }
  },
};

const pedida = process.argv[2];
const nomes = pedida ? [pedida] : Object.keys(tabelas);
for (const nome of nomes) {
  if (!tabelas[nome]) {
    console.error('tabela desconhecida: %s', nome);
    console.error('conhecidas: %s', Object.keys(tabelas).join(', '));
    process.exit(1);
  }
  tabelas[nome]();
  console.log();
}
