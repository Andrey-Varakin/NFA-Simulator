import test from 'ava';

import DFSM, { DFADescription } from './DFSM';

const startsWith0: DFADescription = {
  transitions: {
    S: {
      0: 'A',
      1: 'B',
    },
    A: {
      0: 'A',
      1: 'A',
    },
    B: {
      0: 'B',
      1: 'B',
    },
  },
  start: 'S',
  acceptStates: ['A'],
};

test('constructor', (t) => {
  const dfa = new DFSM(startsWith0);
  return t.truthy(dfa);
});
