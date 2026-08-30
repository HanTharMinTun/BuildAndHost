import { useEffect, useState, useMemo } from "react";
import Renderer from "../renderer/Renderer";
import type { ComponentNode } from "../renderer/types";
import { themeToCss } from "../theme/generatedTheme";

interface PublishedWebsite {
  id: string;
  website_json: ComponentNode;
  theme_json: any;
  subdomain: string;
  domain: string;
  version: number;
}

export default function PublishedSite() {
  const [website, setWebsite] = useState<ComponentNode | null>(null);
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert theme JSON to CSS using the same function as the editor
  const themeCss = useMemo(() => themeToCss(theme), [theme]);

  useEffect(() => {
    const fetchPublishedWebsite = async () => {
      try {
        setLoading(true);
        
        // Get the backend API URL from environment or default
        const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://onlinegif.shop";
        
        // Fetch website data by hostname (backend will extract subdomain)
        const response = await fetch(`${apiUrl}/api/public/sites/by-hostname`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Website not found. This site may not be published yet.");
          }
          throw new Error(`Failed to load website: ${response.statusText}`);
        }

        const data: PublishedWebsite = await response.json();
        
        // Validate that we have website JSON
        if (!data.website_json) {
          throw new Error("Invalid website data received");
        }

        setWebsite(data.website_json);
        setTheme(data.theme_json);
        setError(null);
      } catch (err) {
        console.error("Error loading published website:", err);
        setError(err instanceof Error ? err.message : "Failed to load website");
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedWebsite();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}>
        <div style={{
          textAlign: "center",
          color: "white",
        }}>
          <div style={{
            fontSize: "2rem",
            marginBottom: "1rem",
            animation: "pulse 2s infinite",
          }}>
            ⚡
          </div>
          <p style={{ fontSize: "1.25rem", fontWeight: 500 }}>
            Loading your website...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#f8fafc",
      }}>
        <div style={{
          maxWidth: "32rem",
          padding: "2rem",
          background: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "1rem",
          }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: "0.5rem",
          }}>
            Website Not Found
          </h1>
          <p style={{
            color: "#64748b",
            fontSize: "1rem",
            lineHeight: 1.6,
          }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!website) {
    return null;
  }

  // Render the website using the existing Renderer component
  // Apply theme CSS just like in the editor
  return (
    <div className="published-site ai-site">
      {themeCss && <style>{themeCss}</style>}
      <Renderer node={website} />
    </div>
  );
}
