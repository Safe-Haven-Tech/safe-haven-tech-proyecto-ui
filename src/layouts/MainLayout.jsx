import React from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6" style={{ 
        textAlign: 'left',
        color: '#000000'
      }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
