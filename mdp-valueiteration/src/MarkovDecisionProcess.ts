/*
import { hash } from 'tstl';
    0 1 2 3
  0 o o o X
  1 o W o P
  2 o o o o

  Value function for all stats at timestep 0 is equal to 0.
  There is a set of Actions A. An action has a SET of future states.

  gamma = y = .9
  T = 0 Vt+1 = ...
  ====
  [..,..] excluding (4,1) Regular state: .1 * (-.03 + 0) + .1 * (-.03 + 0) + .8 * (-.03 + 0)
  (3,0) Exit state: 1 * (1 + 0)
  (3,1) exit state: 1 * (-1 + 0)
  
  T = 1 Vt+1 = ...
  ====
  (2,0) state: .1 * (-.03 + 0) + .1 * (-.03 + 0) + .8 * (-.03 + .9*1)
  Regular state: .1 * (-.03 + 0) + .1 * (-.03 + (.9*-1) ) + .8 * (-.03 + 0)
  Exit state: + 1 * (1 + 0)
  
  T = 2 Vt+1 = ...
  ====
  (2,0) state: .1 * (-.03 + 0) + .1 * (-.03 + 0) + .8 * (-.03 + .9*1)
  Regular state: .1 * (-.03 + 0) + .1 * (-.03 + (.9*-1) ) + .8 * (-.03 + 0)
  Exit state: + 1 * (1 + 0)
  
*/
import * as hash from 'object-hash';
import * as Immutable from 'immutable'
import { equals } from 'typescript-collections/dist/lib/arrays';

export type StatePosition = [number, number]
export type TerrainType = "ground" | "wall" | "pit" | "exit"
export interface State  {
  position: StatePosition,
  equals(o :any):boolean,
  hashCode() : number, 
}

export interface Action {
  name: string,
  reward: number,
  do: (currentState: State) => State
}

export interface Simulation {
  actions: (state: State) => Action[]
  value: (state: State) => number,
  terrain: (state: State) => TerrainType
}


export class BaseSimulation implements Simulation {
  valueMap : Immutable.Map<State, number>;
  actionMap : Immutable.Map<State, Action[]>;
  terrainMap : Immutable.Map<State, TerrainType>;
  policyMap : Immutable.Map<State, Action>;
  constructor() {
    this.valueMap = Immutable.Map<State, number>()
    this.actionMap = Immutable.Map<State, Action[]>()
    this.terrainMap = Immutable.Map<State, TerrainType>()
    this.policyMap = Immutable.Map<State, Action>()
  };
  actions: (state: State) => Action[]; 
  value: (state: State) => number;
  terrain: (state: State) => TerrainType
  setActions: (state:State, actions: Action[]) => void
}
