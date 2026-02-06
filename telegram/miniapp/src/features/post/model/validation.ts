import { z } from 'zod';

export const needSchema = z
  .object({
    title: z.string().min(1, 'Введите название'),
    description: z
      .string()
      .min(1, 'Введите описание')
      .max(100, 'Описание не должно превышать 100 символов'),
    tagIds: z.array(z.string()),
    startDate: z.date({ message: 'Введите дату начала' }).nullable(),
    endDate: z.date({ message: 'Введите дату окончания' }).nullable(),
    budget: z.string().min(1, 'Введите бюджет'),
  })
  .refine(
    (data) =>
      !data.endDate || !data.startDate || data.endDate >= data.startDate,
    {
      message: 'Дата окончания не может быть раньше даты начала',
      path: ['endDate'],
    },
  );

export type NeedSchemaType = z.infer<typeof needSchema>;
