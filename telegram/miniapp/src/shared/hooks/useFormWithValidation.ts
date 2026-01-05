import { useCallback, useState } from 'react';
import { validateForm } from 'shared/library/validation';
import { ZodSchema } from 'zod';

interface UseFormWithValidationProps<T> {
  initialValues: T;
  schema: ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useFormWithValidation<T extends Record<string, any>>({
  initialValues,
  schema,
  onSubmit,
}: UseFormWithValidationProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: any, currentValues: T) => {
      const tempValues = { ...currentValues, [name]: value };

      const validation = validateForm(schema, tempValues);

      setErrors((prev) => {
        const nextErrors = { ...prev };

        if (!validation.success) {
          if (validation.errors[name as string]) {
            nextErrors[name as string] = validation.errors[name as string];
          } else {
            delete nextErrors[name as string];
          }

          if (name === 'password' && 'confirmPassword' in currentValues) {
            const confirmPasswordValidation = validateForm(schema, tempValues);
            if (
              !confirmPasswordValidation.success &&
              confirmPasswordValidation.errors['confirmPassword']
            ) {
              nextErrors['confirmPassword'] =
                confirmPasswordValidation.errors['confirmPassword'];
            } else {
              delete nextErrors['confirmPassword'];
            }
          }
        } else {
          delete nextErrors[name as string];

          if (name === 'password' && 'confirmPassword' in currentValues) {
            delete nextErrors['confirmPassword'];
          }
        }

        return nextErrors;
      });
    },
    [schema],
  );

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => {
        const nextValues = { ...prev, [name]: value };
        validateField(name, value, nextValues);
        return nextValues;
      });
    },
    [validateField],
  );

  const handleInputChange = useCallback(
    (name: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(name, e.target.value);
    },
    [handleChange],
  );

  const handleSubmit = async () => {
    const validation = validateForm(schema, values);

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleInputChange,
    handleSubmit,
    setValues,
    setErrors,
  };
}
