import { useState, useEffect } from "react";
import socket from "../socket";

function ChatPanel({ roomId, userId, username }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    socket.on("chat:message", (msg) => setMessages((prev) => [...prev, msg]));
    
    socket.on("guess:correct", ({ userId, username, points, word }) => {
      setMessages((prev) => [...prev, { 
        text: `🎉 ${username} guessed "${word}" correctly! +${points} pts`,
        type: 'system',
        timestamp: new Date()
      }]);
    });

    socket.on("round:end", ({ word }) => {
      setMessages((prev) => [...prev, {
        text: `⏰ Time's up! The word was "${word}"`,
        type: 'system',
        timestamp: new Date()
      }]);
    });

    socket.on("player:joined", ({ username }) => {
      setMessages((prev) => [...prev, {
        text: `👋 ${username} joined the room`,
        type: 'system',
        timestamp: new Date()
      }]);
    });

    socket.on("player:left", ({ username }) => {
      setMessages((prev) => [...prev, {
        text: `👋 ${username} left the room`,
        type: 'system',
        timestamp: new Date()
      }]);
    });
    
    return () => {
      socket.off("chat:message");
      socket.off("guess:correct");
      socket.off("round:end");
      socket.off("player:joined");
      socket.off("player:left");
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;
    
    // Send as chat message with username
    socket.emit("chat:message", { 
      roomId, 
      text: text.trim(), 
      userId, 
      username 
    });
    
    // Also try as guess
    socket.emit("guess:word", { 
      roomId, 
      guess: text.trim(), 
      userId,
      username 
    });
    
    setText("");
  };

  return (
    <div className="sidebar-card" style={{ marginTop: '1rem' }}>
      <h3 className="card-title">💬 Chat & Guesses</h3>
      <div style={{
        height: "200px", 
        overflowY: "auto",
        border: "1px solid var(--gray-200)",
        borderRadius: "12px",
        padding: "0.75rem",
        backgroundColor: "var(--gray-50)",
        marginBottom: "1rem"
      }}>
        {messages.map((m, i) => (
          <div 
            key={i} 
            style={{
              padding: "0.75rem",
              marginBottom: "0.5rem",
              backgroundColor: m.type === 'system' ? 'var(--primary-50)' : 
                             m.userId === userId ? 'var(--blue-50)' : "white",
              borderRadius: "8px",
              fontSize: "0.875rem",
              borderLeft: m.type === 'system' ? '3px solid var(--primary-500)' : 
                         m.userId === userId ? '3px solid var(--blue-400)' : '3px solid var(--gray-300)'
            }}
          >
            {m.type === 'system' ? (
              <span style={{ fontStyle: 'italic', color: 'var(--primary-700)' }}>
                {m.text}
              </span>
            ) : (
              <div>
                <div style={{ 
                  fontWeight: '600', 
                  color: m.userId === userId ? 'var(--blue-600)' : 'var(--gray-700)',
                  marginBottom: '0.25rem',
                  fontSize: '0.75rem'
                }}>
                  {m.userId === userId ? 'You' : (m.username || 'Anonymous')}
                </div>
                <div style={{ color: 'var(--gray-800)' }}>
                  {m.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input 
          className="form-input"
          value={text} 
          onChange={e => setText(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your guess or message..."
          style={{
            flex: 1,
            padding: "0.75rem",
            fontSize: "0.875rem",
            margin: 0
          }}
        />
        <button 
          className="tool-button"
          onClick={sendMessage}
          style={{
            padding: "0.75rem 1rem",
            background: "linear-gradient(135deg, var(--primary-500) 0%, var(--purple-500) 100%)",
            color: "white",
            borderColor: "transparent"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;
