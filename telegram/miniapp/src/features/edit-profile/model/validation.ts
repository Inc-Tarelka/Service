import { z } from 'zod';

export const editProfileSchema = z.object({
  firstName: z.string().min(2, 'Имя слишком короткое'),
  lastName: z.string().optional(),
  username: z.string().optional(),
  city: z.string().optional(),
  about: z.string().optional(),
  education: z.string().optional(),
  searchStatus: z.string().optional(),
});
