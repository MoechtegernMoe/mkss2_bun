import { z } from 'zod';

export const intAsString = z
  .string()
  .regex(/^-?\d+$/, 'Must be an integer string')
  .transform((val) => Number.parseInt(val, 10));
