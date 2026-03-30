import { useState } from "react";
import "./chat-container.css";

export default function ChatBox({ selectedCategory, month, year }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", text: input };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.text,
                    history: messages.slice(-5),
                    selectedCategory,
                    month,
                    year
                })
            });

            const data = await res.json();

            const botMsg = { role: "bot", text: data.response };

            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: "bot", text: "Error fetching response" }
            ]);
        }

        setLoading(false);
    };

    return (
        <>
            {/* Floating button */}
            {!open && (
                <button className="chat-toggle" onClick={() => setOpen(true)}>
                    💬
                </button>
            )}

            {/* Chat window */}
            {open && (
                <div className="chat-container">

                    <div className="chat-header">
                        <span>Fin Assistant</span>
                        <button onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div className="chat-body">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={msg.role === "user" ? "chat-user" : "chat-bot"}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {loading && <div className="chat-loading">Analyzing...</div>}
                    </div>

                    <div className="chat-input">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask about your finances..."
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>

                </div>
            )}
        </>
    );
}