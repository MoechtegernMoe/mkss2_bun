import { z } from 'zod';

export const PositionSchema = z.object({
  x: z.number().int().finite(),
  y: z.number().int().finite()
});

export type Position = z.infer<typeof PositionSchema>;
