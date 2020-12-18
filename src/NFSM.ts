/**
 * Author: Andrey Varakin
 * Project Description: A final project for CMSI 385 (Intro to Theory of Computation).
 * This project models an Nondeterministic Finite Automaton (NFA), and can act as
 * an NFA simulator. All one needs to set up an NFA is to have a start state, description of
 * the transitions between states, and one or more accept states. Can also convert an NFA
 * into an equivalent DFA
 */

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

  /**
   * Helper function to find all states connected to the current state by lambda moves
   * @param  {NFADescription} NFA The NFA
   * @param  {State} stateToCheck The state to transition from
   * @return {Array<string>}      Returns an array of the states reachable by lambda moves
   */
  findLambdas(NFA: NFADescription, stateToCheck: State): Array<string> {
    const lambdaStates = [];
    const stateQueue = [stateToCheck];

    while (stateQueue.length != 0) {
      const currState = stateQueue.shift();
      if (currState != stateToCheck) {
        lambdaStates.push(currState);
      }
      if (NFA.transitions[currState]['lambda'] != []) {
        stateQueue.push(...NFA.transitions[currState]['lambda']);
        lambdaStates.push(...NFA.transitions[currState]['lambda']);
      }
    }

    //Filters out duplicate values in the array
    return [...new Set(lambdaStates)];
  }

  /**
   * Helper function to determine whether an array is already in the queue, disregarding order
   * @param  {Array<Array<string>>} queue The queue, made up of arrays representing states in the DFA
   * @param  {Array<string>}        arrayToCheck The specific array to check
   * @return {boolean}              Returns whether the array is in fact in the queue
   */
  isInQueue(queue: Array<Array<string>>, arrayToCheck: Array<string>): boolean {
    arrayToCheck = arrayToCheck.sort();
    for (const array of queue) {
      if (array.sort() == arrayToCheck) {
        return true;
      }
    }
    return false;
  }

  /**
   * Converts an NFADescription into a DFA description
   * @param  {NFADescription} NFA The NFA to convert
   * @return {DFADescription} Returns an equivalent DFA
   */
  convertNFAtoDFA(NFA: NFADescription): DFADescription {
    const NFAstart = NFA.start;
    const NFAacceptStates = NFA.acceptStates;

    const dfa: DFADescription = {
      transitions: {
        DEAD: {
          0: 'DEAD',
          1: 'DEAD',
        },
      },
      start: NFAstart,
      acceptStates: NFAacceptStates,
    };

    //FindLambdas only returns the lambda-reachable states, and not
    //the passed state itself, so we push the original start state as well
    const startState = [NFAstart];
    startState.push(...this.findLambdas(NFA, NFAstart));
    dfa.transitions[startState.join()] = { 0: '', 1: '' };

    const stateQueue = [startState];

    //Iteratively adds states to our DFA based on the NFA
    while (stateQueue.length != 0) {
      const currState = stateQueue.shift();

      const transitionsWith0 = [];
      const transitionsWith1 = [];

      for (const state of currState) {
        //Check for transitions with 0
        if (this.transition(state, '0').length != 0) {
          transitionsWith0.push(...this.transition(state, '0'));
        }
        //Check for transitions with 1
        if (this.transition(state, '1').length != 0) {
          transitionsWith1.push(...this.transition(state, '1'));
        }
      }

      //Check for lambdas
      for (const state of transitionsWith0) {
        //Find all lambdas reachable from transitions
        const reachableLambdas = this.findLambdas(NFA, state);
        for (const element of reachableLambdas) {
          if (!transitionsWith0.includes(element)) {
            transitionsWith0.push(element);
          }
        }
      }
      for (const state of transitionsWith1) {
        //Find all lambdas reachable from transitions
        const reachableLambdas = this.findLambdas(NFA, state);
        for (const element of reachableLambdas) {
          if (!transitionsWith1.includes(element)) {
            transitionsWith1.push(element);
          }
        }
      }

      //If transitions are not already in the queue or DFA, add them to the queue
      if (
        !this.isInQueue(stateQueue, transitionsWith0) &&
        !(transitionsWith0.join() in dfa.transitions) &&
        transitionsWith0.length != 0
      ) {
        stateQueue.push(transitionsWith0);
      }
      if (
        !this.isInQueue(stateQueue, transitionsWith1) &&
        !(transitionsWith1.join() in dfa.transitions) &&
        transitionsWith1.length != 0
      ) {
        stateQueue.push(transitionsWith1);
      }

      //Add transitions to the DFA
      dfa.transitions[currState.join()] = {
        0: transitionsWith0.join(),
        1: transitionsWith1.join(),
      };

      //Account for dead states
      if (dfa.transitions[currState.join()][0] == '') {
        dfa.transitions[currState.join()][0] = 'DEAD';
      }
      if (dfa.transitions[currState.join()][1] == '') {
        dfa.transitions[currState.join()][1] = 'DEAD';
      }
    }

    return dfa;
  }
}
