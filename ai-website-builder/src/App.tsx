import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Chat from "./pages/chat";
import Editor from "./pages/editor";
import Websites from "./pages/websites";
import Deploy from "./pages/deploy";
import Login from "./pages/login";
import Register from "./pages/register";
import PublishedSite from "./pages/published";

/**
 * Detect if the current hostname is a published subdomain
 * Returns true for subdomains like hantharmintun.onlinegif.shop
 * Returns false for localhost, main domain, or development environments
 */
function isPublishedSiteSubdomain(): boolean {
  const hostname = window.location.hostname;
  
  // Development/localhost - always show the app
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return false;
  }
  
  // Main domain without subdomain - show the app
  if (hostname === "onlinegif.shop") {
    return false;
  }
  
  // Check if it's a subdomain of onlinegif.shop
  // Expected format: subdomain.onlinegif.shop
  const parts = hostname.split(".");
  
  // If it has 3+ parts and ends with onlinegif.shop, it's a subdomain
  if (parts.length >= 3 && hostname.endsWith(".onlinegif.shop")) {
    return true;
  }
  
  return false;
}

export default function App() {
  // If we're on a published subdomain, render the public website
  if (isPublishedSiteSubdomain()) {
    return <PublishedSite />;
  }

  // Otherwise, render the normal app with all routes
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/websites" element={<Websites />} />
      <Route path="/deploy" element={<Deploy />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
