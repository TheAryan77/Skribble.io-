import { useEffect, useState } from "react";
import socket from "../socket";

function PlayerList({ roomId, players: propPlayers = [], currentDrawerId }) {
  const [players, setPlayers] = useState(propPlayers);

  useEffect(() => {
    if (propPlayers.length > 0) {
      setPlayers(propPlayers);
    }
  }, [propPlayers]);

  useEffect(() => {
    socket.on("room:update", (room) => setPlayers(room.players || []));
    return () => socket.off("room:update");
  }, []);

  return (
    <div className="sidebar-card">
      <h3 className="card-title">Players ({players.length})</h3>
      <div>
        {players.length === 0 ? (
          <p style={{ color: 'var(--gray-500)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
            Waiting for players...
          </p>
        ) : (
          players.map((p, index) => (
            <div 
              key={p.id} 
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                backgroundColor: p.id === currentDrawerId ? 'linear-gradient(135deg, var(--primary-50) 0%, var(--purple-50) 100%)' : "var(--gray-50)",
                borderRadius: "12px",
                border: p.id === currentDrawerId ? "2px solid var(--primary-400)" : "1px solid var(--gray-200)",
                fontSize: "0.875rem",
                position: 'relative',
                transform: p.id === currentDrawerId ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {p.id === currentDrawerId && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--purple-500) 100%)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  🎨
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ 
                  backgroundColor: p.id === currentDrawerId ? 'var(--primary-500)' : 'var(--gray-400)',
                  color: 'white',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ 
                    fontWeight: "700", 
                    color: p.id === currentDrawerId ? 'var(--primary-700)' : 'var(--gray-800)',
                    fontSize: '0.9rem'
                  }}>
                    {p.username}
                  </span>
                  {p.id === currentDrawerId && (
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: 'var(--primary-600)',
                      fontWeight: '600'
                    }}>
                      Currently Drawing
                    </span>
                  )}
                </div>
              </div>
              
              <span style={{ 
                color: p.id === currentDrawerId ? 'var(--primary-700)' : 'var(--primary-600)', 
                fontWeight: "700",
                backgroundColor: "white",
                padding: "0.375rem 0.75rem",
                borderRadius: "10px",
                fontSize: "0.8rem",
                border: `1px solid ${p.id === currentDrawerId ? 'var(--primary-300)' : 'var(--primary-200)'}`,
                boxShadow: p.id === currentDrawerId ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none'
              }}>
                {p.score || 0} pts
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PlayerList;
