import React, { useState } from 'react';
import { CalendarDays, CalendarRange, CheckSquare, Trash2, Calendar } from 'lucide-react';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const YEARS = ['2026', '2027', '2028'];

export default function LongTermPlanner({ tasks, members, onCompleteTask, onDeleteTask }) {
  const [plannerMode, setPlannerMode] = useState('monthly'); // monthly, yearly

  const getMemberName = (id) => {
    return members.find(m => m.id === id)?.name || 'Ўзим';
  };

  // Color bar styling for tasks
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

  const activeTasks = tasks.filter(t => !t.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Sub-navigation tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
        <div className="navigation-tabs" style={{ maxWidth: '360px' }}>
          <button 
            className={`nav-tab ${plannerMode === 'monthly' ? 'active' : ''}`}
            onClick={() => setPlannerMode('monthly')}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <CalendarDays size={14} />
            Ойлик режалар
          </button>
          <button 
            className={`nav-tab ${plannerMode === 'yearly' ? 'active' : ''}`}
            onClick={() => setPlannerMode('yearly')}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <CalendarRange size={14} />
            Йиллик мақсадлар
          </button>
        </div>
      </div>

      {plannerMode === 'monthly' ? (
        /* MONTHLY PLANNED GRID - Shows 12 months */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {MONTHS.map(month => {
            const monthTasks = activeTasks.filter(t => t.plannerType === 'monthly' && t.month === month);

            return (
              <div key={month} className="glass-panel" style={{ background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', minHeight: '180px' }}>
                <div className="column-header">
                  <div className="column-title">
                    <Calendar size={14} style={{ color: 'var(--accent-purple)' }} />
                    <span style={{ fontWeight: '700' }}>{month}</span>
                  </div>
                  <span className="column-task-count">{monthTasks.length}</span>
                </div>
                
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, overflowY: 'auto' }}>
                  {monthTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Ойлик режа йўқ
                    </div>
                  ) : (
                    monthTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="glass-panel task-card"
                        style={getCategoryStyles(task.title)}
                      >
                        <div className="task-card-header">
                          <input
                            type="checkbox"
                            className="task-checkbox"
                            checked={task.completed}
                            onChange={() => onCompleteTask(task.id)}
                          />
                          <span className="task-title" style={{ fontWeight: 'normal' }}>{task.title}</span>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="icon-btn"
                            style={{ width: '20px', height: '20px', border: 'none', background: 'transparent' }}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                        <div className="task-meta" style={{ justifyContent: 'flex-end', marginTop: '4px' }}>
                          <span className="assignee-badge">{getMemberName(task.assignee)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* YEARLY PLANNED GRID - Shows 2026, 2027, 2028 */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {YEARS.map(year => {
            const yearTasks = activeTasks.filter(t => t.plannerType === 'yearly' && t.year === year);

            return (
              <div key={year} className="glass-panel" style={{ background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', minHeight: '220px' }}>
                <div className="column-header">
                  <div className="column-title">
                    <CalendarRange size={14} style={{ color: 'var(--accent-purple)' }} />
                    <span style={{ fontWeight: '700' }}>{year} йил</span>
                  </div>
                  <span className="column-task-count">{yearTasks.length}</span>
                </div>
                
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, overflowY: 'auto' }}>
                  {yearTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Йиллик режа йўқ
                    </div>
                  ) : (
                    yearTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="glass-panel task-card"
                        style={getCategoryStyles(task.title)}
                      >
                        <div className="task-card-header">
                          <input
                            type="checkbox"
                            className="task-checkbox"
                            checked={task.completed}
                            onChange={() => onCompleteTask(task.id)}
                          />
                          <span className="task-title" style={{ fontWeight: 'normal' }}>{task.title}</span>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="icon-btn"
                            style={{ width: '20px', height: '20px', border: 'none', background: 'transparent' }}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                        <div className="task-meta" style={{ justifyContent: 'flex-end', marginTop: '4px' }}>
                          <span className="assignee-badge">{getMemberName(task.assignee)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
