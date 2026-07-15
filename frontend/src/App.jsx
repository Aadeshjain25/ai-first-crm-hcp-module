import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/ui/layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import LogInteraction from "./pages/LogInteraction";
import History from "./pages/History";
import HCPs from "./pages/HCPs";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="log-interaction" element={<LogInteraction />} />
        <Route path="history" element={<History />} />
        <Route path="hcps" element={<HCPs />} />
        <Route
          path="*"
          element={
            <div className="flex h-[60vh] flex-col items-center justify-center text-center text-slate-500">
              <h1 className="text-3xl font-bold text-slate-800">
                Page not found
              </h1>
              <p className="mt-2">
                The page you're looking for doesn't exist.
              </p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;