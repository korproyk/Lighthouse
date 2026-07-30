import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import 'leaflet/dist/leaflet.css';
import './index.css';

/**
 * DEV-ONLY: `/weekly-insights-preview`
 * REMOVE BEFORE PRODUCTION:
 * 1. Delete this Route branch
 * 2. Delete `src/dev/WeeklyInsightsPreviewPage.tsx`
 * 3. Delete `src/dev/demoWeeklyInsights.ts` if unused
 */
import WeeklyInsightsPreviewPage from './dev/WeeklyInsightsPreviewPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {import.meta.env.DEV ? (
          <Route path="/weekly-insights-preview" element={<WeeklyInsightsPreviewPage />} />
        ) : null}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
