import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// // Импортируем placeholder страницы
import DashboardPage from './pages/Dashboard/DashboardPage';
import StaffManagementPage from './pages/StaffManagement/StaffManagementPage';
import CollectionStagesPage from './pages/CollectionStages/CollectionStagesPage';
import CostsPage from './pages/Costs/CostsPage';
import FinancialModelingPage from './pages/FinancialModeling/FinancialModelingPage';
import Layout from './components/Layout/Layout'; // Раскомментируем импорт Layout

// // Основной компонент приложения с настройкой роутинга
function App() {
  return (
    <BrowserRouter>
      {/* // Оборачиваем все маршруты в Layout */}
      <Layout>
        <Routes>
          {/* // Маршрут по умолчанию - редирект на Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* // Маршруты для каждой основной страницы */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/stages" element={<CollectionStagesPage />} />
        <Route path="/costs" element={<CostsPage />} />
        <Route path="/financials" element={<FinancialModelingPage />} />

          {/* // Можно добавить маршрут для 404 страницы */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
