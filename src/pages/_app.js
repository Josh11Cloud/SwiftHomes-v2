import Head from 'next/head';
import Navbar from '../components/NavBar'; 
import '../styles/output.css';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <>
    <AuthProvider>
      <Head>
        <title>SwiftHomes</title>
        <link rel="icon" href="../assets/icons/SwiftHomes-logo-png.png" />
      </Head>
      <Navbar /> {}
      <Component {...pageProps} />
    </AuthProvider>
    </>
  );
}

export default MyApp;