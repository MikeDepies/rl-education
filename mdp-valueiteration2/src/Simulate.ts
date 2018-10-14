// import { State, StatePosition, Action, TerrainType } from './MarkovDecisionProcess'
// import * as Immutable from 'immutable'
// import * as _ from 'lodash'
// class Simulate {
//   valueMaps: Immutable.Map<State, number>[] = [];
//   valueMap = Immutable.Map<State, number>()
  
//   actionMap = Immutable.Map<State, Action[]>()
//   terrainMap = Immutable.Map<State, TerrainType>()
//   policyMap = Immutable.Map<State, Action>()
// }

// export interface TransitionalState {
//   probability: number,
//   nextState: State,
//   state: State
// }

// function act(action: Action, state: State): TransitionalState[] {
//   let actionName = action.name;
//   let isMoveAction = (['left', 'right', 'up', 'down']).filter(d => d === actionName).length > 0
//   if (isMoveAction) {
//     let horizontal = (['left', 'right']).filter(d => d === actionName).length > 0;
//     let vertical = (['up', 'down']).filter(d => d === actionName).length > 0;
//     if (horizontal) {
//       return createTransitionalStates(state, action, ['up', 'down'])
//     } else if (vertical) {
//       return createTransitionalStates(state, action, ['left', 'right'])
//     }
//   }
//   return [{
//     probability: 1,
//     state: state,
//     nextState: action.do(state)
//   }];
// }

// function createTransitionalStates(state: State, action: Action, actions: [string, string]): TransitionalState[] {
//   let [a1, a2] = actions
//   let otherActions = actionMap.get(state).filter(a => a.name === a1 || a.name === a2)
//   let ret = [{
//     probability: .8,
//     state: state,
//     nextState: action.do(state)
//   }]
//   let prob = (1 - .8) / otherActions.length
//   otherActions.forEach(a => {
//     ret.push({
//       probability: prob,
//       state: state,
//       nextState: a.do(state)
//     })
//   })
//   return ret
// }

// function createActionsForState(s: State, reward: number): Action[] {
//   if (!terrainMap.has(s)) return [];
//   let actions: Action[] = new Array<Action>();
//   switch (terrainMap.get(s)) {
//     case 'exit':
//       actions.push({
//         name: 'exit',
//         reward: 1,
//         do: s => createEndState()
//       })
//       break;
//     case 'pit':
//       actions.push({
//         name: 'exit',
//         reward: -10,
//         do: s => createEndState()
//       })
//       break;
//     case 'wall':
//       actions.push({
//         name: ' ',
//         reward: 0,
//         do: s => createEndState()
//       })
//       break;
//     default:
//       actions.push(generateMoveAction('left', reward, [-1, 0]))
//       actions.push(generateMoveAction('right', reward, [1, 0]))
//       actions.push(generateMoveAction('up', reward, [0, -1]))
//       actions.push(generateMoveAction('down', reward, [0, 1]))
//       break;
//   }
//   return actions;
// }

// function generateMoveAction(name: string, reward: number, direction: [number, number]): Action {
//   return {
//     name: name,
//     reward: reward,
//     do: s => {
//       let [x, y] = s.position
//       let [xNext, yNext] = direction
//       let newPosition: State = State([x + xNext, y + yNext]);//{ position: [x + xNext, y + yNext] };
//       if (terrainMap.has(newPosition) && !(terrainMap.get(newPosition) === 'wall'))
//         return newPosition
//       else return s;
//     }
//   }
// }

// function createEndState(): State {
//   return State([-1, -1])
// }

// let simulate = function (numOfIterations: number, gamma: number, reward: number) {
//   for (let iteration = 0; iteration < numOfIterations; iteration++) {
//     let newValueMap = Immutable.Map<State, number>()
//     states.forEach(s => {
//       let actions = actionMap.get(s)
//       actions.forEach(a => {
//         // console.log(a)
//         let sum = 0;
//         act(a, s).forEach(t => {
//           let vNext = valueMap.get(t.nextState);
//           sum += t.probability * (a.reward + gamma * valueMap.get(t.nextState))
//           // console.log({t, a, gamma, vNext})
//         });
//         if (!newValueMap.has(s) || newValueMap.get(s) < sum) {
//           newValueMap = newValueMap.set(s, sum);
//           policyMap = policyMap.set(s, a)
//         }
//       })

//     })
//     valueMaps.push(valueMap)
//     valueMap = newValueMap
//     valueMap = valueMap.set(State([-1, -1]), 0)
//   }
//   return {
//     valueMaps, actionMap, policyMap, terrainMap, states
//   }
// }