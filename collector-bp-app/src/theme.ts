import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// // Создаем базовую тему Material-UI
// // Здесь можно настроить палитру, типографику, компоненты и т.д.
// // https://mui.com/material-ui/customization/theming/
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6', // Пример основного цвета
    },
    secondary: {
      main: '#19857b', // Пример вторичного цвета
    },
    error: {
      main: red.A400, // Цвет для ошибок
    },
    // // Можно настроить режим (светлый/темный)
    // mode: 'light',
  },
  typography: {
    // // Настройки типографики (шрифты, размеры)
    // fontFamily: 'Roboto, Arial, sans-serif',
  },
  // // Можно переопределить стили для конкретных компонентов
  // components: {
  //   MuiButton: {
  //     styleOverrides: {
  //       root: {
  //         textTransform: 'none', // Пример: убираем КАПС у кнопок
  //       },
  //     },
  //   },
  // },
});

export default theme;
