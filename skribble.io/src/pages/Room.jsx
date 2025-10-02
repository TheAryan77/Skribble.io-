import { useState, useEffect } from "react";
import CanvasBoard from "../components/Canvaboard";
import ChatPanel from "../components/ChatPanel";
import PlayerList from "../components/PlayerList";
import WordPickModal from "../components/WordPickModal";
import Timer from "../components/Timer";
import GameStats from "../components/GameStats";
import socket from "../socket";
import '../App.css';

function Room({ roomId, username }) {
  const [drawer, setDrawer] = useState(null);
  const [currentWord, setCurrentWord] = useState("");
  const [roundActive, setRoundActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundDuration, setRoundDuration] = useState(60);
  const [players, setPlayers] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    roundTime: 60,
    maxRounds: 3,
    difficulty: 'medium'
  });
  const [currentRound, setCurrentRound] = useState(0);

  useEffect(() => {
    socket.emit("join:room", { roomId, username });

    socket.on("round:prepare", ({ drawerId, drawerName }) => {
      setDrawer(drawerId);
      setCurrentWord(""); // Clear previous word
      setRoundActive(false); // Round not active until word is chosen
      console.log(`${drawerName} is choosing a word...`);
    });

    socket.on("round:start", ({ drawerId, maskedWord, duration, roundNumber }) => {
      setDrawer(drawerId);
      setCurrentWord(maskedWord || "");
      setRoundActive(true);
      setGameStarted(true);
      setRoundDuration(duration || 60);
      setCurrentRound(roundNumber || 1);
      console.log(`Round ${roundNumber} started! Word: ${maskedWord}`);
    });

    socket.on("players:update", ({ players }) => {
      setPlayers(players);
    });

    socket.on("round:end", ({ word }) => {
      setRoundActive(false);
      setCurrentWord("");
      console.log(`Round ended! The word was: ${word}`);
    });

    return () => {
      socket.emit("leave:room", { roomId });
      socket.off("round:prepare");
      socket.off("round:start");
      socket.off("players:update");
      socket.off("round:end");
    };
  }, [roomId, username]);

  const isDrawer = drawer === socket.id;

  const startGame = () => {
    setGameStarted(true);
    setRoundDuration(gameSettings.roundTime);
    socket.emit("game:start", { 
      roomId,
      settings: gameSettings
    });
  };

  const handleTimeUp = () => {
    socket.emit("round:end", { roomId });
  };

  const currentPlayer = players.find(p => p.id === drawer);

  return (
    <div className="room-container">
      <div className="room-header">
        <div className="room-info">
          <h2>Room {roomId}</h2>
          <div className="room-status">
            <div>Welcome, <strong>{username}</strong>!</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {gameStarted ? (
                currentPlayer ? `${currentPlayer.username} is drawing` : 'Waiting for drawer...'
              ) : (
                `${players.length} player(s) in room`
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Always show timer when game is active */}
          {(roundActive || gameStarted) && (
            <Timer 
              duration={roundDuration}
              isActive={roundActive}
              onTimeUp={handleTimeUp}
            />
          )}
          
          {!gameStarted && (
            <>
              <button 
                className="tool-button"
                onClick={() => setShowOptions(!showOptions)}
                style={{ 
                  background: showOptions ? 'var(--primary-500)' : 'var(--gray-100)',
                  color: showOptions ? 'white' : 'var(--gray-700)'
                }}
              >
                ⚙️ Options
              </button>
              <button 
                className="join-button"
                onClick={startGame}
                style={{ width: 'auto', margin: 0, padding: '0.75rem 1.5rem' }}
                disabled={players.length < 2}
              >
                Start Game 🎮
              </button>
            </>
          )}
          
          {gameStarted && (
            <GameStats 
              currentRound={currentRound}
              maxRounds={gameSettings.maxRounds}
              gameStarted={gameStarted}
              playersCount={players.length}
            />
          )}
        </div>
      </div>
      
      {/* Game Options Panel */}
      {showOptions && !gameStarted && (
        <div className="sidebar-card" style={{ 
          margin: '0 1.5rem 1.5rem 1.5rem',
          background: 'linear-gradient(135deg, var(--gray-50) 0%, white 100%)'
        }}>
          <h3 className="card-title">🎮 Game Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: 'var(--gray-700)',
                fontSize: '0.875rem'
              }}>
                ⏱️ Round Time
              </label>
              <select 
                value={gameSettings.roundTime}
                onChange={(e) => setGameSettings({...gameSettings, roundTime: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-300)',
                  fontSize: '0.875rem'
                }}
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={90}>90 seconds</option>
                <option value={120}>2 minutes</option>
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: 'var(--gray-700)',
                fontSize: '0.875rem'
              }}>
                🔄 Max Rounds
              </label>
              <select 
                value={gameSettings.maxRounds}
                onChange={(e) => setGameSettings({...gameSettings, maxRounds: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-300)',
                  fontSize: '0.875rem'
                }}
              >
                <option value={3}>3 rounds</option>
                <option value={5}>5 rounds</option>
                <option value={10}>10 rounds</option>
                <option value={999}>Unlimited</option>
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: 'var(--gray-700)',
                fontSize: '0.875rem'
              }}>
                🎯 Difficulty
              </label>
              <select 
                value={gameSettings.difficulty}
                onChange={(e) => setGameSettings({...gameSettings, difficulty: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-300)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="easy">Easy (3-5 letters)</option>
                <option value="medium">Medium (4-8 letters)</option>
                <option value="hard">Hard (7+ letters)</option>
              </select>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem',
            background: 'var(--blue-50)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: 'var(--blue-700)'
          }}>
            <strong>Current Settings:</strong> {gameSettings.roundTime}s rounds, {gameSettings.maxRounds} max rounds, {gameSettings.difficulty} difficulty
          </div>
        </div>
      )}
      
      <div className="game-layout">
        <div className="sidebar-left">
          <PlayerList roomId={roomId} players={players} currentDrawerId={drawer} />
        </div>
        
        <div className="canvas-section">
          <div className="canvas-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: '700',
                color: 'var(--gray-800)'
              }}>
                {gameStarted ? (
                  isDrawer ? (
                    currentWord ? (
                      <span style={{ color: 'var(--primary-600)' }}>
                        🎨 You are drawing: "{currentWord}"
                      </span>
                    ) : (
                      <span style={{ color: 'var(--purple-600)' }}>
                        🤔 Choose a word to draw!
                      </span>
                    )
                  ) : currentPlayer ? (
                    roundActive ? (
                      <span>
                        👀 {currentPlayer.username} is drawing
                      </span>
                    ) : (
                      <span style={{ color: 'var(--gray-600)' }}>
                        ⏳ {currentPlayer.username} is choosing a word...
                      </span>
                    )
                  ) : (
                    'Waiting for next drawer...'
                  )
                ) : (
                  'Click "Start Game" to begin!'
                )}
              </div>
              
              {currentWord && (
                <div className="current-word">
                  {isDrawer ? `Word: ${currentWord}` : `Guess: ${currentWord}`}
                </div>
              )}
            </div>
            
            <div className="canvas-tools">
              {roundActive && (
                <div style={{ 
                  background: 'var(--gray-100)',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  color: 'var(--gray-600)'
                }}>
                  Round {currentWord ? 'Active' : 'Starting...'}
                </div>
              )}
            </div>
          </div>
          <CanvasBoard roomId={roomId} isDrawer={isDrawer} />
        </div>

        <div className="sidebar-right">
          <ChatPanel roomId={roomId} userId={socket.id} username={username} />
        </div>
      </div>
      
      {/* Word Selection Modal - shown when it's player's turn to draw */}
      {isDrawer && gameStarted && !currentWord && (
        <WordPickModal 
          roomId={roomId} 
          drawer={drawer} 
          onPick={(word) => setCurrentWord(word)} 
        />
      )}
    </div>
  );
}

export default Room;
