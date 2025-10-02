import { useState, useEffect } from "react";
import socket from "../socket";
import { getRandomWords } from "../utils/words";

function WordPickModal({ roomId, drawer, onPick }) {
  const [words, setWords] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show word selection when it becomes this player's turn
    if (drawer === socket.id && drawer) {
      const wordChoices = getRandomWords(3, 'medium');
      setWords(wordChoices);
      setShowModal(true);
      console.log('It\'s your turn to draw! Choose a word:', wordChoices);
    } else {
      setShowModal(false);
    }

    socket.on("word:choices", ({ words }) => {
      setWords(words);
      setShowModal(true);
    });

    socket.on("round:start", () => {
      // Hide modal when round starts (word has been chosen)
      if (drawer !== socket.id) {
        setShowModal(false);
      }
    });
    
    return () => {
      socket.off("word:choices");
      socket.off("round:start");
    };
  }, [drawer]);

  const pickWord = (word) => {
    socket.emit("word:pick", { roomId, word });
    onPick(word);
    setShowModal(false);
  };

  if (!showModal || !words.length) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="sidebar-card" style={{ 
        minWidth: '400px',
        maxWidth: '500px',
        margin: '1rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
        border: '2px solid var(--primary-300)',
        boxShadow: '0 32px 64px rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--purple-500) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            🎨 Your Turn to Draw!
          </h2>
          <p style={{ 
            color: 'var(--gray-600)', 
            fontSize: '1rem',
            margin: 0
          }}>
            Choose a word from the options below
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {words.map((word, index) => (
            <button 
              key={word} 
              onClick={() => pickWord(word)}
              style={{
                padding: "1rem 1.5rem",
                background: `linear-gradient(135deg, var(--primary-500) 0%, var(--purple-500) 100%)`,
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "700",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                textTransform: 'capitalize',
                letterSpacing: '0.025em'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {word}
            </button>
          ))}
        </div>
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--gray-500)', 
          fontSize: '0.875rem',
          marginTop: '1rem',
          marginBottom: 0
        }}>
          Choose wisely! Others will try to guess your drawing.
        </p>
      </div>
    </div>
  );
}export default WordPickModal;
