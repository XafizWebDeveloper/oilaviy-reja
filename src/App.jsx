import React, { useState, useEffect } from 'react';
import { Calendar, Users, Archive, Sparkles, ClipboardList } from 'lucide-react';
import { db } from './utils/supabaseClient';
import TaskForm from './components/TaskForm';
import DiaryView from './components/DiaryView';
import FamilyDashboard from './components/FamilyDashboard';
import ArchiveView from './components/ArchiveView';
import AlarmManager from './components/AlarmManager';
import LongTermPlanner from './components/LongTermPlanner';

export default function App() {
  const [activeTab, setActiveTab] = useState('diary'); // diary, longTerm, family, archive
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const fetchedTasks = await db.getTasks();
        const fetchedMembers = await db.getMembers();
        setTasks(fetchedTasks);
        setMembers(fetchedMembers);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // CRUD Operations
  const handleAddTask = async (taskDetails) => {
    try {
      const added = await db.addTask(taskDetails);
      setTasks(prev => [...prev, added]);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      const updated = await db.updateTask(id, { completed: true });
      if (updated) {
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleRestoreTask = async (id) => {
    try {
      const updated = await db.updateTask(id, { completed: false });
      if (updated) {
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
      }
    } catch (err) {
      console.error('Failed to restore task:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const success = await db.deleteTask(id);
      if (success) {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleAddMember = async (memberDetails) => {
    try {
      const added = await db.addMember(memberDetails);
      setMembers(prev => [...prev, added]);
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  return (
    <div className="app-container">
      
      {/* Sound Alarm Check Module */}
      <AlarmManager tasks={tasks} onCompleteTask={handleCompleteTask} />

      {/* Main Header (Only Navigation Tabs to maximize phone screen space) */}
      <header className="app-header glass-panel">
        <nav className="navigation-tabs">
          <button 
            className={`nav-tab ${activeTab === 'diary' ? 'active' : ''}`}
            onClick={() => setActiveTab('diary')}
          >
            <Calendar size={14} />
            Кундалик
          </button>
          <button 
            className={`nav-tab ${activeTab === 'longTerm' ? 'active' : ''}`}
            onClick={() => setActiveTab('longTerm')}
          >
            <ClipboardList size={14} />
            Ойлик/Йиллик
          </button>
          <button 
            className={`nav-tab ${activeTab === 'family' ? 'active' : ''}`}
            onClick={() => setActiveTab('family')}
          >
            <Users size={14} />
            Оилавий
          </button>
          <button 
            className={`nav-tab ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            <Archive size={14} />
            Тарих
          </button>
        </nav>
      </header>

      {/* Quick Add Form - Only visible on planner and Family tabs */}
      {activeTab !== 'archive' && (
        <TaskForm members={members} onAddTask={handleAddTask} />
      )}

      {/* Main View Display */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Юкланмоқда...
        </div>
      ) : (
        <main>
          {activeTab === 'diary' && (
            <DiaryView 
              tasks={tasks} 
              members={members} 
              onCompleteTask={handleCompleteTask} 
              onDeleteTask={handleDeleteTask} 
            />
          )}

          {activeTab === 'longTerm' && (
            <LongTermPlanner 
              tasks={tasks} 
              members={members} 
              onCompleteTask={handleCompleteTask} 
              onDeleteTask={handleDeleteTask} 
            />
          )}

          {activeTab === 'family' && (
            <FamilyDashboard 
              tasks={tasks} 
              members={members} 
              onAddMember={handleAddMember} 
            />
          )}

          {activeTab === 'archive' && (
            <ArchiveView 
              tasks={tasks} 
              members={members} 
              onRestoreTask={handleRestoreTask} 
              onDeleteTask={handleDeleteTask} 
            />
          )}
        </main>
      )}

    </div>
  );
}
