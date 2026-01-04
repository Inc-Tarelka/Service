import { z } from 'zod';

export const loginSchema = z.object({
  login: z
    .string()
    .min(1, 'Введите логин')
    .min(3, 'Логин должен быть не менее 3 символов'),
  password: z
    .string()
    .min(1, 'Введите пароль')
    .min(6, 'Пароль должен быть не менее 6 символов'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export const registerSchema = z
  .object({
    accountType: z.enum(['specialist', 'company'], {
      message: 'Выберите тип аккаунта',
    }),
    login: z
      .string()
      .min(1, 'Введите логин')
      .min(3, 'Логин должен быть не менее 3 символов'),
    password: z
      .string()
      .min(1, 'Введите пароль')
      .min(8, 'Пароль должен содержать не менее 8 символов')
      .regex(/[0-9]/, 'Пароль должен содержать цифры')
      .regex(/[a-zA-Z]/, 'Пароль должен содержать буквы')
      .regex(
        /[!@#$%^&*]/,
        'Пароль должен содержать специальные символы (!%@%)',
      ),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
    agreeToTerms: z.literal(true, {
      message: 'Необходимо согласиться с правилами',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z.string().min(1, 'Введите имя или название организации'),
  lastName: z.string().optional(),
  nickname: z
    .string()
    .min(1, 'Введите никнейм')
    .min(2, 'Никнейм должен быть не менее 2 символов'),
  specialization: z.string().min(1, 'Выберите специализацию'),
  city: z.string().min(1, 'Выберите город'),
});

export type ProfileSchemaType = z.infer<typeof profileSchema>;

export const resetSchema = z.object({
  login: z
    .string()
    .min(1, 'Введите логин')
    .min(3, 'Логин должен быть не менее 3 символов'),
});

export type ResetSchemaType = z.infer<typeof resetSchema>;

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Введите пароль')
      .min(8, 'Пароль должен содержать не менее 8 символов')
      .regex(/[0-9]/, 'Пароль должен содержать цифры')
      .regex(/[a-zA-Z]/, 'Пароль должен содержать буквы')
      .regex(
        /[!@#$%^&*]/,
        'Пароль должен содержать специальные символы (!%@%)',
      ),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type NewPasswordSchemaType = z.infer<typeof newPasswordSchema>;

export const confirmCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Введите код')
    .length(4, 'Код должен содержать 4 цифры')
    .regex(/^\d+$/, 'Код должен содержать только цифры'),
});

export type ConfirmCodeSchemaType = z.infer<typeof confirmCodeSchema>;

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};

  const issues = result.error.issues || [];
  for (const issue of issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
