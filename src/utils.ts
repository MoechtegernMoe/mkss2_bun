import { z } from 'zod';

export const intAsString = z
  .string()
  .regex(/^-?\d+$/, 'Must be an integer')
  .transform((val) => Number.parseInt(val, 10));
