import type { MantineTheme } from '@mantine/core';
import { createContext } from 'react';

export enum Theme {
  LIGHT = 'app_light_theme',
  DARK = 'app_dark_theme',
}

export interface ThemeContextProps {
  theme?: Theme;
  setTheme?: (theme: Theme) => void;
  mantineTheme?: MantineTheme;
}

export const ThemeContext = createContext<ThemeContextProps>({});
