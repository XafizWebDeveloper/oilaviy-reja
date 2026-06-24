// Natural Language Parser for Uzbek task entries (Weekly, Monthly, Yearly)

const WEEKDAYS_MAP = {
  'душанба': 'Душанба',
  'сешанба': 'Сешанба',
  'чоршанба': 'Чоршанба',
  'пайшанба': 'Пайшанба',
  'жума': 'Жума',
  'шанба': 'Шанба',
  'якшанба': 'Якшанба'
};

const MONTHS_MAP = {
  'январь': 'Январь', 'январ': 'Январь',
  'февраль': 'Февраль', 'феврал': 'Февраль',
  'март': 'Март',
  'апрель': 'Апрель', 'апрел': 'Апрель',
  'май': 'Май',
  'июнь': 'Июнь', 'июн': 'Июнь',
  'июль': 'Июль', 'июл': 'Июль',
  'август': 'Август',
  'сентябрь': 'Сентябрь', 'сентябр': 'Сентябрь',
  'октябрь': 'Октябрь', 'октябр': 'Октябрь',
  'ноябрь': 'Ноябрь', 'ноябр': 'Ноябрь',
  'декабрь': 'Декабрь', 'декабр': 'Декабрь'
};

const WEEKDAYS_ENGLISH = ['Якшанба', 'Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба'];

export function parseTaskText(inputText) {
  if (!inputText || !inputText.trim()) {
    return { title: '', plannerType: 'weekly', days: [], time: '', month: '', year: '', assignee: 'dad' };
  }

  let text = inputText.trim();
  const foundDays = [];
  let foundTime = '';
  let foundAssignee = 'dad';
  let foundMonth = '';
  let foundYear = '';
  let plannerType = 'weekly'; // weekly, monthly, yearly

  // 1. Parse Assignee (e.g., @ўзим, @оилам, @ўғлим, @қизим)
  const assigneeMatch = text.match(/@(\w+|[\u0400-\u04FF]+)/i);
  if (assigneeMatch) {
    const rawAssignee = assigneeMatch[1].toLowerCase();
    if (rawAssignee.startsWith('ўғил') || rawAssignee.startsWith('угил')) {
      foundAssignee = 'akmal';
    } else if (rawAssignee.startsWith('қиз') || rawAssignee.startsWith('киз')) {
      foundAssignee = 'laylo';
    } else if (rawAssignee.startsWith('оил')) {
      foundAssignee = 'mom';
    } else if (rawAssignee.startsWith('ўзим') || rawAssignee.startsWith('узим') || rawAssignee.startsWith('мен')) {
      foundAssignee = 'dad';
    }
    text = text.replace(assigneeMatch[0], '');
  }

  // 2. Parse Years (e.g. 2026, 2027)
  const yearMatch = text.match(/\b(202\d)\b/);
  if (yearMatch) {
    foundYear = yearMatch[1];
    plannerType = 'yearly';
    text = text.replace(yearMatch[0], '');
  }

  // 3. Parse Months (e.g. июль, август)
  const wordsForMonth = text.split(/[\s,]+/);
  for (const word of wordsForMonth) {
    const cleanWord = word.toLowerCase().replace(/ойида|ойлик|ойи/g, '').trim();
    if (MONTHS_MAP[cleanWord]) {
      foundMonth = MONTHS_MAP[cleanWord];
      plannerType = 'monthly';
      // Remove word from text
      text = text.replace(word, '');
    }
  }

  // If it's not monthly or yearly, process weekly days and time
  if (plannerType === 'weekly') {
    // Parse Time (e.g., 05:00, 5:00)
    const timeMatch = text.match(/\b(\d{1,2})[:.-](\d{2})\b/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      let minutes = parseInt(timeMatch[2], 10);
      const pad = (n) => n.toString().padStart(2, '0');
      foundTime = `${pad(hours)}:${pad(minutes)}`;
      text = text.replace(timeMatch[0], '');
    }

    // Parse Days
    const words = text.split(/[\s,]+/);
    const remainingWords = [];
    for (const word of words) {
      const cleanWord = word.toLowerCase().trim();
      if (WEEKDAYS_MAP[cleanWord]) {
        if (!foundDays.includes(WEEKDAYS_MAP[cleanWord])) {
          foundDays.push(WEEKDAYS_MAP[cleanWord]);
        }
      } else {
        if (word) remainingWords.push(word);
      }
    }
    
    // If no day matches, default to today
    if (foundDays.length === 0) {
      const todayIndex = new Date().getDay();
      foundDays.push(WEEKDAYS_ENGLISH[todayIndex]);
    }
    
    text = remainingWords.join(' ').trim();
  }

  // Re-join remaining words to form the clean task title
  let cleanTitle = text.replace(/\s+/g, ' ').trim();

  // If title became empty due to removal of everything, reset it to original text
  if (!cleanTitle) {
    cleanTitle = inputText;
  }

  return {
    title: cleanTitle,
    plannerType,
    days: foundDays,
    time: foundTime,
    month: foundMonth,
    year: foundYear,
    assignee: foundAssignee
  };
}
