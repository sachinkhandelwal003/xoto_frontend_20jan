import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import MetaPixel from "./MetaPixel";
import "./index.css";
// ✅ Then Tailwind + custom styles
// main.jsx or index.js
// import "../i18n";

import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./manageApi/context/AuthContext";
import { store } from "./manageApi/store/store";
import PersistLogin from "./manageApi/context/PersistLogin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import i18n from "./components/herosection/i18n";

// import "./i18n";
import "./i18n";
// import { CartProvider } from './manageApi/context/CartContext';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed queries twice
      staleTime: 5 * 60 * 1000, // Cache queries for 5 minutes
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <PersistLogin>
              <MetaPixel/>
              <App />
              <ToastContainer position="top-right" autoClose={3000} />
            </PersistLogin>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
