import { Button, Title } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { RoutePath } from 'shared/config/routeConfig/routeConfig'
import s from './NotFoundPage.module.scss'

export const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <div className={s.NotFoundPage}>
      <div className={s.content}>
        <Title className={s.title} order={1}>
          404
        </Title>
        <Title c="#fff" order={3}>
          Страница не найдена
        </Title>
        <Button
          className={s.button}
          size="lg"
          variant="filled"
          onClick={() => navigate(RoutePath.main)}
        >
          На главную
        </Button>
      </div>
    </div>
  )
}
