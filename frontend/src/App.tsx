import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import EmailVerification from './pages/Verification/EmailVerification';
import PhoneVerification from './pages/Verification/PhoneVerification';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import PersonalInfo from './pages/Profile/PersonalInfo';
import Dashboard from './pages/Dashboard/Dashboard';
import './App.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/verify-email" 
            element={
              <ProtectedRoute>
                <EmailVerification />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/verify-phone" 
            element={
              <ProtectedRoute>
                <PhoneVerification />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/personal-info" 
            element={
              <ProtectedRoute>
                <PersonalInfo />
              </ProtectedRoute>
            } 
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
