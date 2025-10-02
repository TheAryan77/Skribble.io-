import { useState } from "react";
import Room from "./pages/Room";
import ConnectionStatus from "./components/ConnectionStatus";

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [inRoom, setInRoom] = useState(false);

  const handleJoinRoom = () => {
    if (!username || !roomId) return alert("Enter username and room ID");
    setInRoom(true);
  };

  if (!inRoom) {
    return (
      <>
        <ConnectionStatus />
        <div className="landing-container">
          <div className="landing-card">
          <div style={{ marginBottom: '2rem' }}>
            <h1 className="landing-title">🎨 DoodleDash</h1>
            <p className="landing-subtitle">Draw, guess, and have fun with friends!</p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem', 
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: 'var(--gray-600)'
            }}>
              <span>🎯 Multiplayer</span>
              <span>⏰ Timed Rounds</span>
              <span>🏆 Score Points</span>
            </div>
          </div>
                    <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && roomId && handleJoinRoom()}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Room ID</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                placeholder="Enter room ID or create new"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && username && handleJoinRoom()}
              />
              <button
                type="button"
                onClick={() => setRoomId(Math.random().toString(36).substring(2, 8).toUpperCase())}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--primary-100)',
                  border: '1px solid var(--primary-300)',
                  borderRadius: '6px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--primary-700)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Generate
              </button>
            </div>
          </div>
          
          <button 
            className="join-button"
            onClick={handleJoinRoom} 
            disabled={!username || !roomId}
          >
            {roomId ? 'Join Room' : 'Create Room'} 🚀
          </button>
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem',
            background: 'var(--gray-50)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            color: 'var(--gray-600)',
            lineHeight: '1.4'
          }}>
            💡 <strong>How to play:</strong> One player draws while others guess the word. 
            Earn points for correct guesses and quick thinking!
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <ConnectionStatus />
      <Room roomId={roomId} username={username} />
    </>
  );
}

export default App;
