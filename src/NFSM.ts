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
  private NFAdescription: NFADescription;

  /**
   * Constructor for the NFA
   * @param  {NFADescription} NFAdescription A description of the NFA
   */
  constructor(NFAdescription: NFADescription) {
    this.NFAdescription = NFAdescription;
  }

  /**
   * Transition from one state of an NFA to another.
   * @param  {State} state The current state you are at.
   * @param  {InputSymbol} symbol The symbol to transition with.
   * @return {State[]}     A State array of all states that can be reached w/ the symbol.
   */
  transition(state: State, symbol: InputSymbol): State[] {
    const {
      NFAdescription: { transitions },
    } = this;
    return transitions[state][symbol];
  }

  /**
   * Tells whether a string will be accepted by the NFA.
   * @param  {string} inputString The string to test.
   * @return {boolean}            Returns true if the string is accepted,
   *                              false otherwise.
   */
  accept(inputString: string): boolean {
    const {
      NFAdescription: { start, acceptStates },
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
