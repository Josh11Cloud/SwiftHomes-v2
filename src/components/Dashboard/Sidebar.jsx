import React from "react";

const Sidebar = () => {
    return(
        <aside className="w-64 bg-slate-50 shadow-ms h-full hidden md:block">
            <div className="p-6 font-bold text-xl text-[#0077B6]">SwiftHomes</div>
            <nav className="p-4">
                <ul className="space-y-4">
                    <li><a href="/" className="text-gray-700 hover:text-[#0077b6]">Resumen</a></li>
                    <li><a href="/" className="text-gray-700 hover:text-[#0077b6]">Inversion</a></li>
                    <li><a href="/" className="text-gray-700 hover:text-[#0077b6]">Favoritos</a></li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;