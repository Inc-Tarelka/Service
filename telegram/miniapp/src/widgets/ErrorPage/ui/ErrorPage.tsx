import { Button, Flex, Text } from '@mantine/core'
import { RoutePath } from 'shared/config/routeConfig/routeConfig'
import classNames from 'shared/library/ClassNames/classNames'
import s from './ErrorPage.module.scss'

interface ErrorPageProps {
  className?: string
}

export const ErrorPage = ({ className }: ErrorPageProps) => {
  const reloadPage = () => {
    location.reload()
  }

  const goToMainPage = () => {
    window.location.href = RoutePath.main
  }

  return (
    <div className={classNames(s.PageError, {}, [className])}>
      <div className={s.content}>
        <Text className={s.title}>Ошибка</Text>
        <Text className={s.text}>Произошла непредвиденная ошибка</Text>
        <Flex gap="1rem" justify="center" align="center">
          <Button
            className={s.button}
            variant="default"
            onClick={reloadPage}
            size="compact-md"
          >
            Обновить
          </Button>
          <Button variant="default" onClick={goToMainPage} size="compact-md">
            На главную
          </Button>
        </Flex>
      </div>
    </div>
  )
}

export default ErrorPage
