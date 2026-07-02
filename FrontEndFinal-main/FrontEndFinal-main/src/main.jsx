import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FinancialProvider } from './context/AuthContext.jsx'; // 👈 Jalamos FinancialProvider de tu archivo real
import './index.css'; 

import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/registro',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos con el nombre real de tu proveedor financiero */}
    <FinancialProvider>
      <RouterProvider router={router} />
    </FinancialProvider>
  </React.StrictMode>
);