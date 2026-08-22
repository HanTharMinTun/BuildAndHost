// import { useState, useRef } from "react";

// export default function Home() {
//     const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
//         { role: "assistant", text: "Hello! Describe the website you want — I can build a portfolio, business site, blog, or dashboard. Attach files if you have logos or images." },
//     ]);
//     const [input, setInput] = useState("");
//     const [files, setFiles] = useState<FileList | null>(null);
//     const [type, setType] = useState("portfolio");
//     const [loading, setLoading] = useState(false);
//     const containerRef = useRef<HTMLDivElement | null>(null);

//     function pushMessage(role: "user" | "assistant", text: string) {
//         setMessages((m) => [...m, { role, text }]);
//         setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" }), 50);
//     }

//     async function handleSend() {
//         const text = input.trim();
//         if (!text) return;
//         pushMessage("user", text);
//         setInput("");
//         setLoading(true);

//         // Prepare the prompt and files for the backend
//         try {
//             const form = new FormData();
//             form.append("prompt", text);
//             form.append("type", type);
//             if (files) {
//                 for (let i = 0; i < files.length; i++) form.append("files", files.item(i) as File);
//             }

//             const resp = await fetch("http://127.0.0.1:8000/post_prompt", { method: "POST", body: form });
//             const result = await resp.json();
//             if (!resp.ok) throw new Error(result.detail || "Generation failed");

//             pushMessage("assistant", "Got it — your website is ready. Opening the editor...");
//             // store generated website/theme and navigate to editor
//             localStorage.setItem("website", JSON.stringify(result.website));
//             localStorage.setItem("websiteTheme", JSON.stringify(result.theme));
//             if (result.uploads) localStorage.setItem("uploadedFiles", JSON.stringify(result.uploads));
//             window.location.href = "/editor";
//         } catch (err: any) {
//             pushMessage("assistant", `Sorry, failed to generate: ${err?.message ?? String(err)}`);
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <div className="chat-root min-h-screen flex items-center justify-center bg-slate-50 p-6">
//             <div className="chat-window w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
//                 <div className="chat-header bg-gradient-to-r from-sky-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">AI</div>
//                         <div>
//                             <div className="font-semibold">BuildAndHost Assistant</div>
//                             <div className="text-sm opacity-80">Describe your website and I’ll generate it for you</div>
//                         </div>
//                     </div>
//                     <div>
//                         <select value={type} onChange={(e) => setType(e.target.value)} className="rounded px-2 py-1">
//                             <option value="portfolio">Portfolio</option>
//                             <option value="business">Business</option>
//                             <option value="blog">Blog</option>
//                             <option value="dashboard">Dashboard</option>
//                         </select>
//                     </div>
//                 </div>

//                 <div ref={containerRef} className="chat-body p-6 h-[60vh] overflow-auto bg-gradient-to-b from-white to-slate-50">
//                     {messages.map((m, i) => (
//                         <div key={i} className={`mb-4 flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
//                             <div className={`max-w-[80%] px-4 py-3 rounded-lg ${m.role === "assistant" ? "bg-slate-100 text-slate-900" : "bg-sky-600 text-white"}`}>
//                                 {m.text}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="chat-input p-4 border-t bg-white flex items-center gap-3">
//                     <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
//                     <input
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                         onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
//                         placeholder="Tell me what to build (e.g. a photography portfolio with a hero, gallery, and contact form)"
//                         className="flex-1 px-4 py-3 rounded-lg border"
//                     />
//                     <button onClick={handleSend} disabled={loading} className="bg-sky-600 text-white px-4 py-2 rounded-lg">
//                         {loading ? "Generating..." : "Send"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

import { useState, useRef, useEffect } from "react";

export default function Home() {
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
        { role: "assistant", text: "Hello! Describe the website you want — I can build a portfolio, business site, blog, or dashboard. Attach files if you have logos or images." },
    ]);
    const [input, setInput] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [type, setType] = useState("portfolio");
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        setIsTyping(true);

        // Prepare the prompt and files for the backend
        try {
            const form = new FormData();
            form.append("prompt", text);
            form.append("type", type);
            if (files) {
                for (let i = 0; i < files.length; i++) form.append("files", files.item(i) as File);
            }

            const resp = await fetch("/api/post_prompt", { method: "POST", body: form });
            const result = await resp.json();
            if (!resp.ok) throw new Error(result.detail || "Generation failed");

            setIsTyping(false);
            pushMessage("assistant", "Got it — your website is ready. Opening the editor...");
            // store generated website/theme and navigate to editor
            localStorage.setItem("website", JSON.stringify(result.website));
            localStorage.setItem("websiteTheme", JSON.stringify(result.theme));
            if (result.uploads) localStorage.setItem("uploadedFiles", JSON.stringify(result.uploads));
            window.location.href = "/editor";
        } catch (err: any) {
            setIsTyping(false);
            pushMessage("assistant", `Sorry, failed to generate: ${err?.message ?? String(err)}`);
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files).map(f => f.name));
        }
    };

    return (
        <div className="chat-root min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="chat-window w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative border border-white/20">
                {/* Header */}
                <div className="chat-header bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
                    <div className="flex items-center justify-between relative">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl border border-white/30 shadow-lg">
                                    AI
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div>
                                <div className="font-bold text-lg">BuildAndHost Assistant</div>
                                <div className="text-sm opacity-90 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Online • Ready to build
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value)} 
                                className="rounded-xl px-4 py-2 bg-white/20 backdrop-blur border border-white/30 text-white font-medium hover:bg-white/30 transition-all cursor-pointer appearance-none pr-10"
                            >
                                <option value="portfolio" className="text-gray-900">🎨 Portfolio</option>
                                <option value="business" className="text-gray-900">💼 Business</option>
                                <option value="blog" className="text-gray-900">📝 Blog</option>
                                <option value="dashboard" className="text-gray-900">📊 Dashboard</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Chat Body */}
                <div ref={containerRef} className="chat-body p-6 h-[60vh] overflow-auto bg-gradient-to-b from-gray-50 to-white">
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"} animate-slide-in`}>
                                {m.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shadow-md">
                                        AI
                                    </div>
                                )}
                                <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl shadow-md transition-all hover:shadow-lg ${
                                    m.role === "assistant" 
                                        ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm" 
                                        : "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm"
                                }`}>
                                    <p className="leading-relaxed">{m.text}</p>
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shadow-md">
                                    AI
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-md">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* File Preview */}
                {selectedFiles.length > 0 && (
                    <div className="px-6 py-2 bg-gray-50 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((fileName, index) => (
                                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                                    📎 {fileName}
                                    <button 
                                        onClick={() => {
                                            const newFiles = Array.from(files || []).filter((_, i) => i !== index);
                                            setFiles(newFiles.length > 0 ? newFiles as unknown as FileList : null);
                                            setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                                        }}
                                        className="ml-1 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="chat-input p-4 border-t bg-white">
                    <div className="flex items-center gap-3">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            multiple 
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                            title="Attach files"
                        >
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                        <div className="flex-1 relative">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                placeholder="Describe your dream website..."
                                className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white text-gray-800 placeholder-gray-400"
                            />
                        </div>
                        <button 
                            onClick={handleSend} 
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Send
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
}