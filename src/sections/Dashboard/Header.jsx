import React from "react";
import Navbar from './components/NavBar';

const Header = () => {
    return (
        <header className="bg-slate-50 shadow-md px-4 py-3">
            <Navbar />
            <h2 className="text-lg font-semibold text-gray-800">Panel Principal</h2>
        </header>
    );
};

export default Header;