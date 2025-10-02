import { Stage, Layer, Line } from "react-konva";
import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function CanvasBoard({ roomId, isDrawer }) {
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);

  useEffect(() => {

    socket.on("draw:stroke", (stroke) => {
      setLines((prev) => [...prev, stroke]);
    });

    socket.on("draw:clear", () => {
      setLines([]);
    });

    return () => {
      socket.off("draw:stroke");
      socket.off("draw:clear");
    };
  }, []);

  const handleMouseDown = (e) => {
    if (!isDrawer) return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], color: "black", width: 3 }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawer || !isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];

    lastLine.points = lastLine.points.concat([point.x, point.y]);
    const updatedLines = lines.slice(0, lines.length - 1).concat(lastLine);

    setLines(updatedLines);


    socket.emit("draw:stroke", { roomId, stroke: lastLine });
  };

  const handleMouseUp = () => {
    if (!isDrawer) return;
    isDrawing.current = false;
  };

  const handleClear = () => {
    setLines([]);
    socket.emit("draw:clear", roomId);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {isDrawer && (
        <div style={{ marginBottom: "1rem", display: 'flex', gap: '0.5rem' }}>
          <button 
            className="tool-button clear"
            onClick={handleClear}
          >
            🗑️ Clear Canvas
          </button>
          <div className="tool-button" style={{ cursor: 'default' }}>
            🎨 Drawing Mode
          </div>
        </div>
      )}
      
      <div style={{ 
        border: "2px solid var(--gray-200)", 
        borderRadius: "16px", 
        padding: "1rem",
        backgroundColor: "#fefefe",
        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Stage
          width={Math.min(800, window.innerWidth - 100)}
          height={Math.min(500, window.innerHeight - 300)}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          style={{
            border: "1px solid var(--gray-300)",
            borderRadius: "12px",
            backgroundColor: "white",
            cursor: isDrawer ? 'crosshair' : 'default'
          }}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.width}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          </Layer>
        </Stage>
      </div>
      
      {!isDrawer && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1rem', 
          color: 'var(--gray-500)',
          fontSize: '0.875rem'
        }}>
          🔍 Watch and guess what's being drawn!
        </div>
      )}
    </div>
  );
}

export default CanvasBoard;
