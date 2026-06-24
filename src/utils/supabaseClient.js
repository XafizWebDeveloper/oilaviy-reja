// Local-only Database Wrapper using LocalStorage (100% private)

const DEFAULT_MEMBERS = [
  { id: 'dad', name: 'Ўзим', role: 'Режа эгаси' },
  { id: 'mom', name: 'Оилам', role: 'Турмуш ўртоғим' },
  { id: 'laylo', name: 'Қизим', role: 'Фарзандим' },
  { id: 'akmal', name: 'Ўғлим', role: 'Фарзандим' }
]

const localDb = {
  getTasks: () => {
    const data = localStorage.getItem('family_planner_tasks')
    return data ? JSON.parse(data) : []
  },
  saveTasks: (tasks) => {
    localStorage.setItem('family_planner_tasks', JSON.stringify(tasks))
  },
  getMembers: () => {
    const data = localStorage.getItem('family_planner_members')
    if (!data) {
      localStorage.setItem('family_planner_members', JSON.stringify(DEFAULT_MEMBERS))
      return DEFAULT_MEMBERS
    }
    return JSON.parse(data)
  },
  saveMembers: (members) => {
    localStorage.setItem('family_planner_members', JSON.stringify(members))
  }
}

export const db = {
  isMock: true, // Always mock mode, no database connection

  getTasks: async () => {
    return localDb.getTasks()
  },

  addTask: async (task) => {
    const newTask = {
      id: crypto.randomUUID(),
      title: task.title,
      plannerType: task.plannerType || 'weekly', // weekly, monthly, yearly
      time: task.time || '',
      day: task.day || '',
      month: task.month || '',
      year: task.year || '',
      assignee: task.assignee || 'dad',
      completed: false,
      hasAlarm: !!task.hasAlarm,
      alarmSound: task.alarmSound || 'alarm1',
      createdAt: new Date().toISOString()
    }

    const tasks = localDb.getTasks()
    tasks.push(newTask)
    localDb.saveTasks(tasks)
    return newTask
  },

  updateTask: async (id, updates) => {
    const tasks = localDb.getTasks()
    const index = tasks.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates }
      localDb.saveTasks(tasks)
      return tasks[index]
    }
    return null
  },

  deleteTask: async (id) => {
    const tasks = localDb.getTasks()
    const filtered = tasks.filter(t => t.id !== id)
    localDb.saveTasks(filtered)
    return true
  },

  getMembers: async () => {
    return localDb.getMembers()
  },

  addMember: async (member) => {
    const newMember = {
      id: crypto.randomUUID(),
      name: member.name,
      role: member.role || 'Оила аъзоси'
    }

    const members = localDb.getMembers()
    members.push(newMember)
    localDb.saveMembers(members)
    return newMember
  }
}
