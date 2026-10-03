/**
 * Advanced Worldwide Timezone Service
 * Accurately detects client timezone, calculates UTC+ and UTC- offsets,
 * converts between client time and user calendar time, and produces
 * highlighted dual-timezone labels for worldwide appointments.
 */

export interface DetectedTimezone {
  name: string;
  utcOffsetMinutes: number; // e.g. +360 for UTC+6, -240 for UTC-4
  utcOffsetFormatted: string; // e.g. "UTC+6", "UTC-4", "UTC+5:30"
  source: 'explicit_offset' | 'code' | 'region' | 'user_default';
  label: string; // e.g. "EST (UTC-5)"
}

export interface DualTimezoneInfo {
  dateIso: string;
  userTimeFormatted: string;
  userTimezone: string;
  userUtcOffset: string;
  clientTimeFormatted: string;
  clientTimezone: string;
  clientUtcOffset: string;
  highlightedBadge: string;
  summarySentence: string;
  isCrossTimezone: boolean;
}

const KNOWN_TIMEZONE_OFFSETS: Record<string, { minutes: number; label: string; name: string }> = {
  utc: { minutes: 0, label: 'UTC (UTC+0)', name: 'Etc/UTC' },
  gmt: { minutes: 0, label: 'GMT (UTC+0)', name: 'Etc/GMT' },
  // North America
  est: { minutes: -300, label: 'EST (UTC-5)', name: 'America/New_York' },
  edt: { minutes: -240, label: 'EDT (UTC-4)', name: 'America/New_York' },
  cst: { minutes: -360, label: 'CST (UTC-6)', name: 'America/Chicago' },
  cdt: { minutes: -300, label: 'CDT (UTC-5)', name: 'America/Chicago' },
  mst: { minutes: -420, label: 'MST (UTC-7)', name: 'America/Denver' },
  mdt: { minutes: -360, label: 'MDT (UTC-6)', name: 'America/Denver' },
  pst: { minutes: -480, label: 'PST (UTC-8)', name: 'America/Los_Angeles' },
  pdt: { minutes: -420, label: 'PDT (UTC-7)', name: 'America/Los_Angeles' },
  ast: { minutes: -240, label: 'AST (UTC-4)', name: 'America/Halifax' },
  // Europe
  bst: { minutes: 60, label: 'BST (UTC+1)', name: 'Europe/London' },
  cet: { minutes: 60, label: 'CET (UTC+1)', name: 'Europe/Paris' },
  cest: { minutes: 120, label: 'CEST (UTC+2)', name: 'Europe/Berlin' },
  eet: { minutes: 120, label: 'EET (UTC+2)', name: 'Europe/Helsinki' },
  eest: { minutes: 180, label: 'EEST (UTC+3)', name: 'Europe/Athens' },
  wet: { minutes: 0, label: 'WET (UTC+0)', name: 'Europe/Lisbon' },
  // Asia & Middle East
  gst: { minutes: 240, label: 'GST (UTC+4, Dubai)', name: 'Asia/Dubai' },
  pkt: { minutes: 300, label: 'PKT (UTC+5)', name: 'Asia/Karachi' },
  ist: { minutes: 330, label: 'IST (UTC+5:30)', name: 'Asia/Kolkata' },
  bdt: { minutes: 360, label: 'BDT (UTC+6, Bangladesh)', name: 'Asia/Dhaka' },
  bst_bd: { minutes: 360, label: 'BST (UTC+6, Bangladesh)', name: 'Asia/Dhaka' },
  ict: { minutes: 420, label: 'ICT (UTC+7, Bangkok)', name: 'Asia/Bangkok' },
  sgt: { minutes: 480, label: 'SGT (UTC+8, Singapore)', name: 'Asia/Singapore' },
  hkt: { minutes: 480, label: 'HKT (UTC+8, Hong Kong)', name: 'Asia/Hong_Kong' },
  cst_china: { minutes: 480, label: 'CST (UTC+8, China)', name: 'Asia/Shanghai' },
  jst: { minutes: 540, label: 'JST (UTC+9, Tokyo)', name: 'Asia/Tokyo' },
  kst: { minutes: 540, label: 'KST (UTC+9, Seoul)', name: 'Asia/Seoul' },
  // Australia & Pacific
  aest: { minutes: 600, label: 'AEST (UTC+10, Sydney)', name: 'Australia/Sydney' },
  aedt: { minutes: 660, label: 'AEDT (UTC+11, Sydney)', name: 'Australia/Sydney' },
  nzst: { minutes: 720, label: 'NZST (UTC+12, Auckland)', name: 'Pacific/Auckland' },
  nzdt: { minutes: 780, label: 'NZDT (UTC+13, Auckland)', name: 'Pacific/Auckland' },
};

export class TimezoneService {
  /**
   * Get host / user's system timezone identifier (e.g. "Asia/Dhaka")
   */
  static getUserTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC';
    } catch {
      return 'Etc/UTC';
    }
  }

  /**
   * Get host's current UTC offset in minutes
   */
  static getUserUtcOffsetMinutes(): number {
    return -new Date().getTimezoneOffset();
  }

  /**
   * Format minutes offset into string e.g. "UTC+6", "UTC-4", "UTC+5:30"
   */
  static formatOffset(offsetMinutes: number): string {
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    if (mins === 0) {
      return `UTC${sign}${hours}`;
    }
    return `UTC${sign}${hours}:${mins < 10 ? '0' : ''}${mins}`;
  }

  /**
   * Format host user's UTC offset
   */
  static getUserUtcOffsetFormatted(): string {
    return this.formatOffset(this.getUserUtcOffsetMinutes());
  }

  /**
   * Detect client's timezone from email subject, body, or client metadata
   */
  static detectClientTimezone(text: string): DetectedTimezone {
    const lower = text.toLowerCase();

    // 1. Explicit UTC / GMT offset match: "UTC+6", "UTC-5", "GMT+2", "UTC+06:00", "UTC+5:30"
    const explicitMatch = lower.match(/\b(utc|gmt)\s*([+-])\s*(\d{1,2})(?::(\d{2}))?\b/i);
    if (explicitMatch) {
      const sign = explicitMatch[2] === '-' ? -1 : 1;
      const hours = parseInt(explicitMatch[3], 10);
      const mins = explicitMatch[4] ? parseInt(explicitMatch[4], 10) : 0;
      const totalMinutes = sign * (hours * 60 + mins);
      const formatted = this.formatOffset(totalMinutes);
      return {
        name: `Etc/GMT${sign >= 0 ? '-' : '+'}${hours}`, // Note: Etc/GMT signs are inverted in POSIX
        utcOffsetMinutes: totalMinutes,
        utcOffsetFormatted: formatted,
        source: 'explicit_offset',
        label: `${formatted}`,
      };
    }

    // 2. Exact standard timezone codes (EST, PST, BST, IST, JST, etc.)
    const tzWords = lower.match(/\b(utc|gmt|est|edt|cst|cdt|mst|mdt|pst|pdt|bst|cet|cest|eet|eest|wet|gst|pkt|ist|bdt|ict|sgt|hkt|jst|kst|aest|aedt|nzst|nzdt)\b/);
    if (tzWords && tzWords[1]) {
      const code = tzWords[1];
      const match = KNOWN_TIMEZONE_OFFSETS[code];
      if (match) {
        return {
          name: match.name,
          utcOffsetMinutes: match.minutes,
          utcOffsetFormatted: this.formatOffset(match.minutes),
          source: 'code',
          label: `${code.toUpperCase()} (${this.formatOffset(match.minutes)})`,
        };
      }
    }

    // 3. City / Regional keywords in email
    if (lower.includes('bangladesh') || lower.includes('dhaka') || lower.includes('bd time')) {
      return {
        name: 'Asia/Dhaka',
        utcOffsetMinutes: 360,
        utcOffsetFormatted: 'UTC+6',
        source: 'region',
        label: 'BDT (UTC+6, Bangladesh)',
      };
    }
    if (lower.includes('london') || lower.includes('uk time') || lower.includes('britain')) {
      return {
        name: 'Europe/London',
        utcOffsetMinutes: 60,
        utcOffsetFormatted: 'UTC+1',
        source: 'region',
        label: 'BST (UTC+1, London)',
      };
    }
    if (lower.includes('new york') || lower.includes('nyc') || lower.includes('eastern time')) {
      return {
        name: 'America/New_York',
        utcOffsetMinutes: -240,
        utcOffsetFormatted: 'UTC-4',
        source: 'region',
        label: 'EDT (UTC-4, New York)',
      };
    }
    if (lower.includes('california') || lower.includes('pacific time') || lower.includes('los angeles') || lower.includes('san francisco')) {
      return {
        name: 'America/Los_Angeles',
        utcOffsetMinutes: -420,
        utcOffsetFormatted: 'UTC-7',
        source: 'region',
        label: 'PDT (UTC-7, California)',
      };
    }
    if (lower.includes('india') || lower.includes('delhi') || lower.includes('mumbai') || lower.includes('ist time')) {
      return {
        name: 'Asia/Kolkata',
        utcOffsetMinutes: 330,
        utcOffsetFormatted: 'UTC+5:30',
        source: 'region',
        label: 'IST (UTC+5:30, India)',
      };
    }
    if (lower.includes('dubai') || lower.includes('uae')) {
      return {
        name: 'Asia/Dubai',
        utcOffsetMinutes: 240,
        utcOffsetFormatted: 'UTC+4',
        source: 'region',
        label: 'GST (UTC+4, Dubai)',
      };
    }
    if (lower.includes('tokyo') || lower.includes('japan')) {
      return {
        name: 'Asia/Tokyo',
        utcOffsetMinutes: 540,
        utcOffsetFormatted: 'UTC+9',
        source: 'region',
        label: 'JST (UTC+9, Tokyo)',
      };
    }
    if (lower.includes('sydney') || lower.includes('australia')) {
      return {
        name: 'Australia/Sydney',
        utcOffsetMinutes: 600,
        utcOffsetFormatted: 'UTC+10',
        source: 'region',
        label: 'AEST (UTC+10, Sydney)',
      };
    }

    // Default fallback: host user's timezone
    const userOffset = this.getUserUtcOffsetMinutes();
    const userFormatted = this.formatOffset(userOffset);
    return {
      name: this.getUserTimezone(),
      utcOffsetMinutes: userOffset,
      utcOffsetFormatted: userFormatted,
      source: 'user_default',
      label: userFormatted,
    };
  }

  /**
   * Format a date into a specific timezone offset
   */
  static formatInOffset(date: Date, offsetMinutes: number): { dateStr: string; timeStr: string; full: string } {
    // Shift date by offset difference to UTC
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    const targetTime = new Date(utcTime + offsetMinutes * 60000);

    const dateStr = targetTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = targetTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      dateStr,
      timeStr,
      full: `${dateStr} at ${timeStr}`,
    };
  }

  /**
   * Generate prominent Dual-Timezone representation for worldwide coordination
   */
  static formatDualTimezone(
    dateInput: Date | string,
    clientContextText?: string,
    customClientTz?: DetectedTimezone
  ): DualTimezoneInfo {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const userTzName = this.getUserTimezone();
    const userOffsetMinutes = this.getUserUtcOffsetMinutes();
    const userUtcFormatted = this.formatOffset(userOffsetMinutes);

    const clientTz =
      customClientTz || (clientContextText ? this.detectClientTimezone(clientContextText) : null);

    const clientOffsetMinutes = clientTz ? clientTz.utcOffsetMinutes : userOffsetMinutes;
    const clientUtcFormatted = clientTz ? clientTz.utcOffsetFormatted : userUtcFormatted;
    const isCrossTimezone = clientOffsetMinutes !== userOffsetMinutes;

    const userFormatted = this.formatInOffset(date, userOffsetMinutes);
    const clientFormatted = this.formatInOffset(date, clientOffsetMinutes);

    const highlightedBadge = isCrossTimezone
      ? `${clientFormatted.timeStr} [${clientUtcFormatted}] / ${userFormatted.timeStr} [${userUtcFormatted}]`
      : `${userFormatted.timeStr} [${userUtcFormatted}]`;

    const summarySentence = isCrossTimezone
      ? `${clientFormatted.full} (${clientUtcFormatted} • Client Time) / ${userFormatted.full} (${userUtcFormatted} • Host Time)`
      : `${userFormatted.full} (${userUtcFormatted})`;

    return {
      dateIso: date.toISOString(),
      userTimeFormatted: `${userFormatted.full} (${userUtcFormatted})`,
      userTimezone: userTzName,
      userUtcOffset: userUtcFormatted,
      clientTimeFormatted: `${clientFormatted.full} (${clientUtcFormatted})`,
      clientTimezone: clientTz?.label || clientUtcFormatted,
      clientUtcOffset: clientUtcFormatted,
      highlightedBadge,
      summarySentence,
      isCrossTimezone,
    };
  }

  /**
   * When client proposes a time in their own timezone (e.g. "4pm EST"),
   * accurately convert it to the host machine's ISO date string.
   */
  static convertClientProposedTimeToUtc(
    targetDate: Date,
    clientOffsetMinutes: number
  ): { startIso: string; endIso: string; displayLabel: string; dualInfo: DualTimezoneInfo } {
    // targetDate currently has hours/minutes set as if they were local machine time
    // We treat hours/minutes as client's local time and shift into real UTC
    const userLocalOffset = -targetDate.getTimezoneOffset(); // in minutes
    const diffMinutes = userLocalOffset - clientOffsetMinutes;

    // Shift date by difference so UTC time reflects client's actual proposed hour
    const adjustedDate = new Date(targetDate.getTime() + diffMinutes * 60000);
    const endDate = new Date(adjustedDate.getTime() + 30 * 60000);

    const dualInfo = this.formatDualTimezone(adjustedDate, '', {
      name: 'Client',
      utcOffsetMinutes: clientOffsetMinutes,
      utcOffsetFormatted: this.formatOffset(clientOffsetMinutes),
      source: 'code',
      label: this.formatOffset(clientOffsetMinutes),
    });

    return {
      startIso: adjustedDate.toISOString(),
      endIso: endDate.toISOString(),
      displayLabel: dualInfo.summarySentence,
      dualInfo,
    };
  }
}
