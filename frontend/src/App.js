import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import NoiseStatus from "./components/NoiseStatus";
import NoiseChart from "./components/NoiseChart";

import EmailLogs from "./pages/EmailLogs";
import Analysis from './pages/Analysis';
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<div>Dashboard Page</div>} />
          <Route path="realtime" element={<div><NoiseStatus />
                                       <NoiseChart /></div>} />
          {/* <Route path="analysis" element={<div>  <NoiseAnalysisPage /></div>} /> */}
          <Route path="analysis" element={<div><Analysis /></div>} />
          <Route path="alerts" element={<EmailLogs />} />
          
          <Route path="profile" element={<div>Profile Settings Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
