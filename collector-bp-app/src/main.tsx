import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles'; // Импортируем ThemeProvider
import CssBaseline from '@mui/material/CssBaseline'; // Импортируем CssBaseline
import { store, persistor } from './store/store'; // Импортируем store и persistor
import theme from './theme'; // Импортируем нашу тему
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* // Оборачиваем приложение в ThemeProvider, передавая ему тему */}
        <ThemeProvider theme={theme}>
          {/* // CssBaseline сбрасывает стили браузера по умолчанию */}
          <CssBaseline />
          <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
