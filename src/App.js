import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard'; // Ana sayfa komponenti
import CreateTicket from './pages/Tickets/CreateTicket';
import './App.css';

// Giriş yapmış kullanıcıları auth sayfalarından koruma
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

// Giriş yapmamış kullanıcıları koruma
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password']
    .includes(location.pathname);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app">
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      {user && !isAuthPage && (
        <Sidebar isOpen={isSidebarOpen} />
      )}
      <main className={`main-content ${user && !isAuthPage ? 'with-sidebar' : ''} ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />

          {/* Private Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/tickets/create" element={
            <PrivateRoute>
              <CreateTicket />
            </PrivateRoute>
          } />

          {/* Root yönlendirmesi */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
