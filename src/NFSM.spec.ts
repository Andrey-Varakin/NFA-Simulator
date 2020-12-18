import test from 'ava';

import NFSM, { NFADescription } from './NFSM';

const NFASimulatorTests: {
  [name: string]: {
    description: NFADescription;
    accepted: string[];
    rejected: string[];
  };
} = {
  startsWith0OrEndsWith1: {
    accepted: ['0', '11', '0000', '011111'],
    rejected: ['', '10', '100', '1100', '1011110'],
    description: {
      transitions: {
        S: {
          0: [],
          1: [],
          lambda: ['A', 'C'],
        },
        A: {
          0: ['A'],
          1: ['A', 'B'],
          lambda: [],
        },
        B: {
          0: [],
          1: [],
          lambda: [],
        },
        C: {
          0: ['D'],
          1: [],
          lambda: [],
        },
        D: {
          0: ['D'],
          1: ['D'],
          lambda: [],
        },
      },
      start: 'S',
      acceptStates: ['B', 'D'],
    },
  },
  divBy3: {
    accepted: ['0', '11', '0000', '1001', '101001101'],
    rejected: ['10', '100', '1000', '1', '101'],
    description: {
      transitions: {
        r0: {
          0: ['r0'],
          1: ['r1'],
          lambda: [],
        },
        r1: {
          0: ['r2'],
          1: ['r0'],
          lambda: [],
        },
        r2: {
          0: ['r1'],
          1: ['r2'],
          lambda: [],
        },
      },
      start: 'r0',
      acceptStates: ['r0'],
    },
  },
  startsWith0AndEndsWith1: {
    accepted: [
      '01',
      '0101010101',
      '0001',
      '0001111111',
      '01100100100000010101010001010100101001',
    ],
    rejected: ['', '100', '1', '00', '110'],
    description: {
      transitions: {
        S: {
          0: ['A'],
          1: [],
          lambda: [],
        },
        A: {
          0: [],
          1: ['D'],
          lambda: ['B'],
        },
        B: {
          0: ['B'],
          1: ['B', 'C'],
          lambda: [],
        },
        C: {
          0: [],
          1: [],
          lambda: [],
        },
        D: {
          0: [],
          1: [],
          lambda: [],
        },
      },
      start: 'S',
      acceptStates: ['C', 'D'],
    },
  },
};

const NFAtoDFATests: {
  [name: string]: {
    description: NFADescription;
  };
} = {
  lambdaTest: {
    description: {
      transitions: {
        1: {
          0: ['2'],
          1: [],
          lambda: ['3'],
        },
        2: {
          0: [],
          1: ['2', '4'],
          lambda: [],
        },
        3: {
          0: ['4'],
          1: [],
          lambda: ['2'],
        },
        4: {
          0: ['3'],
          1: [],
          lambda: [],
        },
      },
      start: '1',
      acceptStates: ['3', '4'],
    },
  },
  startsWith0: {
    description: {
      transitions: {
        A: {
          0: ['B'],
          1: [],
          lambda: [],
        },
        B: {
          0: ['B'],
          1: ['B'],
          lambda: [],
        },
      },
      start: 'A',
      acceptStates: ['B'],
    },
  },
  endsWith01: {
    description: {
      transitions: {
        A: {
          0: ['A', 'B'],
          1: ['A'],
          lambda: [],
        },
        B: {
          0: [],
          1: ['C'],
          lambda: [],
        },
        C: {
          0: [],
          1: [],
          lambda: [],
        },
      },
      start: 'A',
      acceptStates: ['C'],
    },
  },
  secondToLastIs1: {
    description: {
      transitions: {
        A: {
          0: ['A'],
          1: ['A', 'B'],
          lambda: [],
        },
        B: {
          0: ['C'],
          1: ['C'],
          lambda: [],
        },
        C: {
          0: [],
          1: [],
          lambda: [],
        },
      },
      start: 'A',
      acceptStates: ['C'],
    },
  },
};

for (const [name, testDesc] of Object.entries(NFASimulatorTests)) {
  test(`${name}/constructor`, (t) => {
    const nfa = new NFSM(testDesc.description);
    return t.truthy(nfa);
  });

  test(`${name}/transition`, (t) => {
    const nfa = new NFSM(testDesc.description);
    const { transitions } = testDesc.description;

    for (const [state, stateTransitions] of Object.entries(transitions)) {
      for (const [symbol, nextState] of Object.entries(stateTransitions)) {
        t.assert(nextState === nfa.transition(state, symbol));
      }
    }
  });

  test(`${name}/accepts`, (t) => {
    const nfa = new NFSM(testDesc.description);
    const { accepted, rejected } = testDesc;

    for (const s of accepted) {
      t.assert(nfa.accept(s));
    }

    for (const s of rejected) {
      t.assert(!nfa.accept(s));
    }
  });
}

for (const [name, testDesc] of Object.entries(NFAtoDFATests)) {
  test(`${name}/convert`, (t) => {
    const nfa = new NFSM(testDesc.description);
    t.assert(nfa.convertNFAtoDFA(testDesc.description));
    console.log('\nTesting: ' + name + '\n\n' + 'Resulting DFA Description:');
    console.log(nfa.convertNFAtoDFA(testDesc.description));
  });
}
