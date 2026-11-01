import React, { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    movie: null, theatre: null, showtime: null, date: null,
    selectedSeats: [], couponCode: '', discountAmount: 0, paymentMethod: 'demo',
  });
  const [step, setStep] = useState(1);

  const updateBooking = useCallback((updates) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetBooking = useCallback(() => {
    setBookingData({ movie: null, theatre: null, showtime: null, date: null, selectedSeats: [], couponCode: '', discountAmount: 0, paymentMethod: 'demo' });
    setStep(1);
  }, []);

  const calculateTotal = () => {
    const subtotal = bookingData.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const convenienceFee = Math.round(subtotal * 0.02);
    const discount = bookingData.discountAmount || 0;
    const total = subtotal + convenienceFee - discount;
    return { subtotal, convenienceFee, discount, total };
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBooking, resetBooking, step, setStep, calculateTotal }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};

export default BookingContext;
