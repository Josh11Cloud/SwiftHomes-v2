import Head from "next/head";
import Navbar from "../components/NavBar";
import "../styles/output.css";
import { AuthProvider } from "../context/AuthContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { PropertiesProvider } from "../context/PropertiesContext";
import Footer from "../components/Footer";
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <AuthProvider>
        <PropertiesProvider>
          <FavoritesProvider>
            <Head>
              <title>SwiftHomes</title>
              <link rel="icon" href="/assets/icons/SwiftHomes-logo-png.png" />
            </Head>
            <Toaster position="top-right" reverseOrder={false} />
            <Navbar />
            <Component {...pageProps} />
            <Footer />
          </FavoritesProvider>
        </PropertiesProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
