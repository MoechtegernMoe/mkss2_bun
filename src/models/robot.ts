export interface Position {
  x: number;
  y: number;
}

export interface MoveAction {
  action: 'move';
  direction: string;
}
export interface PickupAction {
  action: 'pickup';
  item: number;
}
export interface PutdownAction {
  action: 'putdown';
  item: number;
}
export interface AttackAction {
  action: 'attack';
  targetId: number;
}
export interface StateUpdateAction {
  action: 'stateUpdate';
  newState: {
    energy?: number;
    position?: Position;
  };
}

export type Actions =
  | MoveAction
  | PickupAction
  | PutdownAction
  | AttackAction
  | StateUpdateAction;

export class Robot {
  id: number;
  position: Position;
  energy: number;
  inventory: number[];
  actions: Actions[];

  constructor(id: number, position: Position = { x: 0, y: 0 }, energy = 100) {
    this.id = id;
    this.position = position;
    this.energy = energy;
    this.inventory = [];
    this.actions = [];
  }

  move(direction: string) {
    switch (direction) {
      case 'up':
        this.position.y += 1;
        break;
      case 'down':
        this.position.y -= 1;
        break;
      case 'left':
        this.position.x -= 1;
        break;
      case 'right':
        this.position.x += 1;
        break;
    }
    this.actions.push({ action: 'move', direction });
  }

  pickup(itemId: number) {
    this.inventory.push(itemId);
    this.actions.push({ action: 'pickup', item: itemId });
  }

  putdown(itemId: number) {
    const index = this.inventory.indexOf(itemId);
    if (index !== -1) {
      this.inventory.splice(index, 1);
      this.actions.push({ action: 'putdown', item: itemId });
    }
  }

  attack(target: Robot) {
    if (this.energy >= 5) {
      this.energy -= 5;
      target.energy = Math.max(target.energy - 10, 0);
      this.actions.push({ action: 'attack', targetId: target.id });
    } else {
      throw new Error('Not enough energy to attack');
    }
  }

  updateState(newState: StateUpdateAction['newState']) {
    if (newState.energy !== undefined) this.energy = newState.energy;
    if (newState.position) this.position = newState.position;
    this.actions.push({ action: 'stateUpdate', newState });
  }
}
