import React, { useState } from 'react';
import { Clock, Bell, Trash2 } from 'lucide-react';

// Color category maps based on keywords in task title (Windows Sticky Notes top band style)
const getCategoryStyles = (title) => {
  const t = title.toLowerCase();
  if (t.includes('югуриш') || t.includes('бокс') || t.includes('спорт') || t.includes('пресс')) {
    return { borderTop: '4px solid var(--accent-emerald)' };
  }
  if (t.includes('дарс') || t.includes('болалар') || t.includes('инглиз')) {
    return { borderTop: '4px solid var(--accent-amber)' };
  }
  if (t.includes('дастурлаш') || t.includes('ўрганиш') || t.includes('kwork') || t.includes('проект')) {
    return { borderTop: '4px solid var(--accent-purple)' };
  }
  if (t.includes('пост') || t.includes('китоб') || t.includes('телеграм') || t.includes('linkedin') || t.includes('компот')) {
    return { borderTop: '4px solid var(--accent-blue)' };
  }
  return { borderTop: '4px solid var(--card-border)' };
};

export default function TaskCard({ task, members, onComplete, onDelete }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const assignee = members.find(m => m.id === task.assignee) || { name: 'Ўзим' };

  const handleCheck = () => {
    setIsCompleting(true);
    // Wait for the disintegration CSS animation to finish before updating state
    setTimeout(() => {
      onComplete(task.id);
    }, 300);
  };

  const styleDetails = getCategoryStyles(task.title);

  return (
    <div
      className={`glass-panel task-card ${isCompleting ? 'completing' : ''}`}
      style={{
        borderTop: styleDetails.borderTop,
      }}
    >
      <div className="task-card-header">
        <div className="task-checkbox-wrapper">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={task.completed}
            onChange={handleCheck}
            disabled={isCompleting}
          />
        </div>
        <span className="task-title" style={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1, fontWeight: 'normal' }}>
          {task.title}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="icon-btn"
          style={{ width: '22px', height: '22px', borderRadius: '5px', border: 'none', background: 'transparent' }}
          title="Ўчириш"
        >
          <Trash2 size={11} />
        </button>
      </div>

      <div className="task-meta">
        <div className={`task-time ${task.hasAlarm ? 'has-alarm' : ''}`}>
          {task.time ? (
            <>
              <Clock size={11} />
              <span>{task.time}</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Кун бўйи</span>
          )}
          {task.hasAlarm && <Bell size={9} style={{ marginLeft: '3px' }} />}
        </div>
        
        <span className="assignee-badge">
          {assignee.name}
        </span>
      </div>
    </div>
  );
}
