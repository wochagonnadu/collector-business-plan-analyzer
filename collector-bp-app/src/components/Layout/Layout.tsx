import React, { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Header from './Header'; // Import the Header component

// // Определяем тип для props компонента Layout
interface LayoutProps {
  children: ReactNode; // Дочерние элементы, которые будут отображаться внутри Layout
}

// // Базовый компонент Layout с AppBar и основной областью контента
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Use the Header component which includes both AppBar and metrics bar */}
      <Header />

      {/* // Основная область для контента страниц */}
      {/* // Убираем maxWidth для использования большей ширины экрана */}
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {children} {/* // Отображаем дочерний компонент (текущую страницу) */}
      </Container>

      {/* // Подвал (Footer) - можно добавить позже */}
      {/* <Box component="footer" sx={{ p: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' Collector BP Analyzer'}
          </Typography>
        </Container>
      </Box> */}
    </Box>
  );
};

export default Layout;
