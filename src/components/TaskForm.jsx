import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, User, Bell, Clock, CalendarDays } from 'lucide-react';
import { parseTaskText } from '../utils/nlpParser';

const WEEKDAYS = ['Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба', 'Якшанба'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const YEARS = ['2026', '2027', '2028'];

export default function TaskForm({ members, onAddTask }) {
  const [inputText, setInputText] = useState('');
  const [parsed, setParsed] = useState({ title: '', plannerType: 'weekly', days: [], time: '', month: '', year: '', assignee: 'dad' });
  
  // Form input states
  const [plannerType, setPlannerType] = useState('weekly'); // weekly, monthly, yearly
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('Июль');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedAssignee, setSelectedAssignee] = useState('dad');
  const [selectedTime, setSelectedTime] = useState('');
  const [hasAlarm, setHasAlarm] = useState(false);
  const [alarmSound, setAlarmSound] = useState('alarm1');

  // Parse natural language in real-time as the user types
  useEffect(() => {
    const result = parseTaskText(inputText);
    setParsed(result);
    
    // Sync UI controls with parsed text if input is active
    if (inputText.trim()) {
      setPlannerType(result.plannerType);
      setSelectedAssignee(result.assignee);
      
      if (result.plannerType === 'weekly') {
        setSelectedDays(result.days);
        setSelectedTime(result.time);
      } else if (result.plannerType === 'monthly') {
        setSelectedMonth(result.month || 'Июль');
      } else if (result.plannerType === 'yearly') {
        setSelectedYear(result.year || '2026');
      }
    }
  }, [inputText]);

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!parsed.title && !inputText.trim()) return;

    const taskTitle = parsed.title || inputText.trim();

    if (plannerType === 'weekly') {
      // If multiple days are selected, add a separate task for each day!
      if (selectedDays.length > 0) {
        selectedDays.forEach(day => {
          onAddTask({
            title: taskTitle,
            plannerType: 'weekly',
            day: day,
            time: selectedTime,
            assignee: selectedAssignee,
            hasAlarm: hasAlarm,
            alarmSound: alarmSound
          });
        });
      } else {
        // Default to today if no days selected
        const todayIndex = new Date().getDay();
        const WEEKDAYS_ENGLISH = ['Якшанба', 'Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба'];
        const currentDay = WEEKDAYS_ENGLISH[todayIndex];
        onAddTask({
          title: taskTitle,
          plannerType: 'weekly',
          day: currentDay,
          time: selectedTime,
          assignee: selectedAssignee,
          hasAlarm: hasAlarm,
          alarmSound: alarmSound
        });
      }
    } else if (plannerType === 'monthly') {
      onAddTask({
        title: taskTitle,
        plannerType: 'monthly',
        month: selectedMonth,
        assignee: selectedAssignee
      });
    } else if (plannerType === 'yearly') {
      onAddTask({
        title: taskTitle,
        plannerType: 'yearly',
        year: selectedYear,
        assignee: selectedAssignee
      });
    }

    // Reset input states
    setInputText('');
    setSelectedDays([]);
    setSelectedTime('');
    setHasAlarm(false);
    setSelectedAssignee('dad');
  };

  return (
    <div className="glass-panel form-panel">
      <h3 className="form-title">
        <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
        Тезкор режа қўшиш
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="quick-input-group">
          <input
            type="text"
            className="text-input"
            placeholder="Масалан: Июль ойида компот қилиш @оилам (ёки Душанба 05:00 югуриш)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="submit-btn">
            <Plus size={16} />
            Қўшиш
          </button>
        </div>

        {/* NLP Preview Feedback */}
        {inputText.trim() && (
          <div className="help-text" style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Sparkles size={12} />
            <span>
              Аниқланди: <strong>{plannerType === 'weekly' ? 'Ҳафталик' : plannerType === 'monthly' ? 'Ойлик' : 'Йиллик'}</strong> режа. 
              Вазифа: <strong>{parsed.title}</strong> | 
              Бажарувчи: <strong>{members.find(m => m.id === selectedAssignee)?.name || 'Ўзим'}</strong>
              {plannerType === 'weekly' && ` (${selectedDays.join(', ') || 'Бугун'} соат ${selectedTime || 'исталган вақт'}да)`}
              {plannerType === 'monthly' && ` (Ой: ${selectedMonth})`}
              {plannerType === 'yearly' && ` (Йил: ${selectedYear})`}
            </span>
          </div>
        )}

        <div className="form-options-panel">
          
          {/* Planner Type Selector */}
          <div className="option-field">
            <span className="option-label">Режа тури</span>
            <select
              className="select-input"
              value={plannerType}
              onChange={(e) => setPlannerType(e.target.value)}
            >
              <option value="weekly">📅 Ҳафталик</option>
              <option value="monthly">🗓️ Ойлик</option>
              <option value="yearly">⏳ Йиллик</option>
            </select>
          </div>

          {/* Conditional Input Fields based on Planner Type */}
          {plannerType === 'weekly' && (
            <>
              {/* Days checklist */}
              <div className="option-field">
                <span className="option-label">Қайси кунларга?</span>
                <div className="days-selector">
                  {WEEKDAYS.map((day) => (
                    <label key={day} className="day-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                      <span className="day-tag">{day.substring(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Picker */}
              <div className="option-field">
                <span className="option-label">
                  <Clock size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                  Соат
                </span>
                <input
                  type="time"
                  className="time-picker"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </>
          )}

          {plannerType === 'monthly' && (
            <div className="option-field">
              <span className="option-label">Ойни танланг</span>
              <select
                className="select-input"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          {plannerType === 'yearly' && (
            <div className="option-field">
              <span className="option-label">Йилни танланг</span>
              <select
                className="select-input"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y} йил</option>
                ))}
              </select>
            </div>
          )}

          {/* Assignee Selection */}
          <div className="option-field">
            <span className="option-label">
              <User size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
              Бажарувчи
            </span>
            <select
              className="select-input"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
            >
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Alarm Trigger (Weekly only) */}
          {plannerType === 'weekly' && (
            <div className="option-field" style={{ justifyContent: 'center' }}>
              <span className="option-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasAlarm}
                  onChange={(e) => setHasAlarm(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <Bell size={11} style={{ color: hasAlarm ? 'var(--accent-amber)' : 'var(--text-muted)' }} />
                Будильник
              </span>
              {hasAlarm && (
                <select
                  className="select-input"
                  value={alarmSound}
                  onChange={(e) => setAlarmSound(e.target.value)}
                  style={{ marginTop: '3px' }}
                >
                  <option value="alarm1">⏰ Сирена</option>
                  <option value="alarm2">🔔 Қўнғироқ</option>
                  <option value="voice1">🎙️ Эслатма 1</option>
                  <option value="voice2">🎙️ Эслатма 2</option>
                </select>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
