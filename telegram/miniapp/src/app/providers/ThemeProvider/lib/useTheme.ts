import { useContext } from 'react'
import { Theme, ThemeContext } from './ThemeContext'

interface UseThemeResult {
  theme: Theme
}

export function useTheme(): UseThemeResult {
  const { theme } = useContext(ThemeContext)

  return {
    theme: theme || Theme.DARK,
  }
}
