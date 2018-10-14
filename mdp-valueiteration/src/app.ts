import * as Immutable from 'immutable';
import { Action, Simulation, State, StatePosition, TerrainType, BaseSimulation } from './MarkovDecisionProcess';
import * as _ from 'lodash';
let width = 4
let height = 3

let numOfIterations = 50;
let gamma = .9;
const reward = -.4;
//Generate states:

let valueMaps: Immutable.Map<State, number>[] = [];
let valueMap = Immutable.Map<State, number>()

let actionMap = Immutable.Map<State, Action[]>()
let terrainMap = Immutable.Map<State, TerrainType>()
let policyMap = Immutable.Map<State, Action>()
let simulation = new BaseSimulation()
let states: State[] = new Array<State>()
for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    let [state, terrain] = createState(x, y)
    states.push(state)
    terrainMap = terrainMap.set(state, terrain)
  }
}

states.forEach(s => valueMap = valueMap.set(s, 0))
states.forEach(s => {

  actionMap = actionMap.set(s, (!terrainMap.has(s)) ? [] : createActionsForState(s, reward, terrainMap.get(s), s => (terrainMap.has(s) && terrainMap.get(s) !== 'wall')))
})
valueMap = valueMap.set(State([-1, -1]), 0)
//Main Execution loop

let simulate = function (numOfIterations: number, gamma: number, reward: number) {
  for (let iteration = 0; iteration < numOfIterations; iteration++) {
    let newValueMap = Immutable.Map<State, number>()
    states.forEach(s => {
      let actions = actionMap.get(s)
      actions.forEach(a => {
        // console.log(a)
        let sum = 0;
        act(a, s, actions).forEach(t => {
          let vNext = valueMap.get(t.nextState);
          sum += t.probability * (a.reward + gamma * vNext)
          console.log({t, a, gamma, vNext})
        });
        if (!newValueMap.has(s) || newValueMap.get(s) < sum) {
          newValueMap = newValueMap.set(s, sum);
          policyMap = policyMap.set(s, a)
        }
      })

    })
    valueMaps.push(valueMap)
    valueMap = newValueMap
    valueMap = valueMap.set(State([-1, -1]), 0)
  }
  for (let y = 0; y < height; y++) {
    let line = ""
    for (let x = 0; x < width; x++) {
      let s: State = State([x, y])
      line = line.concat("\t", terrainMap.get(s).charAt(0));
    }
    console.log(line)
  }
  
  for (let y = 0; y < height; y++) {
    let line = ""
    for (let x = 0; x < width; x++) {
      let s: State = State([x, y])
      line = line.concat("\t", valueMap.get(s).toPrecision(2).toString());
    }
    console.log(line)
  }
  
  for (let y = 0; y < height; y++) {
    let line = ""
    for (let x = 0; x < width; x++) {
      let s: State = State([x, y])
      line = line.concat("\t", policyMap.get(s).name.charAt(0));
    }
    console.log(line)
  }
  return {
    valueMaps, actionMap, policyMap, terrainMap, states
  }
}
simulate(numOfIterations, gamma, reward)

function act(action: Action, state: State, actionSet: Action[]): TransitionalState[] {
  let actionName = action.name;
  let isMoveAction = (['left', 'right', 'up', 'down']).filter(d => d === actionName).length > 0
  if (isMoveAction) {
    let horizontal = (['left', 'right']).filter(d => d === actionName).length > 0;
    let vertical = (['up', 'down']).filter(d => d === actionName).length > 0;
    if (horizontal) {
      return createTransitionalStates(state, action, ['up', 'down'], actionSet)
    } else if (vertical) {
      return createTransitionalStates(state, action, ['left', 'right'], actionSet)
    }
  }
  return [{
    probability: 1,
    state: state,
    nextState: action.do(state)
  }];
}

function createTransitionalStates(
  state: State,
  action: Action,
  actions: [string, string],
  actionSet: Action[]): TransitionalState[] {
  let [a1, a2] = actions
  let otherActions = actionSet.filter(a => a.name === a1 || a.name === a2)
  let ret = [{
    probability: .8,
    state: state,
    nextState: action.do(state)
  }]
  let prob = (1 - .8) / otherActions.length
  otherActions.forEach(a => {
    ret.push({
      probability: prob,
      state: state,
      nextState: a.do(state)
    })
  })
  return ret
}

interface TransitionalState {
  probability: number,
  nextState: State,
  state: State
}

function createState(x: number, y: number): [State, TerrainType] {
  let state: State = State([x, y])
  let terrain: TerrainType = 'ground'
  if (_.isEqual(state.position, [3, 0])) terrain = 'exit'
  else if (_.isEqual(state.position, [3, 1])) terrain = 'pit'
  else if (_.isEqual(state.position, [1, 1])) terrain = 'wall'
  return [state, terrain];
}

function createActionsForState(s: State, reward: number, terrain: TerrainType, validState: (s: State) => boolean): Action[] {
  let actions: Action[] = new Array<Action>();
  switch (terrain) {
    case 'exit':
      actions.push({
        name: 'exit',
        reward: 1,
        do: s => createEndState()
      })
      break;
    case 'pit':
      actions.push({
        name: 'exit',
        reward: -1,
        do: s => createEndState()
      })
      break;
    case 'wall':
      actions.push({
        name: ' ',
        reward: 0,
        do: s => createEndState()
      })
      break;
    default:
      actions.push(generateMoveAction('left', reward, [-1, 0], validState))
      actions.push(generateMoveAction('right', reward, [1, 0], validState))
      actions.push(generateMoveAction('up', reward, [0, -1], validState))
      actions.push(generateMoveAction('down', reward, [0, 1], validState))
      break;
  }
  return actions;
}

function generateMoveAction(name: string, reward: number, direction: [number, number], validState: (s: State) => boolean): Action {
  return {
    name: name,
    reward: reward,
    do: s => {
      let [x, y] = s.position
      let [xNext, yNext] = direction
      let newState: State = State([x + xNext, y + yNext]);//{ position: [x + xNext, y + yNext] };
      if (validState(newState))
        return newState
      else return s;
    }
  }
}

function createEndState(): State {
  return State([-1, -1])
}


function State(position: StatePosition): State {
  return {
    position: position,
    hashCode(): number {
      const prime = 31;
      let result = 1;
      result = prime * result + hashArray(position);
      return result;
      // return position[0] * 1e3 + position[1]
    },
    equals(o: any) {
      return _.isEqual(this.position, o.position)
    }
  }
}


function hashArray(a: number[]): number {
  if (a == null)
    return 0;

  let result = 1;
  a.forEach(element => {
    let elementHash = (element ^ (element >>> 16));
    result = 31 * result + elementHash;
  })

  return result;
}