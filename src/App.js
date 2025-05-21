import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import Buy from './sections/buy/Buy';
import Contact from './sections/contact/ContactUs';
import Home from './sections/home/home';
import Dashboard from './components/Dashboard/Dashboard';
import properties from './data/properties.json';
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <Router>
      <Navbar />
      <main className="min-h-screen">
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comprar" element={<Buy />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard properties={properties} />} /> 
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
export default App;