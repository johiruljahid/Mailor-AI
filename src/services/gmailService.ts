/**
 * Gmail Service for Mailora AI
 * Handles OAuth-backed Gmail API interactions with least-privilege scopes
 * and safe fallback for demo/sandbox mode.
 */

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
}

export interface InboundEmailItem {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
}

export class GmailService {
  private static cachedToken: string | null = null;

  static setAccessToken(token: string | null) {
    this.cachedToken = token;
  }

  static getAccessToken(): string | null {
    return this.cachedToken;
  }

  /**
   * Fetch current authenticated user's Gmail profile
   */
  static async getProfile(accessToken?: string): Promise<GmailProfile> {
    const token = accessToken || this.cachedToken;
    if (!token || token.startsWith('demo_')) {
      return {
        emailAddress: 'johirul4856@gmail.com',
        messagesTotal: 1842,
        threadsTotal: 960,
        historyId: '89104',
      };
    }

    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('Gmail API getProfile notice:', err);
      return {
        emailAddress: 'johirul4856@gmail.com',
        messagesTotal: 1200,
        threadsTotal: 650,
        historyId: '1001',
      };
    }
  }

  /**
   * Fetch unread inbox messages from the connected Gmail account for automatic background replies
   */
  static async fetchUnreadEmails(maxResults: number = 5, accessToken?: string): Promise<InboundEmailItem[]> {
    const token = accessToken || this.cachedToken;
    if (!token || token.startsWith('demo_')) {
      return [];
    }

    try {
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:unread in:inbox`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (!listRes.ok) {
        console.warn(`Gmail API list unread error: ${listRes.status}`);
        return [];
      }

      const listData = await listRes.json();
      const messages: InboundEmailItem[] = [];

      if (!listData.messages || listData.messages.length === 0) {
        return messages;
      }

      for (const msgRef of listData.messages.slice(0, maxResults)) {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }
          );

          if (detailRes.ok) {
            const detail = await detailRes.json();
            const headers = detail.payload?.headers || [];
            const getHeader = (name: string) =>
              headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

            const fromHeader = getHeader('From');
            let fromEmail = fromHeader;
            let fromName = fromHeader;
            const match = fromHeader.match(/^(.*?)\s*<([^>]+)>/);
            if (match) {
              fromName = match[1].replace(/["']/g, '').trim() || match[2];
              fromEmail = match[2].trim();
            }

            let bodyText = detail.snippet || '';
            const findBody = (part: any): string => {
              if (part.mimeType === 'text/plain' && part.body?.data) {
                try {
                  return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                } catch {
                  return '';
                }
              }
              if (part.parts) {
                for (const p of part.parts) {
                  const b = findBody(p);
                  if (b) return b;
                }
              }
              return '';
            };

            const extracted = findBody(detail.payload);
            if (extracted) {
              bodyText = extracted;
            }

            messages.push({
              id: detail.id,
              threadId: detail.threadId || detail.id,
              from: fromEmail,
              fromName: fromName || fromEmail.split('@')[0],
              subject: getHeader('Subject') || '(No Subject)',
              snippet: detail.snippet || bodyText.slice(0, 100),
              body: bodyText,
              date: getHeader('Date') || 'Recently',
            });
          }
        } catch (detailErr) {
          console.warn('Error reading single message detail:', detailErr);
        }
      }

      return messages;
    } catch (err) {
      console.warn('Gmail fetchUnreadEmails error:', err);
      return [];
    }
  }

  /**
   * Mark an email message as read by removing the UNREAD label in Gmail
   */
  static async markAsRead(messageId: string, accessToken?: string): Promise<boolean> {
    const token = accessToken || this.cachedToken;
    if (!token || token.startsWith('demo_')) {
      return true;
    }

    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removeLabelIds: ['UNREAD'],
        }),
      });

      return res.ok;
    } catch (e) {
      console.warn('Failed to mark message as read in Gmail:', e);
      return false;
    }
  }

  /**
   * Fetch recent inbox messages from the connected Gmail account
   */
  static async fetchRecentEmails(maxResults: number = 5, accessToken?: string): Promise<InboundEmailItem[]> {
    const token = accessToken || this.cachedToken;

    if (!token || token.startsWith('demo_')) {
      // Return realistic initial customer inquiries for immediate demonstration
      return [
        {
          id: `gmail_msg_${Date.now()}_1`,
          threadId: `gmail_thr_${Date.now()}_1`,
          from: 'sarah.connor@cyberdyne.co',
          fromName: 'Sarah Connor',
          subject: 'Question regarding custom web development timeline and initial deposit',
          snippet: 'Hello Mailora team, We are reviewing your Starter vs Growth web packages and would love to confirm if the 14-day refund guarantee applies to both...',
          body: 'Hello Mailora team,\n\nWe are reviewing your Starter vs Growth web packages and would love to confirm if the 14-day refund guarantee applies to both. Also, what is your standard turnaround time for a 5-page site?\n\nLooking forward to hearing from you,\nSarah Connor\nVP of Operations',
          date: '10 mins ago',
        },
        {
          id: `gmail_msg_${Date.now()}_2`,
          threadId: `gmail_thr_${Date.now()}_2`,
          from: 'david.kim@apexventures.io',
          fromName: 'David Kim',
          subject: 'Enterprise SLA & Monthly Retainer Consultation',
          snippet: 'Hi there, Do you provide dedicated Slack connect channels and 1-hour critical response SLAs for maintenance retainers?',
          body: 'Hi there,\n\nDo you provide dedicated Slack connect channels and 1-hour critical response SLAs for maintenance retainers? We have an existing React and Node application that requires 24/7 reliability.\n\nBest,\nDavid Kim',
          date: '25 mins ago',
        }
      ];
    }

    try {
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (!listRes.ok) {
        throw new Error(`Failed to list Gmail messages: ${listRes.status}`);
      }

      const listData = await listRes.json();
      const messages: InboundEmailItem[] = [];

      if (!listData.messages || listData.messages.length === 0) {
        return messages;
      }

      for (const msgRef of listData.messages.slice(0, maxResults)) {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }
          );

          if (detailRes.ok) {
            const detail = await detailRes.json();
            const headers = detail.payload?.headers || [];
            const getHeader = (name: string) =>
              headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

            const fromHeader = getHeader('From');
            let fromEmail = fromHeader;
            let fromName = fromHeader;
            const match = fromHeader.match(/^(.*?)\s*<([^>]+)>/);
            if (match) {
              fromName = match[1].replace(/["']/g, '').trim() || match[2];
              fromEmail = match[2].trim();
            }

            // Extract plain text body
            let bodyText = detail.snippet || '';
            const findBody = (part: any): string => {
              if (part.mimeType === 'text/plain' && part.body?.data) {
                try {
                  return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                } catch {
                  return '';
                }
              }
              if (part.parts) {
                for (const p of part.parts) {
                  const b = findBody(p);
                  if (b) return b;
                }
              }
              return '';
            };

            const extracted = findBody(detail.payload);
            if (extracted) {
              bodyText = extracted;
            }

            messages.push({
              id: detail.id,
              threadId: detail.threadId || detail.id,
              from: fromEmail,
              fromName: fromName || fromEmail.split('@')[0],
              subject: getHeader('Subject') || '(No Subject)',
              snippet: detail.snippet || bodyText.slice(0, 100),
              body: bodyText,
              date: getHeader('Date') || 'Recently',
            });
          }
        } catch (detailErr) {
          console.warn('Error reading single message detail:', detailErr);
        }
      }

      return messages;
    } catch (err) {
      console.warn('Gmail fetchRecentEmails API notice:', err);
      return [];
    }
  }

  /**
   * Send an email or thread reply using the Gmail API
   * Uses RFC 2822 base64 encoded format
   */
  static async sendEmail(payload: SendEmailPayload, accessToken?: string): Promise<{ success: boolean; messageId: string }> {
    const token = accessToken || this.cachedToken;

    if (!token || token.startsWith('demo_')) {
      // Simulation mode
      await new Promise(r => setTimeout(r, 600));
      return {
        success: true,
        messageId: `demo_msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      };
    }

    // Construct raw RFC 2822 message
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`;
    const messageParts = [
      `To: ${payload.to}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0',
    ];

    if (payload.inReplyTo) {
      messageParts.push(`In-Reply-To: ${payload.inReplyTo}`);
      messageParts.push(`References: ${payload.inReplyTo}`);
    }

    messageParts.push('', payload.body);
    const rawMessage = messageParts.join('\r\n');

    // Base64URL encode
    const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const bodyData: any = { raw: encodedMessage };
    if (payload.threadId && !payload.threadId.startsWith('thr_')) {
      bodyData.threadId = payload.threadId;
    }

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email via Gmail API: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
    };
  }
}
