import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Rooms from '../pages/Rooms';
import Treatments from '../pages/Treatments';
import Doctors from '../pages/Doctors';
import Patients from '../pages/Patients';
import Profile from '../pages/Profile';
import Appointments from '../pages/Appointments';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      
      {/* Private routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/rooms"
          element={
            <PrivateRoute>
              <Rooms />
            </PrivateRoute>
          }
        />

        <Route
          path="/treatments"
          element={
            <PrivateRoute>
              <Treatments />
            </PrivateRoute>
          }
        />

        <Route
          path="/doctors"
          element={
            <PrivateRoute>
              <Doctors />
            </PrivateRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <Patients />
            </PrivateRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <Appointments />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
