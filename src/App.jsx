// src/App.jsx

import React from "react";
import AppNavbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Aquí irán las páginas que luego se conectarán al backend */}
        <h1 className="text-3xl font-bold text-center mt-20">
          Bienvenido a SafeHaven - Frontend en construcción
        </h1>
        <p className="text-center mt-4 text-gray-600">
          Aquí más adelante se mostrarán las páginas y datos conectados al backend.
        </p>
      </main>

      <footer className="bg-gray-100 text-center py-4 mt-auto">
        <p className="text-sm text-gray-500">© 2025 SafeHaven. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
