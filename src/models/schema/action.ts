import { PositionSchema } from './position';
import { z } from 'zod';

export const Directions = z.enum(['up', 'down', 'left', 'right'], {
  errorMap: () => ({
    message: 'Please provide a valid direction (up, down, left, right).'
  })
});
export type Direction = z.infer<typeof Directions>;

export interface MoveAction {
  action: 'move';
  direction: Direction;
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

export const StateUpdateSchema = z
  .object({
    energy: z.number().gte(0).lte(100),
    position: PositionSchema
  })
  .partial()
  .refine(
    ({ energy, position }) => energy !== undefined || position !== undefined,
    { message: 'Either position or energy must be defined' }
  );
export interface StateUpdateAction {
  action: 'stateUpdate';
  newState: z.infer<typeof StateUpdateSchema>;
}

export type Actions =
  | MoveAction
  | PickupAction
  | PutdownAction
  | AttackAction
  | StateUpdateAction;
