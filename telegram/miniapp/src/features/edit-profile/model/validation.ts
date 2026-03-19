import { MAX_DESCRIPTION_LENGTH } from 'shared/lib/constants/profile';
import { z } from 'zod';

export const editProfileSchema = z.object({
  firstName: z.string().min(1, 'Введите имя').max(50, 'Слишком длинное имя'),
  lastName: z.string().optional(),
  username: z
    .string()
    .min(3, 'Никнейм должен быть не менее 3 символов')
    .max(30, 'Слишком длинный никнейм'),
  city: z.string().min(1, 'Выберите город'),
  about: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Максимум ${MAX_DESCRIPTION_LENGTH} символов`)
    .optional(),
  education: z.string().optional(),
  specialization: z.string().min(1, 'Выберите специализацию').optional(),
  searchStatus: z.string().optional(),
});
