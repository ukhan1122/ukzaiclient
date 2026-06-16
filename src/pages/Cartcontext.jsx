import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

useEffect(() => {
  const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("CartContext - loaded from localStorage:", storedCart); //
  setCartItems(storedCart);
  setCartCount(storedCart.reduce((acc, item) => acc + item.quantity, 0));
}, []);

  const addToCart = (item) => {
    const updatedCart = [...cartItems];
    const existingIndex = updatedCart.findIndex(
      (cartItem) => cartItem._id === item._id // Use _id instead of cartItemId
    );

    if (existingIndex >= 0) {
      updatedCart[existingIndex].quantity += item.quantity || 1;
    } else {
      updatedCart.push({ ...item, quantity: item.quantity || 1 });
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));
  };

   const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item._id !== id);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    setCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));
  };
  return (
   <CartContext.Provider value={{
      cartItems,
      setCartItems,    // now exposed
      cartCount,
      setCartCount,
      addToCart,
      removeFromCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
