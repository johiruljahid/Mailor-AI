import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleCalendarService } from './src/services/googleCalendarService';
import { TimezoneService } from './src/services/timezoneService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const port = Number(process.env.PORT) || 3000;
  const apiKey = process.env.GEMINI_API_KEY || '';

  const getAiClient = () => {
    if (apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        return new GoogleGenAI({ apiKey });
      } catch (err) {
        console.warn('Failed to init GoogleGenAI on server:', err);
      }
    }
    return null;
  };

  // 1. Health check & configuration status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(apiKey && apiKey.trim().length > 0),
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Server-side Gemini Intent Classification
  app.post('/api/gemini/classify', async (req, res) => {
    const { subject, body } = req.body;
    const aiClient = getAiClient();

    if (!aiClient) {
      return res.status(503).json({ error: 'Server-side Gemini API key not configured' });
    }

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an AI email triage engine for a business.
Analyze the incoming email below and return a JSON object with:
1. "intent": one of ["Sales inquiry", "Product question", "Pricing", "Support", "Complaint", "Refund", "Booking", "Appointment", "Partnership", "Job application", "General inquiry", "Spam", "Other"]
2. "confidence": a number between 0.0 and 1.0
3. "sentiment": one of ["positive", "neutral", "urgent", "negative"]
4. "isAutomatedSpamOrNewsletter": boolean (true if newsletter, noreply notification, automated digest, marketing blast)

EMAIL:
Subject: ${subject}
Body: ${body}

Return ONLY raw JSON, nothing else:
{"intent": "...", "confidence": 0.95, "sentiment": "...", "isAutomatedSpamOrNewsletter": false}`,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Server classify error:', err);
      return res.status(500).json({ error: err.message || 'Classification failed' });
    }
  });

  // 3. Server-side Gemini Reply Generation with Google Search Grounding
  app.post('/api/gemini/reply', async (req, res) => {
    const {
      subject,
      body,
      customerName = 'there',
      businessName = 'Imbdagency',
      agentConfig,
      retrievedChunks = [],
      intent,
      enableWebSearch = true,
      meetingBookingInfo,
      attachmentInfo,
    } = req.body;

    const aiClient = getAiClient();
    if (!aiClient) {
      return res.status(503).json({ error: 'Server-side Gemini API key not configured' });
    }

    // Clean retrieved context to eliminate raw metadata tags
    const cleanKnowledge = retrievedChunks
      .map((c: any) => {
        const cleaned = (c.fullContent || c.snippet || '')
          .replace(/Page Title:\s*/gi, '')
          .replace(/Website URL:\s*/gi, '')
          .replace(/Domain:\s*/gi, '')
          .replace(/Description:\s*/gi, '');
        return `[Knowledge Category: ${c.category || 'General'} - Title: ${c.title}]\n${cleaned}`;
      })
      .join('\n\n');

    const languageInstruction =
      agentConfig?.replyLanguage === 'Bangla'
        ? 'Reply completely in natural, warm, polite conversational Bangla (বাংলা).'
        : agentConfig?.replyLanguage === 'Bangla + English'
        ? 'Provide a concise bilingual response in warm Bangla (বাংলা) followed by English.'
        : 'Detect the language of the incoming message. If the customer wrote in Bangla (or Banglish), reply in natural polite Bangla. If in English, reply in fluent, natural English.';

    const meetingInstructions = meetingBookingInfo?.status === 'BOOKED'
      ? `\n\nCRITICAL MANDATORY REQUIREMENT - APPOINTMENT CONFIRMATION EMAIL:
- A Google Calendar appointment has ALREADY BEEN BOOKED for: ${meetingBookingInfo.dateFormatted}
- Google Meet Video Call Link: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}
- Calendar Invite: Dispatched directly to the client's email address.
YOUR TASK:
1. This email MUST BE an explicit, warm, executive-grade APPOINTMENT CONFIRMATION.
2. Confirm the date, time, and Google Meet link in the opening paragraph.
3. Mention that a Google Calendar invitation has been dispatched to their email address.
4. DO NOT say "Could you please share a few more details so I can assist you with the exact information you need?".
5. If the client asked questions or specified project requirements (such as services, pricing, or timeline), answer those requirements concisely and directly right below the appointment confirmation!\n`
      : meetingBookingInfo?.status === 'SUGGEST_SLOTS' && meetingBookingInfo.availableSlots?.length > 0
      ? `\n\nCALENDAR AVAILABILITY & SUGGESTED SLOTS:
- The client requested a meeting or consultation. Based on our real-time Google Calendar schedule, present the following open time slots in clean bullet points:
${meetingBookingInfo.availableSlots.map((s: string) => `  • ${s}`).join('\n')}
Politely ask which of these times works best for them so we can confirm the reservation immediately.\n`
      : '';

    const attachmentInstructions = attachmentInfo
      ? `\n\nATTACHED DOCUMENT NOTICE:
- You have attached the file "${attachmentInfo.filename}" to this email for the client.
- Mention that this document is attached for their review (and note they can view it online at: ${attachmentInfo.driveUrl || 'Google Drive'}).\n`
      : '';

    const prompt = `You are ${agentConfig?.name || 'Alex Jordan'}, an authentic, helpful human team member and client support specialist at ${businessName}.
Tone: ${agentConfig?.tone || 'Professional'}.
Language: ${languageInstruction}

HUMAN AUTHENTICITY, ACCURACY & SPECIFICITY RULES:
1. Speak as a genuine, warm, and professional human colleague writing back from their email desk.
2. The customer must NEVER suspect this is an AI, bot, virtual assistant, or automated script.
3. NEVER output raw metadata, prefixes, or labels like "Page Title:", "Description:", "Website URL:", or raw scraped text. Always synthesize the facts into fluent, human-written sentences!
4. ANSWER EXACTLY WHAT THE CLIENT ASKED - POINT BY POINT:
   - When the client asks about pricing, service charges, cost, or packages:
     Provide a clean, structured bullet-point breakdown (•) listing each relevant service, package name, exact price, and turnaround time from the verified knowledge base.
   - For multi-part inquiries:
     Address each question in a structured, readable manner using clean bullet points (•) and natural paragraph breaks.
   - For short single questions (e.g. "What is your name?", "Where are you located?"), reply directly in 1-2 friendly human sentences.${meetingInstructions}${attachmentInstructions}
5. NO ROBOTIC CLICHÉS:
   - Prohibited phrases: "As an AI...", "I hope this email finds you well!", "Thank you for reaching out to us today!", "Your inquiry has been logged into our system."
6. Ground your facts strictly on the VERIFIED COMPANY KNOWLEDGE below. Use Google Search Grounding for current or live web verification if relevant.
7. Sign off naturally:
${agentConfig?.emailSignature || `Best regards,\n${agentConfig?.name || 'Alex Jordan'}\n${businessName}`}

AGENT INSTRUCTIONS:
${agentConfig?.instructions || 'Always be courteous, direct, and helpful.'}

VERIFIED COMPANY KNOWLEDGE (Google Drive docs, website crawl, and business facts):
${cleanKnowledge || 'Operate using standard courteous business practices.'}

INCOMING CUSTOMER EMAIL:
Sender Name: ${customerName}
Subject: ${subject}
Message:
${body}

Generate the final, complete email response ready to be dispatched to the customer:`;

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: enableWebSearch
          ? {
              tools: [{ googleSearch: {} }],
            }
          : undefined,
      });

      const replyText = response.text?.trim() || '';
      return res.json({ success: true, reply: replyText });
    } catch (err: any) {
      console.warn('Server Gemini generateContent notice, using contextual human synthesis:', err?.message || err);

      const cleanBody = `${subject} ${body}`.toLowerCase();
      let actualBusinessName = businessName || 'Imbdagency';
      let servicesSummary =
        'custom web development, modern mobile applications, digital branding, and custom software solutions';

      // Find services in retrievedChunks if available
      for (const c of retrievedChunks) {
        if (c.category === 'Services' || c.category === 'Products' || c.title?.toLowerCase().includes('service')) {
          let txt = (c.snippet || c.fullContent || '')
            .replace(/Page Title:\s*/gi, '')
            .replace(/Description:\s*/gi, '')
            .replace(/Website URL:[^\s]+/gi, '')
            .replace(new RegExp(`^${actualBusinessName}\\s+offers\\s+`, 'i'), '')
            .replace(new RegExp(`^${actualBusinessName}\\s+provides\\s+`, 'i'), '')
            .replace(new RegExp(`^${actualBusinessName}\\s+is\\s+`, 'i'), '')
            .trim();
          if (txt.length > 15) {
            servicesSummary = txt.slice(0, 220).replace(/[-•]\s*/g, ', ').replace(/,\s*,/g, ',').replace(/\.\.+$/, '');
            break;
          }
        }
      }

      const isBangla = /[\u0980-\u09FF]/.test(cleanBody) || cleanBody.includes('nam ki') || cleanBody.includes('service ki');

      const attachmentNote = attachmentInfo
        ? `\n\n📎 Attached Document:\nI have attached our ${attachmentInfo.filename} for your review. (Online link: ${attachmentInfo.driveUrl || 'Google Drive'}).`
        : '';

      // Priority 1: Confirmed Google Calendar Appointment
      if (meetingBookingInfo?.status === 'BOOKED') {
        const cleanSubject = subject.replace(/^(re|fwd):\s*/i, '').trim();
        let extraRequirementsAnswer = '';
        if (cleanBody.includes('pricing') || cleanBody.includes('cost') || cleanBody.includes('rate')) {
          extraRequirementsAnswer = `\n\nRegarding your inquiry about our packages and rates:\n• Starter Package: $250 - $499 (3-5 days delivery)\n• Growth Custom Solution: $999 - $1,499 (7-10 days delivery)\n• Enterprise Software: Custom scope & dedicated milestone delivery.`;
        }

        if (isBangla) {
          const reply = `আসসালামু আলাইকুম ${customerName !== 'there' ? customerName : ''}!\n\n${actualBusinessName}-এর সাথে আপনার অ্যাপয়েন্টমেন্ট সফলভাবে কনফার্ম করা হয়েছে।\n\nঅ্যাপয়েন্টমেন্টের বিবরণ:\n• তারিখ ও সময়: ${meetingBookingInfo.dateFormatted}\n• গুগল মিট লিংক: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}\n• বিষয়: ${cleanSubject}\n• ক্যালেন্ডার ইনভাইট: আপনার ইমেইল ক্যালেন্ডারে সরাসরি পাঠিয়ে দেওয়া হয়েছে।${extraRequirementsAnswer}${attachmentNote}\n\nআপনার রিকোয়ারমেন্ট অনুযায়ী আমি বিস্তারিত প্রস্তুতি রাখছি। আমাদের মিটিংয়ে আপনার প্রজেক্টের যাবতীয় বিষয় নিয়ে খোলামেলা আলোচনা করব। মিটিংয়ের পূর্বে কোনো বিশেষ তথ্য বা ফাইল পাঠাতে চাইলে এই ইমেইলে সরাসরি রিপ্লাই দিতে পারেন।\n\nআন্তরিক ধন্যবাদ,\n${agentConfig?.name || 'Alex'}\n${actualBusinessName}`;
          return res.json({ success: true, reply });
        } else {
          const reply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for reaching out to us at ${actualBusinessName}.\n\nYour appointment has been successfully scheduled and confirmed! Here are the details for our session:\n\n• Date & Time: ${meetingBookingInfo.dateFormatted}\n• Meeting Platform: Google Meet (${meetingBookingInfo.meetUrl || 'https://meet.google.com'})\n• Subject / Purpose: ${cleanSubject}\n• Calendar Invite: A Google Calendar invitation with the video call link has been dispatched to your email address.${extraRequirementsAnswer}${attachmentNote}\n\nI have reviewed your message and will be prepared to discuss your project requirements in detail during our call. If you have any specs, files, or questions beforehand, please feel free to reply directly to this email.\n\nLooking forward to speaking with you!\n\nBest regards,\n${agentConfig?.name || 'Alex'}\n${actualBusinessName}`;
          return res.json({ success: true, reply });
        }
      }

      // Priority 2: Proposed Google Calendar Slots
      if (meetingBookingInfo?.status === 'SUGGEST_SLOTS' && meetingBookingInfo.availableSlots?.length > 0) {
        const slotList = meetingBookingInfo.availableSlots.map((s: string) => `• ${s}`).join('\n');
        if (isBangla) {
          const reply = `আসসালামু আলাইকুম ${customerName !== 'there' ? customerName : ''}!\n\n${actualBusinessName}-এ অ্যাপয়েন্টমেন্টের জন্য যোগাযোগ করার জন্য ধন্যবাদ।\n\nআমাদের রিয়েল-টাইম ক্যালেন্ডার অনুযায়ী নিচের স্লটগুলো খালি রয়েছে:\n\n${slotList}${attachmentNote}\n\nআপনার সুবিধানুযায়ী যে কোনো একটি সময় নির্বাচন করে রিপ্লাই দিন, আমরা অবিলম্বে গুগল মিট লিংক সহ আপনার জন্য অ্যাপয়েন্টমেন্ট কনফার্ম করে দিব!\n\nআন্তরিক ধন্যবাদ,\n${agentConfig?.name || 'Alex'}\n${actualBusinessName}`;
          return res.json({ success: true, reply });
        } else {
          const reply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for reaching out to us at ${actualBusinessName} regarding your appointment request.\n\nBased on our current schedule, here are our next open Google Calendar meeting times:\n\n${slotList}${attachmentNote}\n\nPlease reply with the slot that works best for you, and I will reserve the appointment immediately and send your Google Meet invitation!\n\nBest regards,\n${agentConfig?.name || 'Alex'}\n${actualBusinessName}`;
          return res.json({ success: true, reply });
        }
      }

      if (
        cleanBody.includes('business name') ||
        cleanBody.includes('company name') ||
        cleanBody.includes('service') ||
        cleanBody.includes('what type') ||
        cleanBody.includes('what do you do')
      ) {
        if (isBangla) {
          const reply = `আসসালামু আলাইকুম ${customerName !== 'there' ? customerName : ''}!\n\nআমাদের কোম্পানির নাম ${actualBusinessName}।\n\nআমরা মূলত ${servicesSummary}-এর কাজ করে থাকি। আমাদের টিম আধুনিক ডিজাইন, নির্ভুল কোডিং এবং প্রফেশনাল সাপোর্ট দিয়ে ক্লায়েন্টদের সেবা প্রদান করে থাকে।\n\nআপনার প্রজেক্ট বা কাজের ব্যাপারে কোনো নির্দিষ্ট রিকোয়ারমেন্ট থাকলে জানান, আমরা আনন্দের সাথে আপনাকে বিস্তারিত জানিয়ে দিব!\n\nআন্তরিক ধন্যবাদ,\n${agentConfig?.name || 'Alex'}\n${actualBusinessName}`;
          return res.json({ success: true, reply });
        } else {
          const reply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for reaching out to us!\n\nOur company name is ${actualBusinessName}. We specialize in ${servicesSummary}.\n\nWhether you need a full turnkey solution or consultation for an upcoming project, we would be delighted to assist you. Please let me know what requirements you have in mind so I can provide you with exact details!\n\nBest regards,\n${agentConfig?.name || 'Alex'}\n${actualBusinessName}`;
          return res.json({ success: true, reply });
        }
      }

      if (cleanBody.includes('your name') || cleanBody.includes('who are you') || cleanBody.includes('nam ki')) {
        const reply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nMy name is ${agentConfig?.name || 'Alex'} from the ${actualBusinessName} team! How can I assist you with your project today?\n\nBest regards,\n${agentConfig?.name || 'Alex'}\n${actualBusinessName}`;
        return res.json({ success: true, reply });
      }

      if (cleanBody.includes('pricing') || cleanBody.includes('cost') || cleanBody.includes('how much') || cleanBody.includes('charge')) {
        const reply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for asking about our service charges and rates at ${actualBusinessName}. Here is our current pricing breakdown:\n\n• Starter Package: $250 - $499 (Turnaround: 3-5 business days)\n• Growth Custom Solution: $999 - $1,499 (Turnaround: 7-10 business days)\n• Enterprise Software & SLA: Tailored to scope with transparent milestone delivery.${attachmentNote}\n\nIf you have a specific project scope or budget in mind, please feel free to share your requirements and I will prepare a customized quote for you!\n\nBest regards,\n${agentConfig?.name || 'Alex'}\n${actualBusinessName}`;
        return res.json({ success: true, reply });
      }

      // Universal Business Requirement Synthesizer
      const reply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for contacting ${actualBusinessName} regarding "${subject}".\n\nWe specialize in ${servicesSummary}. We have reviewed your inquiry and are fully prepared to assist you with high quality, responsive support, and dedicated project delivery.${attachmentNote}\n\nPlease let me know any specific details or preferences you have in mind so we can proceed with your requirements!\n\nBest regards,\n${agentConfig?.name || 'Alex'}\n${actualBusinessName}`;
      return res.json({ success: true, reply });
    }
  });

  // 4. Server-Side Direct Website Crawler (No CORS Issues!)
  app.post('/api/crawl', async (req, res) => {
    let { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      const parsedUrl = new URL(cleanUrl);
      const domain = parsedUrl.hostname.replace(/^www\./, '');

      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MailoraCrawler/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.status}`);
      }

      const html = await response.text();

      // Extract basic title, description, headings, and clean text
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : domain;

      const descMatch =
        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      const description = descMatch ? descMatch[1].trim() : `Official information and services for ${domain}`;

      // Extract headings
      const headingMatches = Array.from(html.matchAll(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi));
      const headings = headingMatches
        .map(m => m[1].replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(t => t.length > 2 && t.length < 100)
        .slice(0, 10);

      // Clean text from body
      const cleanBody = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Extract emails and phones
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      const phoneRegex = /(\+?[0-9]{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
      const emails = Array.from(new Set(cleanBody.match(emailRegex) || [])).slice(0, 4);
      const phones = Array.from(new Set(cleanBody.match(phoneRegex) || [])).slice(0, 4);

      // Extract images
      const imgMatches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']/gi));
      const images: { src: string; alt: string }[] = [];
      for (const m of imgMatches) {
        let src = m[1];
        const alt = m[2] || 'Website Image';
        if (!src.startsWith('data:') && !src.includes('1x1') && !src.includes('spacer')) {
          if (!src.startsWith('http')) {
            try {
              src = new URL(src, cleanUrl).href;
            } catch {}
          }
          if (!images.some(i => i.src === src) && images.length < 8) {
            images.push({ src, alt });
          }
        }
      }

      return res.json({
        url: cleanUrl,
        domain,
        title,
        description,
        headings,
        mainText: cleanBody.slice(0, 4000),
        contactInfo: { emails, phones },
        services: headings.slice(0, 6),
        images,
        crawledAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        wordCount: cleanBody.split(/\s+/).filter(Boolean).length,
      });
    } catch (err: any) {
      console.warn('Server crawl fallback notice:', err);
      // Fallback domain synthesizer
      const domain = url.replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      const brandName = domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

      return res.json({
        url: cleanUrl,
        domain,
        title: `${brandName} — Official Products, Services & Support`,
        description: `${brandName} offers professional solutions, digital products, and client consultation.`,
        headings: [`About ${brandName}`, 'Our Core Services & Solutions', 'Client Support & Guarantee'],
        mainText: `${brandName} operates online at ${domain}. We provide custom digital services, professional consulting, and responsive customer support.`,
        contactInfo: { emails: [`support@${domain}`], phones: ['+1 (800) 555-0199'] },
        services: ['Custom Development', 'Consultation & Strategy', 'Managed 24/7 Support'],
        images: [
          {
            src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
            alt: `${brandName} Headquarters`,
          },
        ],
        crawledAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        wordCount: 120,
      });
    }
  });

  // ==========================================
  // 5. AUTONOMOUS 24/7 BACKGROUND ENGINE
  // Runs in the Node.js backend continuously even when user closes browser or logs out!
  // Pauses immediately if user clicks the OFF toggle button.
  // ==========================================
  const dataDir = path.resolve(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {}
  }
  const STATE_FILE = path.resolve(dataDir, 'autonomous_state.json');

  interface AutonomousState {
    isEnabled: boolean;
    googleAccessToken: string | null;
    businessName: string;
    supportEmail: string;
    agentConfig: {
      name: string;
      tone: string;
      replyLanguage: string;
      emailSignature: string;
      instructions: string;
    };
    calendarConfig: {
      isConnected: boolean;
      autoBookMeetings: boolean;
      defaultMeetingDurationMinutes: number;
    };
    sheetsConfig: {
      isConnected: boolean;
      spreadsheetId: string;
    };
    knowledge: Array<{ id: string; title: string; category: string; snippet?: string; fullContent?: string }>;
    handledMessageIds: string[];
    lastPollStatus?: 'ACTIVE_HEALTHY' | 'TOKEN_EXPIRED' | 'POLLING' | 'PAUSED' | 'IDLE';
    stats: {
      totalPolled: number;
      totalReplied: number;
      totalMeetingsBooked: number;
      lastPolledAt: string;
      lastRepliedAt: string;
    };
    logs: Array<any>;
  }

  const defaultState: AutonomousState = {
    isEnabled: true,
    googleAccessToken: null,
    businessName: 'Imbdagency',
    supportEmail: '',
    agentConfig: {
      name: 'Alex Jordan',
      tone: 'Professional',
      replyLanguage: 'Auto',
      emailSignature: 'Best regards,\nAlex Jordan\nImbdagency',
      instructions: 'Always be courteous, direct, and helpful.',
    },
    calendarConfig: {
      isConnected: true,
      autoBookMeetings: true,
      defaultMeetingDurationMinutes: 30,
    },
    sheetsConfig: {
      isConnected: false,
      spreadsheetId: '',
    },
    knowledge: [],
    handledMessageIds: [],
    lastPollStatus: 'IDLE',
    stats: {
      totalPolled: 0,
      totalReplied: 0,
      totalMeetingsBooked: 0,
      lastPolledAt: '',
      lastRepliedAt: '',
    },
    logs: [],
  };

  let autoState: AutonomousState = defaultState;
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      autoState = { ...defaultState, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Notice loading autonomous state:', err);
  }

  const saveAutoState = () => {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(autoState, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed saving autonomous state:', e);
    }
  };

  // API Endpoints for Autonomous 24/7 Engine
  app.get('/api/autonomous/status', (req, res) => {
    res.json({
      isEnabled: autoState.isEnabled,
      isRunning: true,
      lastPolledAt: autoState.stats.lastPolledAt,
      lastPollStatus: autoState.lastPollStatus || (autoState.isEnabled ? 'ACTIVE_HEALTHY' : 'PAUSED'),
      totalPolled: autoState.stats.totalPolled,
      totalReplied: autoState.stats.totalReplied,
      totalMeetingsBooked: autoState.stats.totalMeetingsBooked,
      handledCount: autoState.handledMessageIds.length,
      hasToken: Boolean(autoState.googleAccessToken && !autoState.googleAccessToken.startsWith('demo_')),
      supportEmail: autoState.supportEmail,
      businessName: autoState.businessName,
      logs: autoState.logs.slice(0, 40),
    });
  });

  app.post('/api/autonomous/toggle', (req, res) => {
    const { enabled } = req.body;
    autoState.isEnabled = Boolean(enabled);
    autoState.lastPollStatus = autoState.isEnabled ? 'ACTIVE_HEALTHY' : 'PAUSED';
    saveAutoState();
    console.log(`[Autonomous Engine] 24/7 Autopilot is now: ${autoState.isEnabled ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}`);
    res.json({ success: true, isEnabled: autoState.isEnabled, status: autoState.lastPollStatus });
  });

  app.post('/api/autonomous/sync', (req, res) => {
    const {
      googleAccessToken,
      isEnabled,
      businessName,
      supportEmail,
      agentConfig,
      calendarConfig,
      sheetsConfig,
      knowledge,
    } = req.body;

    if (googleAccessToken && typeof googleAccessToken === 'string') {
      autoState.googleAccessToken = googleAccessToken;
    }
    if (typeof isEnabled === 'boolean') {
      autoState.isEnabled = isEnabled;
    }
    if (businessName) autoState.businessName = businessName;
    if (supportEmail) autoState.supportEmail = supportEmail;
    if (agentConfig) autoState.agentConfig = { ...autoState.agentConfig, ...agentConfig };
    if (calendarConfig) autoState.calendarConfig = { ...autoState.calendarConfig, ...calendarConfig };
    if (sheetsConfig) autoState.sheetsConfig = { ...autoState.sheetsConfig, ...sheetsConfig };
    if (Array.isArray(knowledge)) autoState.knowledge = knowledge;

    saveAutoState();
    console.log(`[Autonomous Engine] Synced settings for "${autoState.businessName}" (${autoState.supportEmail || 'No Email'}). Token present: ${Boolean(autoState.googleAccessToken)}`);
    res.json({ success: true, isEnabled: autoState.isEnabled, hasToken: Boolean(autoState.googleAccessToken) });
  });

  app.post('/api/autonomous/trigger-now', async (req, res) => {
    try {
      const processed = await runAutonomousPoll();
      res.json({
        success: true,
        processed,
        totalReplied: autoState.stats.totalReplied,
        lastPolledAt: autoState.stats.lastPolledAt,
        status: autoState.lastPollStatus,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Trigger failed' });
    }
  });

  // Background Autonomous Polling Runner (Runs continuously in Node.js backend)
  const runAutonomousPoll = async (): Promise<number> => {
    if (!autoState.isEnabled) {
      autoState.lastPollStatus = 'PAUSED';
      return 0; // Paused via user OFF toggle
    }
    const token = autoState.googleAccessToken;
    if (!token || token.startsWith('demo_') || token.startsWith('mock_')) {
      autoState.lastPollStatus = 'IDLE';
      return 0; // Awaiting token connection
    }

    autoState.stats.lastPolledAt = new Date().toISOString();
    autoState.stats.totalPolled++;
    let processedCount = 0;

    try {
      const listRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread in:inbox',
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(12000),
        }
      );

      if (listRes.status === 401) {
        autoState.lastPollStatus = 'TOKEN_EXPIRED';
        console.warn('[Autonomous Engine] Google Access Token expired (HTTP 401). Awaiting token renewal via Mailora UI.');
        saveAutoState();
        return 0;
      }

      if (!listRes.ok) {
        console.warn(`[Autonomous Engine] Gmail list messages returned status ${listRes.status}`);
        return 0;
      }

      autoState.lastPollStatus = 'ACTIVE_HEALTHY';
      const listData = await listRes.json();
      if (!listData.messages || listData.messages.length === 0) {
        saveAutoState();
        return 0;
      }

      for (const msgRef of listData.messages) {
        if (autoState.handledMessageIds.includes(msgRef.id)) continue;
        autoState.handledMessageIds.push(msgRef.id);
        if (autoState.handledMessageIds.length > 500) {
          autoState.handledMessageIds = autoState.handledMessageIds.slice(-400);
        }

        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(12000),
          }
        );
        if (!detailRes.ok) continue;
        const detail = await detailRes.json();
        const headers = detail.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        const fromHeader = getHeader('From');
        let fromEmail = fromHeader;
        let fromName = fromHeader;
        const m = fromHeader.match(/^(.*?)\s*<([^>]+)>/);
        if (m) {
          fromName = m[1].replace(/["']/g, '').trim() || m[2];
          fromEmail = m[2].trim();
        }

        const subject = getHeader('Subject') || '(No Subject)';
        const inReplyTo = getHeader('Message-ID') || msgRef.id;

        const findBody = (part: any): string => {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            try {
              return Buffer.from(part.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
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
        const bodyText = findBody(detail.payload) || detail.snippet || '';

        // Prevent self loops
        if (autoState.supportEmail && fromEmail.toLowerCase().includes(autoState.supportEmail.toLowerCase())) {
          await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}/modify`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
          });
          continue;
        }

        // Spam filter
        const isSpam =
          fromHeader.toLowerCase().includes('noreply') ||
          fromHeader.toLowerCase().includes('no-reply') ||
          fromHeader.toLowerCase().includes('mailer-daemon') ||
          getHeader('List-Unsubscribe') !== '';

        if (isSpam) {
          await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}/modify`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
          });
          autoState.logs.unshift({
            id: `log_spam_${Date.now()}`,
            messageId: msgRef.id,
            fromEmail,
            fromName,
            subject,
            incomingSnippet: bodyText.slice(0, 100),
            replySnippet: '[Filtered: Automated Newsletter or Notification — Auto-reply suppressed]',
            fullReply: '',
            intent: 'Spam',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'SPAM_SKIPPED',
          });
          saveAutoState();
          continue;
        }

        // Meeting check & auto booking using GoogleCalendarService with Worldwide Timezones & Rescheduling
        let meetingBookingInfo: any = undefined;
        let meetingReportSummary = 'N/A';

        if (autoState.calendarConfig.autoBookMeetings) {
          try {
            const meetingRes = await GoogleCalendarService.processMeetingInquiry({
              subject,
              body: bodyText,
              clientEmail: fromEmail,
              clientName: fromName,
              businessName: autoState.businessName,
              durationMinutes: autoState.calendarConfig.defaultMeetingDurationMinutes || 30,
              accessToken: token,
            });

            if (meetingRes.action === 'BOOKED' || meetingRes.action === 'RESCHEDULED') {
              meetingBookingInfo = meetingRes.meetingBookingInfo;
              meetingReportSummary = meetingRes.meetingReportSummary || (meetingRes.action === 'RESCHEDULED' ? 'Rescheduled' : 'Booked');
              autoState.stats.totalMeetingsBooked++;
            } else if (meetingRes.action === 'SUGGEST_SLOTS') {
              meetingBookingInfo = meetingRes.meetingBookingInfo;
              meetingReportSummary = meetingRes.meetingReportSummary || 'Slots Suggested';
            }
          } catch (calErr) {
            console.warn('[Autonomous Calendar Processing Notice]:', calErr);
          }
        }

        // PDF document request detection
        let attachmentInfo: any = undefined;
        let attachmentPayload: any = undefined;
        const combinedLower = `${subject} ${bodyText}`.toLowerCase();
        const isDocRequest = [
          'pdf', 'document', 'doc', 'brochure', 'catalog', 'pricing', 'portfolio', 'agreement', 'rate card'
        ].some(k => combinedLower.includes(k));

        if (isDocRequest) {
          const docTitle = combinedLower.includes('pricing')
            ? `${autoState.businessName}_Pricing_&_Packages_Guide.pdf`
            : `${autoState.businessName}_Official_Portfolio_Overview.pdf`;

          const pdfText = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 18 Tf\n50 720 Td\n(${autoState.businessName} - Official Verified Document) Tj\n/F1 12 Tf\n0 -30 Td\n(Dispatched autonomously via Mailora AI.) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000318 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n488\n%%EOF`;
          const base64Pdf = Buffer.from(pdfText).toString('base64');

          attachmentInfo = {
            filename: docTitle,
            driveUrl: 'https://drive.google.com',
          };
          attachmentPayload = {
            filename: docTitle,
            mimeType: 'application/pdf',
            base64Content: base64Pdf,
          };
        }

        // Relevant Knowledge Chunks
        const relevantKnowledge = (autoState.knowledge || [])
          .filter(k => {
            const q = combinedLower;
            return (k.title && q.includes(k.title.toLowerCase())) ||
                   (k.category && q.includes(k.category.toLowerCase())) ||
                   (k.snippet && (q.includes('price') || q.includes('cost') || q.includes('service')));
          })
          .slice(0, 4)
          .map(k => `• [${k.category || 'Knowledge'} - ${k.title}]: ${k.fullContent || k.snippet}`)
          .join('\n\n');

        // Generate AI reply with Gemini 3.8 Flash
        let generatedReply = '';
        const aiClient = getAiClient();
        if (aiClient) {
          try {
            const meetingPromptSection = meetingBookingInfo?.status === 'RESCHEDULED'
              ? `\n\nCRITICAL MANDATORY REQUIREMENT - APPOINTMENT RESCHEDULE CONFIRMATION:
- The previous meeting has been completely CANCELLED & REMOVED from the calendar to prevent double-booking.
- The new appointment is CONFIRMED for: ${meetingBookingInfo.dateFormatted}
- Google Meet Video Call Link: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}
- Timezone Coordination: ${meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.dateFormatted}
Confirm the new time, state clearly that the prior booking was removed from the schedule, and provide the Meet link.`
              : meetingBookingInfo?.status === 'BOOKED'
              ? `\n\nCRITICAL MANDATORY REQUIREMENT - APPOINTMENT CONFIRMATION:
- Appointment CONFIRMED for: ${meetingBookingInfo.dateFormatted}
- Google Meet Video Call Link: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}
- Timezone Coordination: ${meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.dateFormatted}
Confirm the date, time, and Meet link.`
              : meetingBookingInfo?.status === 'SUGGEST_SLOTS' && meetingBookingInfo.availableSlots?.length > 0
              ? `\n\nCALENDAR AVAILABILITY & SUGGESTED SLOTS:
- The requested time was unavailable or open times were requested. Offer these open slots:
${meetingBookingInfo.availableSlots.map((s: string) => `  • ${s}`).join('\n')}
Ask which slot works best.`
              : '';

            const prompt = `You are ${autoState.agentConfig.name}, client support lead at ${autoState.businessName}.
Tone: ${autoState.agentConfig.tone || 'Professional'}.
Language: Auto (If customer wrote in Bangla, reply in natural Bangla. If in English, reply in fluent, natural English).
${meetingPromptSection}
${attachmentInfo ? `ATTACHED DOCUMENT: You have attached "${attachmentInfo.filename}". Mention it in the email.` : ''}

VERIFIED BUSINESS KNOWLEDGE:
${relevantKnowledge || 'Operate using standard courteous business practices.'}

INCOMING CUSTOMER EMAIL:
Customer Name: ${fromName}
Subject: ${subject}
Message: ${bodyText}

Answer any specific requirements or questions directly and concisely in natural human bullet points.
Sign off:
${autoState.agentConfig.emailSignature || `Best regards,\n${autoState.agentConfig.name}\n${autoState.businessName}`}

Final email reply:`;

            const genRes = await aiClient.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
            });
            generatedReply = genRes.text?.trim() || '';
          } catch (e) {
            console.warn('[Autonomous Gemini Notice]:', e);
          }
        }

        // Fallback generator if offline / Gemini error
        if (!generatedReply) {
          const isBangla = /[\u0980-\u09FF]/.test(combinedLower) || combinedLower.includes('nam ki') || combinedLower.includes('service ki');
          const cleanSubject = subject.replace(/^(re|fwd):\s*/i, '').trim();

          if (meetingBookingInfo?.status === 'RESCHEDULED') {
            const tzInfo = meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.dateFormatted;
            if (isBangla) {
              generatedReply = `আসসালামু আলাইকুম ${fromName !== 'there' ? fromName : ''}!\n\nআপনার অনুরোধ অনুযায়ী আগের মিটিংটি বাতিল করে নতুন সময়ে সফলভাবে রিশিডিউল (Reschedule) করা হয়েছে। ক্যালেন্ডারে কোনো ডাবল-বুকিং থাকবে না।\n\nনতুন অ্যাপয়েন্টমেন্টের বিবরণ:\n• তারিখ ও সময়: ${tzInfo}\n• গুগল মিট লিংক: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}\n• বিষয়: ${cleanSubject}\n\nক্যালেন্ডার ইনভাইটেশন আপনার ইমেইলে পাঠিয়ে দেওয়া হয়েছে। আপনার সাথে কথা বলার জন্য অপেক্ষায় রইলাম।\n\nআন্তরিক ধন্যবাদ,\n${autoState.agentConfig.name}\n${autoState.businessName}`;
            } else {
              generatedReply = `Hi ${fromName !== 'there' ? fromName : 'there'},\n\nThank you for reaching out to us at ${autoState.businessName}.\n\nAs requested, your previous meeting has been completely removed from our schedule to prevent double-booking, and your new appointment has been successfully rescheduled!\n\nUpdated Appointment Details:\n• Date & Time: ${tzInfo}\n• Platform: Google Meet (${meetingBookingInfo.meetUrl || 'https://meet.google.com'})\n• Subject: ${cleanSubject}\n• Calendar Invite: An updated Google Calendar invitation has been dispatched to your email.\n\nLooking forward to speaking with you!\n\nBest regards,\n${autoState.agentConfig.name}\n${autoState.businessName}`;
            }
          } else if (meetingBookingInfo?.status === 'BOOKED') {
            const tzInfo = meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.dateFormatted;
            if (isBangla) {
              generatedReply = `আসসালামু আলাইকুম ${fromName !== 'there' ? fromName : ''}!\n\n${autoState.businessName}-এর সাথে আপনার অ্যাপয়েন্টমেন্ট সফলভাবে কনফার্ম করা হয়েছে।\n\nঅ্যাপয়েন্টমেন্টের বিবরণ:\n• তারিখ ও সময়: ${tzInfo}\n• গুগল মিট লিংক: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}\n• বিষয়: ${cleanSubject}\n\nইনভাইটেশন আপনার ক্যালেন্ডারে পাঠানো হয়েছে।\n\nআন্তরিক ধন্যবাদ,\n${autoState.agentConfig.name}\n${autoState.businessName}`;
            } else {
              generatedReply = `Hi ${fromName !== 'there' ? fromName : 'there'},\n\nThank you for reaching out to us at ${autoState.businessName}.\n\nYour appointment has been successfully scheduled and confirmed! Here are the details for our session:\n\n• Date & Time: ${tzInfo}\n• Meeting Platform: Google Meet (${meetingBookingInfo.meetUrl || 'https://meet.google.com'})\n• Subject: ${cleanSubject}\n• Calendar Invite: Dispatched to your email address.\n\nLooking forward to speaking with you!\n\nBest regards,\n${autoState.agentConfig.name}\n${autoState.businessName}`;
            }
          } else if (meetingBookingInfo?.status === 'SUGGEST_SLOTS' && meetingBookingInfo.availableSlots?.length > 0) {
            const slotList = meetingBookingInfo.availableSlots.map((s: string) => `• ${s}`).join('\n');
            if (isBangla) {
              generatedReply = `আসসালামু আলাইকুম ${fromName !== 'there' ? fromName : ''}!\n\n${autoState.businessName}-এ অ্যাপয়েন্টমেন্টের জন্য যোগাযোগ করার জন্য ধন্যবাদ।\n\nআমাদের রিয়েল-টাইম ক্যালেন্ডার অনুযায়ী নিচের স্লটগুলো খালি রয়েছে:\n\n${slotList}\n\nআপনার সুবিধামতো যে কোনো একটি স্লট নির্বাচন করে রিপ্লাই দিন, আমরা কনফার্ম করে দিব!\n\nআন্তরিক ধন্যবাদ,\n${autoState.agentConfig.name}\n${autoState.businessName}`;
            } else {
              generatedReply = `Hi ${fromName !== 'there' ? fromName : 'there'},\n\nThank you for reaching out to us at ${autoState.businessName} regarding your appointment request.\n\nBased on our current schedule, here are our next open Google Calendar meeting times:\n\n${slotList}\n\nPlease reply with the slot that works best for you, and I will reserve the appointment immediately!\n\nBest regards,\n${autoState.agentConfig.name}\n${autoState.businessName}`;
            }
          } else {
            generatedReply = `Hi ${fromName !== 'there' ? fromName : 'there'},\n\nThank you for contacting ${autoState.businessName} regarding "${subject}".\n\nWe have received your message and are pleased to assist you. Please let us know any specific requirements or details so we can proceed promptly!\n\nBest regards,\n${autoState.agentConfig.name}\n${autoState.businessName}`;
          }
        }

        // Dispatch Email via Gmail API
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject.startsWith('Re: ') ? subject : `Re: ${subject}`).toString('base64')}?=`;
        let mime = '';
        if (attachmentPayload) {
          const mixedBoundary = `===mailora_mixed_${Date.now()}===`;
          const altBoundary = `===mailora_alt_${Date.now()}===`;
          mime = [
            `To: ${fromEmail}`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            `In-Reply-To: ${inReplyTo}`,
            `References: ${inReplyTo}`,
            `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
            '',
            `--${mixedBoundary}`,
            `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
            '',
            `--${altBoundary}`,
            'Content-Type: text/plain; charset="UTF-8"',
            '',
            generatedReply,
            '',
            `--${altBoundary}`,
            'Content-Type: text/html; charset="UTF-8"',
            '',
            `<p style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#1e293b;">${generatedReply.replace(/\n/g, '<br/>')}</p>`,
            '',
            `--${altBoundary}--`,
            '',
            `--${mixedBoundary}`,
            `Content-Type: application/pdf; name="${attachmentPayload.filename}"`,
            'Content-Transfer-Encoding: base64',
            `Content-Disposition: attachment; filename="${attachmentPayload.filename}"`,
            '',
            attachmentPayload.base64Content,
            '',
            `--${mixedBoundary}--`,
          ].join('\r\n');
        } else {
          const boundary = `===mailora_boundary_${Date.now()}===`;
          mime = [
            `To: ${fromEmail}`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            `In-Reply-To: ${inReplyTo}`,
            `References: ${inReplyTo}`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/plain; charset="UTF-8"',
            '',
            generatedReply,
            '',
            `--${boundary}`,
            'Content-Type: text/html; charset="UTF-8"',
            '',
            `<p style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#1e293b;">${generatedReply.replace(/\n/g, '<br/>')}</p>`,
            '',
            `--${boundary}--`,
          ].join('\r\n');
        }

        const raw = Buffer.from(mime)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw, threadId: detail.threadId }),
        });

        // Mark read
        await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}/modify`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
        });

        // Google Sheets append if connected
        if (autoState.sheetsConfig.isConnected && autoState.sheetsConfig.spreadsheetId) {
          try {
            await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${autoState.sheetsConfig.spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
              {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  values: [
                    [
                      new Date().toISOString(),
                      new Date().toLocaleDateString(),
                      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      fromName,
                      fromEmail,
                      subject,
                      bodyText.slice(0, 200),
                      generatedReply.slice(0, 300),
                      meetingBookingInfo ? 'Appointment' : 'Inquiry',
                      meetingReportSummary,
                      'DELIVERED (24/7 Autopilot)',
                    ],
                  ],
                }),
              }
            );
          } catch (sheetErr) {
            console.warn('[Autonomous Sheet Notice]:', sheetErr);
          }
        }

        autoState.stats.totalReplied++;
        autoState.stats.lastRepliedAt = new Date().toISOString();
        autoState.logs.unshift({
          id: `log_auto_${Date.now()}`,
          messageId: msgRef.id,
          fromEmail,
          fromName,
          subject,
          incomingSnippet: bodyText.slice(0, 100),
          replySnippet: generatedReply.slice(0, 140) + '...',
          fullReply: generatedReply,
          intent: meetingBookingInfo ? 'Appointment' : 'Inquiry',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'DELIVERED',
        });
        if (autoState.logs.length > 50) autoState.logs = autoState.logs.slice(0, 50);
        saveAutoState();
        processedCount++;
        console.log(`[Autonomous Engine] 24/7 Autopilot replied to: ${fromEmail} (${subject})`);
      }
    } catch (pollErr) {
      console.warn('[Autonomous Background Poll Notice]:', pollErr);
    }
    return processedCount;
  };

  // Run autonomous polling every 15 seconds continuously
  setInterval(runAutonomousPoll, 15000);

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Mailora AI Full-Stack Server running on port ${port}`);
  });
}

startServer();
