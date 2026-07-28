import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DraftsPage } from './pages/DraftsPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { InboxPage } from './pages/InboxPage';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AppLayout>
      {loading ? (
        <div className="h-full p-5">
          <div className="h-full animate-pulse rounded-lg border border-slate-200 bg-white">
            <div className="h-16 border-b border-slate-200 bg-slate-100" />
            <div className="grid h-[calc(100%-4rem)] grid-cols-[360px_1fr]">
              <div className="border-r border-slate-200 p-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="mb-3 h-20 rounded bg-slate-100" />
                ))}
              </div>
              <div className="space-y-4 p-5">
                <div className="h-24 rounded bg-slate-100" />
                <div className="h-40 rounded bg-slate-100" />
                <div className="h-56 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/inbox" replace />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:billId" element={<InboxPage />} />
          <Route path="/exceptions" element={<ExceptionsPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      )}
    </AppLayout>
  );
}
