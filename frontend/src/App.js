import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import NoiseStatus from "./components/NoiseStatus";
import NoiseChart from "./components/NoiseChart";

import EmailLogs from "./pages/EmailLogs";
import Analysis from './pages/Analysis';

import Signup from './pages/Signup';
import Login from './pages/Login';

import AuthProvider from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
 
export default function App() {
  return (
    <AuthProvider> {/* Wrap with AuthProvider */}
    <Router>
      <Routes>

      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

        <Route path="/"  element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
          
          <Route path="dashboard" element={<div>Dashboard Page</div>} />
          <Route path="realtime" element={<div><NoiseStatus />
                                       <NoiseChart /></div>} />
          
          <Route path="analysis" element={<div><Analysis /></div>} />
          <Route path="alerts" element={<EmailLogs />} />
          
          <Route path="profile" element={<div>Profile Settings Page</div>} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}
