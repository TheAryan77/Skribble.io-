import { useState, useEffect } from 'react';
import '../App.css';

function Timer({ duration = 60, isActive = false, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
        ⏰
      </span>
      <div className={`timer-display ${isCritical ? 'critical' : isWarning ? 'warning' : ''}`}>
        {isActive ? formatTime(timeLeft) : '--:--'}
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
        {isActive ? 'left' : 'ready'}
      </span>
    </div>
  );
}

export default Timer;