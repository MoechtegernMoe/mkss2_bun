import { Position } from './schema/position';

export class Item {
  id: number;
  robotId: number | null;
  position: Position | null;
  inInventory: boolean;

  constructor(
    id: number,
    position: Position | null = null,
    inInventory = false,
    robotId = null
  ) {
    this.id = id;
    this.position = position;
    this.inInventory = inInventory;
    this.robotId = robotId;
  }

  setNotInInventory(x: Position['x'], y: Position['y']) {
    this.position = { x, y };
    this.inInventory = false;
    this.robotId = null;
  }

  setInInventory(robotId: number) {
    this.inInventory = true;
    this.robotId = robotId;
    this.position = null;
  }
}
