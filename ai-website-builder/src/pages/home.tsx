import { useState, useRef } from "react";

export default function Home() {
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
        { role: "assistant", text: "Hello! Describe the website you want — I can build a portfolio, business site, blog, or dashboard. Attach files if you have logos or images." },
    ]);
    const [input, setInput] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [type, setType] = useState("portfolio");
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    function pushMessage(role: "user" | "assistant", text: string) {
        setMessages((m) => [...m, { role, text }]);
        setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" }), 50);
    }

    async function handleSend() {
        const text = input.trim();
        if (!text) return;
        pushMessage("user", text);
        setInput("");
        setLoading(true);

        // Prepare the prompt and files for the backend
        try {
            const form = new FormData();
            form.append("prompt", text);
            form.append("type", type);
            if (files) {
                for (let i = 0; i < files.length; i++) form.append("files", files.item(i) as File);
            }

            const resp = await fetch("http://127.0.0.1:8000/post_prompt", { method: "POST", body: form });
            const result = await resp.json();
            if (!resp.ok) throw new Error(result.detail || "Generation failed");

            pushMessage("assistant", "Got it — your website is ready. Opening the editor...");
            // store generated website/theme and navigate to editor
            localStorage.setItem("website", JSON.stringify(result.website));
            localStorage.setItem("websiteTheme", JSON.stringify(result.theme));
            if (result.uploads) localStorage.setItem("uploadedFiles", JSON.stringify(result.uploads));
            window.location.href = "/editor";
        } catch (err: any) {
            pushMessage("assistant", `Sorry, failed to generate: ${err?.message ?? String(err)}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="chat-root min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="chat-window w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="chat-header bg-gradient-to-r from-sky-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">AI</div>
                        <div>
                            <div className="font-semibold">BuildAndHost Assistant</div>
                            <div className="text-sm opacity-80">Describe your website and I’ll generate it for you</div>
                        </div>
                    </div>
                    <div>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded px-2 py-1">
                            <option value="portfolio">Portfolio</option>
                            <option value="business">Business</option>
                            <option value="blog">Blog</option>
                            <option value="dashboard">Dashboard</option>
                        </select>
                    </div>
                </div>

                <div ref={containerRef} className="chat-body p-6 h-[60vh] overflow-auto bg-gradient-to-b from-white to-slate-50">
                    {messages.map((m, i) => (
                        <div key={i} className={`mb-4 flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[80%] px-4 py-3 rounded-lg ${m.role === "assistant" ? "bg-slate-100 text-slate-900" : "bg-sky-600 text-white"}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chat-input p-4 border-t bg-white flex items-center gap-3">
                    <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Tell me what to build (e.g. a photography portfolio with a hero, gallery, and contact form)"
                        className="flex-1 px-4 py-3 rounded-lg border"
                    />
                    <button onClick={handleSend} disabled={loading} className="bg-sky-600 text-white px-4 py-2 rounded-lg">
                        {loading ? "Generating..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}
