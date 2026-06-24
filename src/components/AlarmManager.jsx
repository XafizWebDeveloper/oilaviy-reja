import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Volume2, Play, Square } from 'lucide-react';

const WEEKDAYS_ENGLISH = ['Якшанба', 'Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба'];

export default function AlarmManager({ tasks, onCompleteTask }) {
  const [activeAlarmTask, setActiveAlarmTask] = useState(null);
  const [audioPermission, setAudioPermission] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Web Audio Context references
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const soundIntervalRef = useRef(null);

  // Keep track of triggered tasks to prevent double alarms in the same minute
  const triggeredTaskMinutesRef = useRef(new Set());

  // Enable audio context by playing a short silent note
  const enableAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.start(0);
      osc.stop(0.1);
      audioCtxRef.current = ctx;
      setAudioPermission(true);
      console.log('Audio Context activated successfully.');
    } catch (e) {
      console.error('Failed to initialize Audio Context', e);
    }
  };

  // Synthesize Alarm Sounds programmatically
  const startAlarmSound = (soundType) => {
    if (isPlaying) return;

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      oscRef.current = osc;
      gainRef.current = gain;

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (soundType === 'alarm2') {
        // High pitch ding-ding bell sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.start();

        let toggle = true;
        soundIntervalRef.current = setInterval(() => {
          if (!oscRef.current) return;
          oscRef.current.frequency.setValueAtTime(toggle ? 880 : 660, ctx.currentTime);
          gainRef.current.gain.setValueAtTime(0.25, ctx.currentTime);
          toggle = !toggle;
        }, 300);
      } else if (soundType === 'voice1' || soundType === 'voice2') {
        // Voice alert mimic: Pulsating mid-frequency
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.start();

        let toggle = true;
        soundIntervalRef.current = setInterval(() => {
          if (!oscRef.current) return;
          oscRef.current.frequency.setValueAtTime(toggle ? 330 : 220, ctx.currentTime);
          gainRef.current.gain.setValueAtTime(0.3, ctx.currentTime);
          toggle = !toggle;
        }, 150);
      } else {
        // Default Siren alarm1
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.start();

        let toggle = true;
        soundIntervalRef.current = setInterval(() => {
          if (!oscRef.current) return;
          oscRef.current.frequency.linearRampToValueAtTime(toggle ? 680 : 440, ctx.currentTime + 0.2);
          gainRef.current.gain.setValueAtTime(0.2, ctx.currentTime);
          toggle = !toggle;
        }, 400);
      }

      setIsPlaying(true);
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  };

  const stopAlarmSound = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    setIsPlaying(false);
  };

  // Clock tick to evaluate tasks time match
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentDay = WEEKDAYS_ENGLISH[now.getDay()];
      
      const pad = (num) => num.toString().padStart(2, '0');
      const currentTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      
      // Match key identifier: "day-time-minute"
      const triggerKey = `${currentDay}-${currentTimeStr}-${now.getMinutes()}`;

      // Only check alarms that are active, not completed, have alarms, and match time
      tasks.forEach(task => {
        if (
          task.hasAlarm &&
          !task.completed &&
          task.day === currentDay &&
          task.time === currentTimeStr
        ) {
          // If we haven't triggered this key yet
          if (!triggeredTaskMinutesRef.current.has(task.id + '-' + triggerKey)) {
            triggeredTaskMinutesRef.current.add(task.id + '-' + triggerKey);
            setActiveAlarmTask(task);
            startAlarmSound(task.alarmSound);
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 3000); // Check every 3 seconds
    return () => {
      clearInterval(interval);
      stopAlarmSound();
    };
  }, [tasks, isPlaying]);

  const handleDismiss = () => {
    stopAlarmSound();
    setActiveAlarmTask(null);
  };

  const handleComplete = () => {
    if (activeAlarmTask) {
      onCompleteTask(activeAlarmTask.id);
    }
    stopAlarmSound();
    setActiveAlarmTask(null);
  };

  return (
    <>
      {/* Audio permission banner if not unlocked yet */}
      {!audioPermission && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '12px 20px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            borderColor: 'rgba(245, 158, 11, 0.3)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
            <BellOff className="text-amber" style={{ color: 'var(--accent-amber)' }} size={18} />
            <span>Овозли эслатма ишлаши учун фаоллаштиринг.</span>
          </div>
          <button 
            className="submit-btn" 
            onClick={enableAudio} 
            style={{ 
              background: 'var(--accent-amber)', 
              fontSize: '0.8rem', 
              padding: '6px 12px',
              height: '32px' 
            }}
          >
            <Volume2 size={14} />
            Фаоллаштириш
          </button>
        </div>
      )}

      {/* Alarm popup overlay if triggered */}
      {activeAlarmTask && (
        <div className="alarm-overlay-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={24} className="has-alarm" style={{ animation: 'pulse-glow 1s infinite' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Эслатма: Вақти келди!</h2>
          </div>
          
          <div style={{ margin: '10px 0' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{activeAlarmTask.title}</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '4px' }}>
              Бажарувчи: {activeAlarmTask.assignee === 'dad' ? 'Дадам' : activeAlarmTask.assignee === 'mom' ? 'Онам' : activeAlarmTask.assignee === 'akmal' ? 'Акмал' : 'Лайло'}
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '6px', color: 'var(--accent-amber)' }}>
              ⏰ {activeAlarmTask.time}
            </p>
          </div>

          <div className="alarm-banner-actions">
            <button className="alarm-action-btn dismiss" onClick={handleDismiss}>
              Ўчириш
            </button>
            <button 
              className="alarm-action-btn" 
              onClick={handleComplete} 
              style={{ background: 'var(--accent-emerald)', color: 'white' }}
            >
              Бажардим!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
