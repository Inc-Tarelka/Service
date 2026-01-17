import { Button, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { Page } from 'widgets/Page';

import { useStore } from 'app/StoreProvider';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { resetSchema } from '../../model/validation';

import s from './PasswordResetForm.module.scss';

interface PasswordResetFormProps {
  onSuccess: (data: { login: string; requestId: string }) => void;
}

export const PasswordResetForm = observer(
  ({ onSuccess }: PasswordResetFormProps) => {
    const { authStore } = useStore();

    const {
      values,
      errors,
      isSubmitting,
      handleInputChange,
      handleSubmit,
      setErrors,
    } = useFormWithValidation({
      initialValues: { login: '' },
      schema: resetSchema,
      onSubmit: async (values) => {
        const requestId = await authStore.forgotPasswordAction({
          username: values.login,
        });

        if (requestId) {
          authStore.setTempData({
            login: values.login,
            verificationRequestId: requestId,
          });
          console.log('Saved login and requestId:', {
            login: values.login,
            requestId,
          });
          console.log('Current tempData:', authStore.tempData);
          onSuccess({ login: values.login, requestId });
        } else {
          setErrors({ login: 'Пользователь не найден' });
        }
      },
    });

    return (
      <Page className={s.passwordResetForm} smallPaddingBottom>
        <div className={s.content}>
          <h1 className={s.title}>Восстановление пароля</h1>

          <div className={s.inputGroup}>
            <span className={s.label}>Логин</span>
            <TextInput
              classNames={{
                input: `${s.input} ${errors.login ? s.error : ''}`,
              }}
              value={values.login}
              onChange={handleInputChange('login')}
              placeholder="Введите логин"
              error={errors.login}
              radius="xl"
              size="lg"
            />
          </div>
        </div>

        <div className={s.footer}>
          <Button
            className={s.submitButton}
            onClick={handleSubmit}
            loading={isSubmitting}
            fullWidth
            radius="xl"
            variant="filled"
            size="lg"
          >
            Выслать код
          </Button>
        </div>
      </Page>
    );
  },
);
