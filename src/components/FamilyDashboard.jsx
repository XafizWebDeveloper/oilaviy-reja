import React, { useState } from 'react';
import { Users, CheckCircle, Activity, ClipboardList, Plus, UserPlus, Image } from 'lucide-react';
import html2canvas from 'html2canvas';

const WEEKDAYS = ['Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба', 'Якшанба'];

export default function FamilyDashboard({ tasks, members, onAddMember }) {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [activeExportMember, setActiveExportMember] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Calculations
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    onAddMember({
      name: newMemberName.trim(),
      role: newMemberRole.trim() || 'Аъзо'
    });

    setNewMemberName('');
    setNewMemberRole('');
  };

  // Count pending tasks per member
  const getPendingTasksCount = (memberId) => {
    return tasks.filter(t => t.assignee === memberId && !t.completed).length;
  };

  // Custom sort order: dad (Ўзим), mom (Оилам), laylo (Қизим), akmal (Ўғлим)
  const sortedMembers = [...members].sort((a, b) => {
    const order = { 'dad': 0, 'mom': 1, 'laylo': 2, 'akmal': 3 };
    const orderA = order[a.id] !== undefined ? order[a.id] : 99;
    const orderB = order[b.id] !== undefined ? order[b.id] : 99;
    return orderA - orderB;
  });

  // Generate Image of Weekly Schedule and share/download
  const handleGenerateImage = (member) => {
    setActiveExportMember(member);
    setExporting(true);

    // Wait a tick for the hidden export DOM to render
    setTimeout(async () => {
      const element = document.getElementById('export-weekly-schedule');
      if (!element) {
        setExporting(false);
        setActiveExportMember(null);
        return;
      }

      try {
        const canvas = await html2canvas(element, {
          scale: 2, // Double quality for sharp text on screens
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        // Convert canvas to Blob
        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error('Blob creation failed');
          
          const fileName = `${member.name}_haftalik_rejalari.png`;
          const file = new File([blob], fileName, { type: 'image/png' });

          // Detect if user is on mobile (to prevent Web Share failures on PC)
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);

          // Try sharing using Web Share API only on mobile devices
          if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: `${member.name} ҳафталик режаси`,
                text: `${member.name} учун ҳафталик режалар рўйхати`
              });
            } catch (shareErr) {
              // Share cancelled or failed, fallback to download
              triggerDownload(canvas, fileName);
            }
          } else {
            // Web Share not supported or on Desktop, trigger direct download
            triggerDownload(canvas, fileName);
          }
        }, 'image/png');

      } catch (err) {
        console.error('Failed to generate image:', err);
      } finally {
        setExporting(false);
        setActiveExportMember(null);
      }
    }, 150);
  };

  const triggerDownload = (canvas, fileName) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="family-dashboard">
      
      {/* Left panel: Members list only */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '1rem' }}>
            <Users size={16} style={{ color: 'var(--accent-blue)' }} />
            Аъзолар рўйхати
          </h3>
          
          <div className="member-list">
            {sortedMembers.map(member => (
              <div key={member.id} className="glass-panel member-card" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                <div className="member-info">
                  <div>
                    <h4 className="member-name-tag">{member.name}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{member.role}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <span className="column-task-count" style={{ background: 'rgba(147, 51, 234, 0.12)', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                    {getPendingTasksCount(member.id)} та фаол режа
                  </span>
                  <button 
                    onClick={() => handleGenerateImage(member)}
                    disabled={exporting}
                    className="submit-btn"
                    style={{ fontSize: '0.7rem', padding: '4px 8px', height: '24px', background: 'var(--accent-purple)' }}
                  >
                    <Image size={10} />
                    Режани расм қилиш
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: Statistics, Task distribution, and Add Member form at the bottom */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Statistics section */}
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '14px' }}>
            <Activity size={16} style={{ color: 'var(--accent-emerald)' }} />
            Фаоллик статистикаси
          </h3>

          <div className="stats-grid">
            <div className="glass-panel stat-card">
              <span className="option-label">Умумий режалар</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={20} style={{ color: 'var(--accent-blue)' }} />
                <span className="stat-val">{totalTasks}</span>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <span className="option-label">Бажарилган режалар</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />
                <span className="stat-val">{completedTasks}</span>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <span className="option-label">Бажарилиш фоизи</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="stat-val" style={{ color: 'var(--accent-purple)' }}>{completionRate}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--card-border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--accent-purple)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Task lists by user details */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>Аъзолар бўйича режалар тақсимоти</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedMembers.map(member => {
              const memberAllTasks = tasks.filter(t => t.assignee === member.id);
              const memberDoneTasks = memberAllTasks.filter(t => t.completed);
              const memberPending = memberAllTasks.filter(t => !t.completed);
              const rate = memberAllTasks.length > 0 ? Math.round((memberDoneTasks.length / memberAllTasks.length) * 100) : 0;

              return (
                <div key={member.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span><strong>{member.name}</strong> ({memberPending.length} та фаол)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{memberDoneTasks.length}/{memberAllTasks.length} ({rate}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--card-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${rate}%`, height: '100%', background: 'var(--accent-emerald)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Member Form (Moved here below statistics) */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.95rem' }}>
            <UserPlus size={14} style={{ color: 'var(--accent-purple)' }} />
            Янги аъзо қўшиш
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="text-input"
              placeholder="Исми (масалан: Онаси)"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.8rem', flex: '1 1 150px' }}
            />
            <input
              type="text"
              className="text-input"
              placeholder="Роли (масалан: Турмуш ўртоғим)"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.8rem', flex: '1 1 150px' }}
            />

            <button type="submit" className="submit-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={14} />
              Қўшиш
            </button>
          </form>
        </div>

      </div>

      {/* HIDDEN OFF-SCREEN CONTAINER FOR GENERATING 7-DAY LANDSCAPE EXPORT IMAGE */}
      {activeExportMember && (
        <div 
          id="export-weekly-schedule"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: '1200px',
            background: '#ffffff',
            color: '#1c1a17',
            padding: '28px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            borderRadius: '0px'
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#7e22ce', fontSize: '1.8rem', fontWeight: 'bold' }}>
            📅 {activeExportMember.name} учун ҳафталик режа
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '14px' }}>
            {WEEKDAYS.map(day => {
              const dayTasks = tasks.filter(t => (t.plannerType === 'weekly' || !t.plannerType) && t.day === day && t.assignee === activeExportMember.id && !t.completed);
              
              // Sort tasks by time
              const sortedTasks = [...dayTasks].sort((a, b) => {
                if (!a.time) return 1;
                if (!b.time) return -1;
                return a.time.localeCompare(b.time);
              });

              return (
                <div 
                  key={day} 
                  style={{ 
                    border: '1.5px solid #d3cfc5', 
                    borderRadius: '10px', 
                    padding: '12px', 
                    minHeight: '340px', 
                    background: '#f6f5f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <h4 style={{ borderBottom: '2px solid #7e22ce', paddingBottom: '8px', marginBottom: '4px', fontWeight: 'bold', fontSize: '1rem', color: '#1c1a17' }}>
                    {day}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                    {sortedTasks.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#8c887f', fontStyle: 'italic', textAlign: 'center', marginTop: '30px' }}>
                        Режа йўқ
                      </span>
                    ) : (
                      sortedTasks.map(task => (
                        <div 
                          key={task.id} 
                          style={{ 
                            background: '#ffffff', 
                            border: '1px solid #d3cfc5', 
                            padding: '8px 10px', 
                            borderRadius: '6px', 
                            fontSize: '0.8rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', color: '#7e22ce', fontSize: '0.75rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span>⏰ {task.time || 'Кун бўйи'}</span>
                          </div>
                          <div style={{ color: '#1c1a17', fontWeight: '600', lineHeight: '1.3' }}>
                            {task.title}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.75rem', color: '#8c887f', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
            Блокнот
          </div>
        </div>
      )}
      
    </div>
  );
}
