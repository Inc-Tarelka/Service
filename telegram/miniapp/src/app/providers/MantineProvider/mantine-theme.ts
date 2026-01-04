import { createTheme, MantineColorsTuple, MantineTheme } from '@mantine/core';
import { PasswordVisibilityToggle } from './PasswordVisibilityToggle';

// Кастомная палитра основного цвета (фиолетовый)
const primaryColor: MantineColorsTuple = [
  '#f0fdf4',
  '#dcfce7',
  '#bbf7d0',
  '#86efac',
  '#ABDB9F',
  '#22c55e',
  '#16a34a',
  '#15803d',
  '#166534',
  '#14532d',
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
  primaryColor: 'green',
  primaryShade: 4, // #abdb9f

  // Кастомные цвета
  colors: {
    green: primaryColor,
    red: [
      '#ffeecf', // 0
      '#ffeecf', // 1
      '#ff8686', // 2
      '#ff5d5d', // 3 (Основной Error)
      '#ff5d5d', // 4
      '#ff5d5d', // 5
      '#ff5d5d', // 6
      '#ff5d5d', // 7
      '#ff5d5d', // 8
      '#ff5d5d', // 9
    ],
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
      styles: (_theme: MantineTheme, props: any) => ({
        root: {
          fontWeight: 500,
          color: props.variant === 'filled' ? 'var(--bg-color)' : undefined,
        },
      }),
    },

    Card: {
      defaultProps: {
        radius: 'md',
        padding: 'md',
      },
      styles: {
        root: {
          backgroundColor: 'var(--primary-stroke)',
        },
      },
    },

    Input: {
      defaultProps: {
        radius: 'xl',
        size: 'sm',
      },
      styles: {
        input: {
          color: 'var(--text-color)',
          background: 'var(--tertiary-bg-color)',
          border: '2px solid var(--card-bg)',
        },
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
    Badge: {
      defaultProps: {
        radius: 'md',
      },
      styles: (_theme: MantineTheme, props: any) => ({
        root: {
          fontWeight: 500,
          color:
            props.variant === 'filled'
              ? '#000000'
              : 'var(--text-color-secondary)',
          backgroundColor:
            props.variant === 'outline' ? 'var(--primary-stroke)' : undefined,
          border:
            props.variant === 'outline'
              ? '1px solid var(--card-bg)'
              : undefined,
        },
      }),
    },
    Checkbox: {
      defaultProps: {
        radius: 'xs',
        color: 'green',
      },
      styles: (_theme: MantineTheme, _props: any) => ({
        input: {
          borderColor: 'var(--mantine-color-green-filled)',
          cursor: 'pointer',
        },
        icon: {
          color: 'var(--bg-color)',
        },
        label: {
          fontWeight: 500,
          fontSize: 'var(--font-h1)',
          lineHeight: 1.2,
          paddingLeft: 12,
        },
        description: {
          marginTop: 0,
          paddingLeft: 12,
        },
      }),
    },
    PasswordInput: {
      defaultProps: {
        visibilityToggleIcon: PasswordVisibilityToggle,
      },
      styles: {
        input: {
          color: 'var(--text-color)',
          background: 'var(--tertiary-bg-color)',
          border: '2px solid var(--card-bg)',
        },
      },
    },
  },

  // Другие настройки
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,
});
