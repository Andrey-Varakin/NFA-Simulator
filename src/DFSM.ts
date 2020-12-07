type State = string;
type InputSymbol = string;

export interface DFADescription {
  transitions: {
    [key: string]: {
      0: State;
      1: State;
    };
  };
  start: State;
  acceptStates: State[];
}

export default class DFSM {
  private description: DFADescription;

  constructor(description: DFADescription) {
    this.description = description;
  }

  transition(state: State, symbol: InputSymbol): State {
    state;
    symbol;
    this.description;
    throw 'foo';
  }

  accept(s: string): boolean {
    s;
    return false;
  }
}
