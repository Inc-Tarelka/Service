import { MantineProvider, useMantineTheme } from '@mantine/core';
import { ReactNode, useMemo, useState } from 'react';
import { mantineTheme } from '../../MantineProvider/mantine-theme';
import { Theme, ThemeContext } from '../lib/ThemeContext';

// Импорт стилей Mantine
import '@mantine/core/styles.css';

interface ThemeProviderProps {
  children?: ReactNode;
}

const ThemeContextWrapper = ({ children }: { children: ReactNode }) => {
  const [theme] = useState<Theme>(Theme.DARK);
  const currentMantineTheme = useMantineTheme();

  const contextValue = useMemo(
    () => ({
      theme,
      mantineTheme: currentMantineTheme,
    }),
    [theme, currentMantineTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
      <ThemeContextWrapper>{children}</ThemeContextWrapper>
    </MantineProvider>
  );
};

export default ThemeProvider;
