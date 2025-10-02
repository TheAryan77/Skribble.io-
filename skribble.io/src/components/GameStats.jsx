import React from 'react';

function GameStats({ currentRound, maxRounds, gameStarted, playersCount }) {
  if (!gameStarted) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
      fontSize: '0.875rem'
    }}>
      <div style={{
        background: 'var(--blue-50)',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
        color: 'var(--blue-700)',
        fontWeight: '600'
      }}>
        📊 Round {currentRound || 1}/{maxRounds}
      </div>
      
      <div style={{
        background: 'var(--purple-50)',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
        color: 'var(--purple-700)',
        fontWeight: '600'
      }}>
        👥 {playersCount} Players
      </div>
    </div>
  );
}

export default GameStats;