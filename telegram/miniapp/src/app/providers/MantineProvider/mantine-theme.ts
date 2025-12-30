import { createTheme, MantineColorsTuple } from '@mantine/core';

// Кастомная палитра основного цвета (фиолетовый)
const primaryColor: MantineColorsTuple = [
  '#f5f0ff',
  '#e8dcff',
  '#d4c4ff',
  '#bb99ff',
  '#a77fff',
  '#8b5cf6',
  '#7c3aed',
  '#6d28d9',
  '#5b21b6',
  '#4c1d95',
];

// Глобальные стили для устранения синего выделения на Android
const globalStyles = `
  * {
    -webkit-tap-highlight-color: transparent !important;
    tap-highlight-color: transparent !important;
  }
`;

// Добавляем стили в head при загрузке
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = globalStyles;
  document.head.appendChild(styleElement);
}

export const mantineTheme = createTheme({
  // Основной цвет
  primaryColor: 'violet',
  primaryShade: 3, // #bb99ff

  // Кастомные цвета
  colors: {
    violet: primaryColor,
  },

  // Шрифты
  fontFamily: 'var(--font-family-main)',

  // Радиусы скругления
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  // Тени
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
    md: '0 4px 8px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.3)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.3)',
  },

  // Кастомизация компонентов
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },

    Card: {
      defaultProps: {
        radius: 'md',
        padding: 'md',
      },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-dark-7)',
        },
      },
    },

    Input: {
      defaultProps: {
        radius: 'md',
      },
    },

    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },

    Select: {
      defaultProps: {
        radius: 'md',
      },
    },

    Modal: {
      defaultProps: {
        radius: 'md',
        centered: true,
      },
    },

    Drawer: {
      defaultProps: {
        radius: 'md',
      },
    },

    Tooltip: {
      defaultProps: {
        radius: 'sm',
      },
    },

    Progress: {
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-dark-5)',
        },
      },
    },

    Slider: {
      styles: {
        track: {
          height: '8px',
        },
        thumb: {
          width: '24px',
          height: '24px',
        },
      },
    },

    Notification: {
      defaultProps: {
        radius: 'md',
      },
    },
  },

  // Другие настройки
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,
});
