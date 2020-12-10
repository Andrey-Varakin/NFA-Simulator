type State = string;
type InputSymbol = string;

export interface NFADescription {
  transitions: {
    [key: string]: {
      0: State[];
      1: State[];
      lambda: State[];
    };
  };
  start: State;
  acceptStates: State[];
}

export default class NFSM {
  private description: NFADescription;

  constructor(description: NFADescription) {
    this.description = description;
  }

  transition(state: State, symbol: InputSymbol): State[] {
    const {
      description: { transitions },
    } = this;
    return transitions[state][symbol];
  }

  accept(inputString: string): boolean {
    const {
      description: { start, acceptStates },
    } = this;
    const state = start;
    const stateQueue = [state];

    for (const symbol of inputString) {
      let queueSize = stateQueue.length;
      for (let i = 0; i < queueSize; i++) {
        const currState = stateQueue.shift();

        const nextLambdaStates = this.transition(currState, 'lambda');
        queueSize = queueSize + nextLambdaStates.length;
        stateQueue.push(...nextLambdaStates);

        const nextStates = this.transition(currState, symbol);
        stateQueue.push(...nextStates);
      }
    }

    //Finally check all states left in queue and return true if one of them is accepted
    for (const state of stateQueue) {
      if (acceptStates.includes(state)) {
        return true;
      }
    }
    return false;
  }
}
