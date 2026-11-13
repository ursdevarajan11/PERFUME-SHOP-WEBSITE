import React, { createContext, useEffect, useState } from "react";
import all_product from "../Components/Assets/all_product";
import { getApiUrl } from "../config";

export const ShopContext = createContext(null);
const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [products, setProducts] = useState(all_product);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch(getApiUrl("/allproducts"), { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error(`Product request failed (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProducts(data);
      })
      .catch((error) => console.error("Could not load products:", error));

    fetch(getApiUrl("/getcart"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (response) => {
        if (response.status === 401) return null;
        if (!response.ok) throw new Error(`Cart request failed (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        if (data) {
          setIsAuthenticated(true);
          setCartItems({ ...getDefaultCart(), ...data });
        }
      })
      .catch((error) => console.error("Could not load cart:", error));
  }, []);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    if (isAuthenticated) {
      fetch(getApiUrl("/addtocart"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Add-to-cart request failed (${response.status}).`);
        })
        .catch((error) => console.error("Could not update cart:", error));
    }
  };
  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: Math.max(0, prev[itemId] - 1) }));
    if (isAuthenticated) {
      fetch(getApiUrl("/removefromcart"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Remove-from-cart request failed (${response.status}).`);
        })
        .catch((error) => console.error("Could not update cart:", error));
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = products.find(
          (product) => product.id === Number(item),
        );
        if (itemInfo) totalAmount += itemInfo.new_price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  const contextValue = {
    getTotalCartItems,
    getTotalCartAmount,
    all_product: products,
    cartItems,
    addToCart,
    removeFromCart,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
