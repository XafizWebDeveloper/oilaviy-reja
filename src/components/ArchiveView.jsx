import React, { useState } from 'react';
import { Search, RotateCcw, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function ArchiveView({ tasks, members, onRestoreTask, onDeleteTask }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Only show completed tasks
  const completedTasks = tasks.filter(t => t.completed);

  // Filter tasks based on search keyword
  const filteredTasks = completedTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.month && task.month.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (task.year && task.year.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort: most recently created first
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const getMemberName = (id) => {
    const m = members.find(member => member.id === id);
    return m ? m.name : 'Ўзим';
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Ноъмалум сана';
    const date = new Date(isoString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-panel archive-container" style={{ padding: '16px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
          Бажарилган режалар тарихи
        </h3>
        
        <span className="column-task-count" style={{ background: 'rgba(4, 120, 87, 0.12)', color: 'var(--accent-emerald)', padding: '4px 8px' }}>
          Жами: {completedTasks.length}
        </span>
      </div>

      {/* Search Bar */}
      <div className="archive-search-bar">
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search 
            size={14} 
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
          />
          <input
            type="text"
            className="text-input"
            placeholder="Вазифа, кун, ой ёки йил номи бўйича қидириш..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', width: '100%', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* History Ledger Table */}
      <div style={{ overflowX: 'auto' }}>
        {sortedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <FileText size={28} style={{ opacity: 0.2 }} />
            Тарихда мос келувчи вазифалар топилмади.
          </div>
        ) : (
          <table className="archive-table">
            <thead>
              <tr>
                <th>Режа номи</th>
                <th>Сана / Кун</th>
                <th>Бажарувчи</th>
                <th>Бажарилган сана</th>
                <th style={{ textAlign: 'right' }}>Амаллар</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map(task => (
                <tr key={task.id}>
                  <td style={{ fontWeight: 'normal' }}>{task.title}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <Calendar size={11} style={{ color: 'var(--accent-purple)' }} />
                      {task.plannerType === 'weekly' || !task.plannerType ? (
                        <>
                          <span>{task.day}</span>
                          {task.time && <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>{task.time}</span>}
                        </>
                      ) : task.plannerType === 'monthly' ? (
                        <span>Ойлик: {task.month}</span>
                      ) : (
                        <span>Йиллик: {task.year} йил</span>
                      )}
                    </div>
                  </td>
                  <td>{getMemberName(task.assignee)}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {formatDate(task.createdAt)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onRestoreTask(task.id)}
                        className="icon-btn"
                        style={{ width: '24px', height: '24px', borderRadius: '5px', border: 'none', background: 'rgba(29, 78, 216, 0.08)', color: 'var(--accent-blue)' }}
                        title="Тиклаш"
                      >
                        <RotateCcw size={11} />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="icon-btn"
                        style={{ width: '24px', height: '24px', borderRadius: '5px', border: 'none', background: 'rgba(190, 18, 60, 0.08)', color: 'var(--accent-rose)' }}
                        title="Ўчириш"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer with marketing Telegram link (Only visible in Archive view) */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '14px 0 4px', 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)', 
        borderTop: '1px solid var(--card-border)', 
        marginTop: '16px',
        display: 'flex',
        justifyContent: 'center',
        gap: '4px'
      }}>
        <span>Ишлаб чиқувчи:</span>
        <a 
          href="https://t.me/Rasulov_Xafiz" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: 'var(--accent-purple)', fontWeight: 'bold', textDecoration: 'none' }}
        >
          Хафиз Расулов
        </a>
      </footer>

    </div>
  );
}
