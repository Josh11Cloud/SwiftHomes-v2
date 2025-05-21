import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Home from './sections/home/home';
import { FavoritesProvider } from './context/FavoritesContext';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import FavoritesView from './components/FavoritesView';
import './index.css';
import ContactSection from './sections/contact/ContactUs.jsx';
import BuySection from './sections/buy/Buy.jsx';
import RentSection from './sections/Rent/Rent.jsx';
import InvestSection from './sections/invest/invest.jsx';
import DashboardSection from './sections/Dashboard/Dashboard.jsx';
import Login from './components/Login.jsx';
import CreateUser from './components/CreateUser.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import MyAccount from './components/MyAccount.jsx';
import PropertyForm from './components/PropertyForm.jsx';
import MyProperties from './components/MyProperties.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminDashboard from './sections/Admin/AdminDashboard.jsx';

const Layout = () => {
  return (
    <FavoritesProvider>
      <div>
        <Navbar />
        <main className="min-h-screen">
          <Outlet />
        </main>
        <Footer />
      </div>
    </FavoritesProvider>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'favoritos',
        element: <FavoritesView />,
      },
      {
        path: 'contacto',
        element: <ContactSection />
      },
      {
        path: 'comprar',
        element: <BuySection />
      },
      {
        path: 'rentar',
        element: <RentSection />
      },
      {
        path: 'inversiones',
        element: <InvestSection />
      },
      {
        path: 'dashboard',
        element: <DashboardSection />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'registro',
        element: <CreateUser />
      },
      {
        path: 'micuenta',
        element:(   
        <PrivateRoute>
            <MyAccount />
          </PrivateRoute>
        )
      },
      {
        path: 'agregarpropiedad',
        element: <PropertyForm />
      },
      {
        path: 'mis-propiedades',
        element: (
          <PrivateRoute>
            <MyProperties />
          </PrivateRoute>
        )
      },
      {
        path: "/admin",
        element: (
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
        )
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} fallbackElement={<div>Cargando...</div>} />
    </AuthProvider>
  </React.StrictMode>
);