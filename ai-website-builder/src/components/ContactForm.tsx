import { useState, useContext, FormEvent } from "react";
import { ProjectContext } from "../pages/published";

interface Props {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function ContactForm({ style, children }: Props) {
  const projectId = useContext(ProjectContext);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);

    // Validate inputs
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }
    if (!projectId) {
      setError("Unable to submit form. Project ID not found.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://webcreator.site";
      
      const response = await fetch(`${apiUrl}/api/contact/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to send message");
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        // Reset form
        setName("");
        setEmail("");
        setMessage("");
        
        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "500px",
        margin: "0 auto",
        padding: "2rem",
        ...style,
      }}
    >
      {children}
      
      {success && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#10b981",
            color: "white",
            borderRadius: "0.5rem",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          ✓ Message sent successfully! We'll get back to you soon.
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#ef4444",
            color: "white",
            borderRadius: "0.5rem",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        required
        style={{
          padding: "0.75rem",
          border: "1px solid #ccc",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          backgroundColor: loading ? "#f3f4f6" : "white",
        }}
      />

      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
        style={{
          padding: "0.75rem",
          border: "1px solid #ccc",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          backgroundColor: loading ? "#f3f4f6" : "white",
        }}
      />

      <textarea
        placeholder="Your Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
        required
        rows={5}
        style={{
          padding: "0.75rem",
          border: "1px solid #ccc",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          resize: "vertical",
          fontFamily: "inherit",
          backgroundColor: loading ? "#f3f4f6" : "white",
        }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: loading ? "#9ca3af" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = "#2563eb";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = "#3b82f6";
          }
        }}
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
