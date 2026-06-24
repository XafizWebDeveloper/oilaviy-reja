import React from 'react';
import { Calendar, CheckSquare } from 'lucide-react';
import TaskCard from './TaskCard';

const WEEKDAYS = ['Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба', 'Якшанба'];
const WEEKDAYS_ENGLISH = ['Якшанба', 'Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба'];

export default function DiaryView({ tasks, members, onCompleteTask, onDeleteTask }) {
  // Get current day of the week string (Uzbek Cyrillic)
  const todayDayUz = WEEKDAYS_ENGLISH[new Date().getDay()];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* Diary Columns Grid */}
      <div className="diary-grid">
        {WEEKDAYS.map((day) => {
          // Show only weekly tasks in the diary view
          const dayTasks = tasks.filter(
            t => (t.plannerType === 'weekly' || !t.plannerType) && t.day === day && !t.completed
          );
          
          // Sort tasks by time (empty times go last)
          const sortedTasks = [...dayTasks].sort((a, b) => {
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
          });

          const isToday = day === todayDayUz;

          return (
            <div
              key={day}
              className={`glass-panel diary-column ${isToday ? 'today' : ''}`}
            >
              <div className="column-header" style={{ background: isToday ? 'rgba(168, 85, 247, 0.05)' : 'transparent' }}>
                <div className="column-title">
                  <Calendar size={14} style={{ color: isToday ? 'var(--accent-purple)' : 'var(--text-secondary)' }} />
                  <span style={{ fontWeight: '700' }}>{day}</span>
                </div>
                <span className="column-task-count">{sortedTasks.length}</span>
              </div>

              <div className="column-tasks-container">
                {sortedTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <CheckSquare size={20} style={{ opacity: 0.3 }} />
                    Режа йўқ
                  </div>
                ) : (
                  sortedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      onComplete={onCompleteTask}
                      onDelete={onDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
