import { z } from 'zod';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@$%]).{8,}$/;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z
      .string()
      .min(8, 'Минимум 8 символов')
      .regex(
        passwordRegex,
        'Пароль должен содержать цифры, буквы и спец. символы (!@$%)',
      ),
    confirmPassword: z.string().min(8, 'Минимум 8 символов'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });
