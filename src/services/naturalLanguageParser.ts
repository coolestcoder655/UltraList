import type { Priority } from "../types";

export interface ParsedTaskData {
  cleanTitle: string;
  dueDate?: string;
  priority?: Priority;
  tags?: string[];
  hasTimeSpecified?: boolean;
}

export interface ParseResult {
  parsed: ParsedTaskData;
  suggestions: string[];
}

/**
 * Natural language parser for task input
 * Extracts dates, times, priorities, and cleans up the task title
 */
export class NaturalLanguageParser {
  private static readonly DATE_PATTERNS = {
    // Relative dates
    today: /\b(today)\b/i,
    tomorrow: /\b(tomorrow)\b/i,
    nextWeek: /\b(next week)\b/i,
    
    // Days of week
    monday: /\b(next\s+)?monday\b/i,
    tuesday: /\b(next\s+)?tuesday\b/i,
    wednesday: /\b(next\s+)?wednesday\b/i,
    thursday: /\b(next\s+)?thursday\b/i,
    friday: /\b(next\s+)?friday\b/i,
    saturday: /\b(next\s+)?saturday\b/i,
    sunday: /\b(next\s+)?sunday\b/i,
    
    // Specific date formats
    dateSlash: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
    dateDash: /\b(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?\b/,
  };

  private static readonly TIME_PATTERNS = {
    // 12-hour format
    time12: /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i,
    // 24-hour format
    time24: /\b(\d{1,2}):(\d{2})\b/,
    // At time indicators
    atTime: /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i,
  };

  private static readonly PRIORITY_PATTERNS = {
    high: /\b(urgent|important|asap|high priority|critical)\b/i,
    low: /\b(low priority|when i can|sometime|eventually)\b/i,
  };

  private static readonly REMINDER_PATTERNS = {
    remind: /\b(remind me to|reminder to|don't forget to)\b/i,
  };

  /**
   * Parse natural language input and extract task components
   */
  public static parse(input: string): ParseResult {
    const suggestions: string[] = [];
    let cleanTitle = input.trim();
    const parsed: ParsedTaskData = {
      cleanTitle,
    };

    // Extract date information
    const dateResult = this.extractDate(cleanTitle);
    if (dateResult.date) {
      parsed.dueDate = dateResult.date;
      cleanTitle = dateResult.cleanText;
      suggestions.push(`📅 Due date set to: ${new Date(dateResult.date).toLocaleDateString()}`);
    }

    // Extract time information  
    const timeResult = this.extractTime(cleanTitle);
    if (timeResult.time && parsed.dueDate) {
      // Combine date and time
      const dateTime = new Date(parsed.dueDate);
      const [hours, minutes] = timeResult.time.split(':').map(Number);
      dateTime.setHours(hours, minutes, 0, 0);
      parsed.dueDate = dateTime.toISOString().split('T')[0]; // Keep as date for now
      parsed.hasTimeSpecified = true;
      cleanTitle = timeResult.cleanText;
      suggestions.push(`⏰ Time set to: ${timeResult.time}`);
    }

    // Extract priority
    const priorityResult = this.extractPriority(cleanTitle);
    if (priorityResult.priority) {
      parsed.priority = priorityResult.priority;
      cleanTitle = priorityResult.cleanText;
      suggestions.push(`⭐ Priority set to: ${priorityResult.priority}`);
    }

    // Clean up reminder language
    const reminderResult = this.cleanReminderLanguage(cleanTitle);
    cleanTitle = reminderResult.cleanText;
    if (reminderResult.wasReminder) {
      suggestions.push("🔔 Reminder language detected and cleaned");
    }

    // Final cleanup
    cleanTitle = this.finalCleanup(cleanTitle);
    parsed.cleanTitle = cleanTitle;

    return {
      parsed,
      suggestions
    };
  }

  private static extractDate(text: string): { date?: string; cleanText: string } {
    let cleanText = text;
    let date: string | undefined;

    // Check relative dates first
    if (this.DATE_PATTERNS.today.test(text)) {
      date = new Date().toISOString().split('T')[0];
      cleanText = cleanText.replace(this.DATE_PATTERNS.today, '').trim();
    } else if (this.DATE_PATTERNS.tomorrow.test(text)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
      cleanText = cleanText.replace(this.DATE_PATTERNS.tomorrow, '').trim();
    }

    // Check days of week
    if (!date) {
      const dayPatterns = [
        { pattern: this.DATE_PATTERNS.monday, day: 1 },
        { pattern: this.DATE_PATTERNS.tuesday, day: 2 },
        { pattern: this.DATE_PATTERNS.wednesday, day: 3 },
        { pattern: this.DATE_PATTERNS.thursday, day: 4 },
        { pattern: this.DATE_PATTERNS.friday, day: 5 },
        { pattern: this.DATE_PATTERNS.saturday, day: 6 },
        { pattern: this.DATE_PATTERNS.sunday, day: 0 },
      ];

      for (const { pattern, day } of dayPatterns) {
        const match = text.match(pattern);
        if (match) {
          const targetDate = this.getNextWeekday(day);
          date = targetDate.toISOString().split('T')[0];
          cleanText = cleanText.replace(pattern, '').trim();
          break;
        }
      }
    }

    // Check specific date formats
    if (!date) {
      const slashMatch = text.match(this.DATE_PATTERNS.dateSlash);
      if (slashMatch) {
        const [, month, day, year] = slashMatch;
        const currentYear = new Date().getFullYear();
        const fullYear = year ? (year.length === 2 ? 2000 + parseInt(year) : parseInt(year)) : currentYear;
        date = new Date(fullYear, parseInt(month) - 1, parseInt(day)).toISOString().split('T')[0];
        cleanText = cleanText.replace(this.DATE_PATTERNS.dateSlash, '').trim();
      }
    }

    return { date, cleanText };
  }

  private static extractTime(text: string): { time?: string; cleanText: string } {
    let cleanText = text;
    let time: string | undefined;

    // Check 12-hour format with at
    const atTimeMatch = text.match(this.TIME_PATTERNS.atTime);
    if (atTimeMatch) {
      const [, hours, minutes = '00', period] = atTimeMatch;
      const hour24 = this.convertTo24Hour(parseInt(hours), period || 'am');
      time = `${hour24.toString().padStart(2, '0')}:${minutes}`;
      cleanText = cleanText.replace(this.TIME_PATTERNS.atTime, '').trim();
      return { time, cleanText };
    }

    // Check 12-hour format
    const time12Match = text.match(this.TIME_PATTERNS.time12);
    if (time12Match) {
      const [, hours, minutes = '00', period] = time12Match;
      const hour24 = this.convertTo24Hour(parseInt(hours), period);
      time = `${hour24.toString().padStart(2, '0')}:${minutes}`;
      cleanText = cleanText.replace(this.TIME_PATTERNS.time12, '').trim();
    }

    // Check 24-hour format
    if (!time) {
      const time24Match = text.match(this.TIME_PATTERNS.time24);
      if (time24Match) {
        const [, hours, minutes] = time24Match;
        // Validate time
        const h = parseInt(hours);
        const m = parseInt(minutes);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          time = `${h.toString().padStart(2, '0')}:${minutes}`;
          cleanText = cleanText.replace(this.TIME_PATTERNS.time24, '').trim();
        }
      }
    }

    return { time, cleanText };
  }

  private static extractPriority(text: string): { priority?: Priority; cleanText: string } {
    let cleanText = text;
    let priority: Priority | undefined;

    if (this.PRIORITY_PATTERNS.high.test(text)) {
      priority = 'high';
      cleanText = cleanText.replace(this.PRIORITY_PATTERNS.high, '').trim();
    } else if (this.PRIORITY_PATTERNS.low.test(text)) {
      priority = 'low';
      cleanText = cleanText.replace(this.PRIORITY_PATTERNS.low, '').trim();
    }

    return { priority, cleanText };
  }

  private static cleanReminderLanguage(text: string): { cleanText: string; wasReminder: boolean } {
    const wasReminder = this.REMINDER_PATTERNS.remind.test(text);
    const cleanText = text.replace(this.REMINDER_PATTERNS.remind, '').trim();
    return { cleanText, wasReminder };
  }

  private static finalCleanup(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word chars
      .trim();
  }

  private static getNextWeekday(targetDay: number): Date {
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntilTarget = targetDay - currentDay;
    
    // If target day is today or has passed this week, get next week's occurrence
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate;
  }

  private static convertTo24Hour(hour: number, period: string): number {
    if (period.toLowerCase() === 'pm' && hour !== 12) {
      return hour + 12;
    }
    if (period.toLowerCase() === 'am' && hour === 12) {
      return 0;
    }
    return hour;
  }
}