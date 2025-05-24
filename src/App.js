import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import TicketList from './pages/Tickets/TicketList';
import TicketDetail from './pages/Tickets/TicketDetail';
import CreateTicket from './pages/Tickets/CreateTicket';
import EditTicket from './pages/Tickets/EditTicket';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
// Admin Sayfaları
import DepartmentList from './pages/Admin/Departments/DepartmentList';
import UserList from './pages/Admin/Users/UserList';
import EquipmentList from './pages/Admin/Equipment/EquipmentList';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

              {/* Private Routes */}
              <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/tickets/create" element={<CreateTicket />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/tickets/:id/edit" element={<EditTicket />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Admin Routes */}
                <Route path="/admin/departments" element={<AdminRoute><DepartmentList /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><UserList /></AdminRoute>} />
                <Route path="/admin/equipment" element={<AdminRoute><EquipmentList /></AdminRoute>} />
              </Route>

              {/* Root Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
