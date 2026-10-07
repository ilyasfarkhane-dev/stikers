import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { CartProvider } from "./shop/CartContext.jsx";
import { SiteDataProvider } from "./shop/SiteData.jsx";
import "./styles.css";
import "./shop.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SiteDataProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </SiteDataProvider>
  </React.StrictMode>,
);
