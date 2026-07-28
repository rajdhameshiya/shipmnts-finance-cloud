import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DraftsPage } from './pages/DraftsPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { InboxPage } from './pages/InboxPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/inbox" replace />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/inbox/:billId" element={<InboxPage />} />
        <Route path="/exceptions" element={<ExceptionsPage />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </AppLayout>
  );
}
