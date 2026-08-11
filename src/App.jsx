import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PUCList from './pages/PUCList';
import InventoryList from './pages/InventoryList';
import FarmLog from './pages/FarmLog';
import TraceabilityPage from './pages/TraceabilityPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user } = useAppContext();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/trace/:hash" element={<TraceabilityPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        
        {/* Admin only routes */}
        <Route path="puc" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PUCList />
          </ProtectedRoute>
        } />
        <Route path="inventory" element={
          <ProtectedRoute allowedRoles={['admin', 'farmer']}>
            <InventoryList />
          </ProtectedRoute>
        } />
        
        {/* Farm Log - Both admin and farmer */}
        <Route path="farmlog" element={
          <ProtectedRoute allowedRoles={['admin', 'farmer']}>
            <FarmLog />
          </ProtectedRoute>
        } />

        {/* QR Generator - Admin only */}
        <Route path="qr-generate" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TraceabilityPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
