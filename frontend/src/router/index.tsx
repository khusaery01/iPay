import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import TopUp from '../pages/TopUp';
import Transfer from '../pages/Transfer';
import RequestPayment from '../pages/RequestPayment';
import Bills from '../pages/Bills';
import PayBill from '../pages/PayBill';
import PayDirect from '../pages/PayDirect';
import MyQr from '../pages/MyQr';
import ScanQr from '../pages/ScanQr';
import History from '../pages/History';
import Profile from '../pages/Profile';

// Pengaman Route Sederhana
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('ipay_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Redirect Route Utama
const RootRedirect: React.FC = () => {
  const token = localStorage.getItem('ipay_token');
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/topup',
    element: (
      <ProtectedRoute>
        <TopUp />
      </ProtectedRoute>
    ),
  },
  {
    path: '/transfer',
    element: (
      <ProtectedRoute>
        <Transfer />
      </ProtectedRoute>
    ),
  },
  {
    path: '/request-payment',
    element: (
      <ProtectedRoute>
        <RequestPayment />
      </ProtectedRoute>
    ),
  },
  {
    path: '/bills',
    element: (
      <ProtectedRoute>
        <Bills />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pay/:id',
    element: (
      <ProtectedRoute>
        <PayBill />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pay-direct',
    element: (
      <ProtectedRoute>
        <PayDirect />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-qr',
    element: (
      <ProtectedRoute>
        <MyQr />
      </ProtectedRoute>
    ),
  },
  {
    path: '/scan',
    element: (
      <ProtectedRoute>
        <ScanQr />
      </ProtectedRoute>
    ),
  },
  {
    path: '/history',
    element: (
      <ProtectedRoute>
        <History />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

