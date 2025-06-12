import React from 'react';

const BookingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
    <div className="bg-white rounded-2xl shadow-lg flex w-full max-w-5xl overflow-hidden">
      {children}
    </div>
  </div>
);

export default BookingLayout; 