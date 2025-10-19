import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { useAuthStore } from './store/auth';
import AdminDashboard from './pages/AdminDashboard';
import SecretaryDashboard from './pages/SecretaryDashboard';
import StudentAdd from './pages/StudentAdd';
import MarkAttendance from './pages/MarkAttendance';
import WeeklyAttendance from './pages/WeeklyAttendance';
import Students from './pages/Students';
import Reports from './pages/Reports';
import ExportData from './pages/ExportData';
import ManageLevels from './pages/ManageLevels';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationManager from './components/NotificationManager';

function Dashboard() {
  const role = useAuthStore((s) => s.role);
  
  // Redirect based on role
  if (role === 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  } else if (role === 'SECRETARY') {
    return <Navigate to="/secretary" replace />;
  }
  
  // Fallback for unknown roles
  return <div className="p-8">Logged in as {role}</div>;
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard/></RequireAuth>} />
          <Route path="/admin/students" element={<RequireAuth><Students/></RequireAuth>} />
          <Route path="/admin/reports" element={<RequireAuth><Reports/></RequireAuth>} />
          <Route path="/admin/export" element={<RequireAuth><ExportData/></RequireAuth>} />
          <Route path="/admin/levels" element={<RequireAuth><ManageLevels/></RequireAuth>} />
          <Route path="/secretary" element={<RequireAuth><SecretaryDashboard/></RequireAuth>} />
          <Route path="/secretary/students/new" element={<RequireAuth><StudentAdd/></RequireAuth>} />
          <Route path="/secretary/attendance" element={<RequireAuth><MarkAttendance/></RequireAuth>} />
          <Route path="/secretary/weekly-attendance" element={<RequireAuth><WeeklyAttendance/></RequireAuth>} />
        </Routes>
        <NotificationManager />
      </BrowserRouter>
    </NotificationProvider>
  )
}
