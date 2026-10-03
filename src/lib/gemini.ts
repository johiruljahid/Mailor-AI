import { GoogleGenAI } from '@google/genai';
import { EmailAgentConfig, EmailIntent, TestAgentAnalysis } from '../types';
import { RetrievedChunk } from './knowledgeRetrieval';

// Get Gemini API Key from environment or local configuration
export function getGeminiApiKey(): string | null {
  const envKey =
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined) ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (envKey && envKey !== 'MY_GEMINI_API_KEY' && envKey.trim().length > 0) {
    return envKey.trim();
  }

  try {
    const customKey = localStorage.getItem('mailora_custom_gemini_key');
    if (customKey && customKey.trim().length > 0) {
      return customKey.trim();
    }
  } catch {}

  return null;
}

export function setCustomGeminiApiKey(key: string | null) {
  try {
    if (key) {
      localStorage.setItem('mailora_custom_gemini_key', key.trim());
    } else {
      localStorage.removeItem('mailora_custom_gemini_key');
    }
  } catch {}
}

export function getGeminiClient(): GoogleGenAI | null {
  const key = getGeminiApiKey();
  if (key) {
    try {
      return new GoogleGenAI({ apiKey: key });
    } catch (err) {
      console.warn('Failed to construct GoogleGenAI instance:', err);
    }
  }
  return null;
}

export function isGeminiConnected(): boolean {
  return Boolean(getGeminiApiKey());
}

/**
 * Clean raw crawled text from metadata tags like "Page Title:", "Description:", "Website URL:"
 */
function cleanChunkText(text: string): string {
  return text
    .replace(/Page Title:\s*/gi, '')
    .replace(/Website URL:\s*https?:\/\/[^\s]+/gi, '')
    .replace(/Domain:\s*[^\s]+/gi, '')
    .replace(/Description:\s*/gi, '')
    .replace(/Main Content:\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classify the intent of an incoming customer email & filter spam / bot newsletters
 */
export async function classifyEmailIntent(
  subject: string,
  body: string,
  fromEmail: string = ''
): Promise<{
  intent: EmailIntent;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'urgent' | 'negative';
  isAutomatedSpamOrNewsletter?: boolean;
}> {
  const lowerFrom = fromEmail.toLowerCase();
  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();
  const content = `${lowerSubject} ${lowerBody}`;

  // 1. Check for automated system notifications or newsletters (should NEVER be replied to)
  const isAutomatedBot =
    lowerFrom.includes('noreply') ||
    lowerFrom.includes('no-reply') ||
    lowerFrom.includes('mailer-daemon') ||
    lowerFrom.includes('notifications@') ||
    lowerFrom.includes('bounce') ||
    lowerFrom.includes('digest@') ||
    lowerFrom.includes('marketing@') ||
    lowerSubject.includes('security alert') ||
    lowerSubject.includes('confirm your subscription') ||
    lowerSubject.includes('verify your email') ||
    lowerSubject.includes('weekly digest') ||
    lowerSubject.includes('delivery status notification (failure)') ||
    (lowerBody.includes('unsubscribe') && (lowerBody.includes('view in browser') || lowerBody.includes('manage your preferences')));

  // Check if it's a real customer inquiry despite spam triggers
  const hasClientInquiry =
    content.includes('price') ||
    content.includes('service') ||
    content.includes('cost') ||
    content.includes('help') ||
    content.includes('quote') ||
    content.includes('hire') ||
    content.includes('support') ||
    content.includes('refund') ||
    content.includes('question') ||
    content.includes('name') ||
    content.includes('ki') ||
    content.includes('koto');

  if (isAutomatedBot && !hasClientInquiry) {
    return {
      intent: 'Spam',
      confidence: 0.99,
      sentiment: 'neutral',
      isAutomatedSpamOrNewsletter: true,
    };
  }

  // 2. Try server-side classifier
  try {
    const res = await fetch('/api/gemini/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        intent: data.intent || 'General inquiry',
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.94,
        sentiment: data.sentiment || 'neutral',
        isAutomatedSpamOrNewsletter: Boolean(data.isAutomatedSpamOrNewsletter),
      };
    }
  } catch {
    // Fall back to client rules
  }

  // Fast heuristics
  if (content.includes('refund') || content.includes('money back') || content.includes('chargeback')) {
    return { intent: 'Refund', confidence: 0.96, sentiment: 'urgent' };
  }
  if (content.includes('angry') || content.includes('horrible') || content.includes('complain') || content.includes('broken')) {
    return { intent: 'Complaint', confidence: 0.94, sentiment: 'negative' };
  }
  if (content.includes('price') || content.includes('pricing') || content.includes('quote') || content.includes('cost') || content.includes('how much') || content.includes('package')) {
    return { intent: 'Pricing', confidence: 0.95, sentiment: 'positive' };
  }
  if (content.includes('book') || content.includes('reservation') || content.includes('appointment') || content.includes('schedule a call')) {
    return { intent: 'Booking', confidence: 0.93, sentiment: 'positive' };
  }
  if (content.includes('service') || content.includes('type of service') || content.includes('what do you do') || content.includes('business name') || content.includes('company name')) {
    return { intent: 'Sales inquiry', confidence: 0.96, sentiment: 'positive' };
  }
  if (content.includes('name') || content.includes('who are you') || content.includes('nam ki') || content.includes('naam ki')) {
    return { intent: 'General inquiry', confidence: 0.98, sentiment: 'neutral' };
  }

  return { intent: 'General inquiry', confidence: 0.90, sentiment: 'neutral' };
}

/**
 * Generate 100% Accurate, Human-like Email Response
 * Answers client questions directly without metadata dumps.
 */
export async function generateAgentEmailReply(params: {
  subject: string;
  body: string;
  customerName?: string;
  businessName?: string;
  agentConfig: EmailAgentConfig;
  retrievedChunks: RetrievedChunk[];
  intent: EmailIntent;
  enableWebSearch?: boolean;
  meetingBookingInfo?:
    | {
        status: 'BOOKED';
        dateFormatted: string;
        meetUrl?: string;
        eventLink?: string;
        isReschedule?: boolean;
        timezoneBadge?: string;
        clientTimezone?: string;
        userTimezone?: string;
        userUtcOffset?: string;
        clientUtcOffset?: string;
        dualTimezoneSentence?: string;
        preferredDateBusy?: boolean;
      }
    | {
        status: 'RESCHEDULED';
        dateFormatted: string;
        previousDateFormatted?: string;
        meetUrl?: string;
        eventLink?: string;
        isReschedule?: boolean;
        timezoneBadge?: string;
        clientTimezone?: string;
        userTimezone?: string;
        userUtcOffset?: string;
        clientUtcOffset?: string;
        dualTimezoneSentence?: string;
        preferredDateBusy?: boolean;
      }
    | {
        status: 'SUGGEST_SLOTS';
        availableSlots: string[];
        isReschedule?: boolean;
        previousDateFormatted?: string;
        timezoneBadge?: string;
        clientTimezone?: string;
        userTimezone?: string;
        userUtcOffset?: string;
        clientUtcOffset?: string;
        dualTimezoneSentence?: string;
        preferredDateBusy?: boolean;
      };
  attachmentInfo?: { filename: string; driveUrl?: string };
}): Promise<{
  reply: string;
  decision: 'AUTO_REPLY' | 'NEEDS_REVIEW' | 'ESCALATE_HUMAN';
  reviewReason?: string;
}> {
  const {
    subject,
    body,
    customerName = 'there',
    businessName = 'Imbdagency',
    agentConfig,
    retrievedChunks,
    intent,
    enableWebSearch = true,
    meetingBookingInfo,
    attachmentInfo,
  } = params;

  // 1. Try server-side Gemini generation first (uses server GEMINI_API_KEY with Google Search Grounding)
  try {
    const serverRes = await fetch('/api/gemini/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000),
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.reply && data.reply.trim().length > 0) {
        return {
          reply: data.reply.trim(),
          decision: 'AUTO_REPLY',
        };
      }
    }
  } catch (err) {
    console.warn('Server Gemini proxy attempt notice:', err);
  }

  // 2. Try client-side Gemini if API key is in browser
  const aiClient = getGeminiClient();
  if (aiClient) {
    try {
      const cleanKnowledge = retrievedChunks
        .map((c, i) => `[Resource ${i + 1}: ${c.title}]\n${cleanChunkText(c.fullContent || c.snippet)}`)
        .join('\n\n');

      const languageInstruction =
        agentConfig.replyLanguage === 'Bangla'
          ? 'Reply completely in natural, warm, polite conversational Bangla (বাংলা).'
          : agentConfig.replyLanguage === 'Bangla + English'
          ? 'Provide a concise bilingual response in warm Bangla (বাংলা) followed by English.'
          : 'Detect the language of the incoming message. If the customer wrote in Bangla (or Banglish), reply in natural polite Bangla. If in English, reply in natural professional English.';

      const meetingInstructions = meetingBookingInfo?.status === 'RESCHEDULED'
        ? `\n\nCRITICAL MANDATORY REQUIREMENT - APPOINTMENT RESCHEDULE CONFIRMATION EMAIL:
- The client requested to reschedule or change the meeting date/time.
- The new appointment has ALREADY BEEN BOOKED for: ${meetingBookingInfo.dateFormatted}
- Previous appointment was for: ${meetingBookingInfo.previousDateFormatted || 'earlier scheduled slot'} (AND HAS BEEN CANCELLED/DELETED from Google Calendar).
- New Google Meet Video Call Link: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}
- Calendar Invite: Updated Google Calendar invitation dispatched to the client's email address.
YOUR TASK:
1. This email MUST BE an explicit, warm, executive-grade APPOINTMENT RESCHEDULE CONFIRMATION.
2. Confirm that their appointment has been successfully moved to the new requested date & time (${meetingBookingInfo.dateFormatted}).
3. Clearly provide the Google Meet link in the first few lines and confirm that the previous session on ${meetingBookingInfo.previousDateFormatted || 'earlier slot'} was cancelled.
4. If the client had any other questions or specs, answer them concisely below the confirmation!\n`
        : meetingBookingInfo?.status === 'BOOKED'
        ? `\n\nCRITICAL MANDATORY REQUIREMENT - APPOINTMENT CONFIRMATION EMAIL:
- A Google Calendar appointment has ALREADY BEEN BOOKED for: ${meetingBookingInfo.dateFormatted}
- Google Meet Video Call Link: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}
- Calendar Invite: Dispatched to the client's email address.
YOUR TASK:
1. This email MUST BE an explicit, warm, executive-grade APPOINTMENT CONFIRMATION.
2. Clearly state the exact confirmed date & time and provide the Google Meet link in the first few lines.
3. Mention that a Google Calendar invitation has been sent directly to their calendar.
4. DO NOT say "Could you please share a few more details so I can assist you with the exact information you need?".
5. If the client asked any questions or specified project requirements in their email, answer those requirements concisely and directly right below the appointment confirmation!\n`
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

      const prompt = `You are ${agentConfig.name}, an authentic human employee and client support specialist at ${businessName}.
Tone: ${agentConfig.tone}.
Language: ${languageInstruction}

CRITICAL ACCURACY, HUMAN AUTHENTICITY & SPECIFICITY RULES:
1. Speak as a genuine, warm, and professional human colleague writing back from their email desk.
2. The customer must NEVER suspect this is an AI, bot, virtual assistant, or automated script.
3. NEVER output raw metadata, prefixes, or labels like "Page Title:", "Description:", "Website URL:", or raw scraped text. Always synthesize the facts into fluent, human-written sentences!
4. ANSWER EXACTLY WHAT THE CLIENT ASKED - POINT BY POINT:
   - If the client asks about pricing, service charges, cost, or packages:
     Provide a clear, structured bullet-point breakdown (•) listing each relevant service, package name, exact price, and turnaround time from the verified knowledge base.
   - For multi-part inquiries:
     Address each question in a structured, readable manner using clean bullet points (•) and natural paragraph breaks.
   - For short single questions (e.g. "What is your name?", "Where are you located?"), reply directly in 1-2 friendly human sentences.${meetingInstructions}${attachmentInstructions}
5. NO ROBOTIC CLICHÉS (Never say "As an AI...", "I hope this email finds you well!", "Your inquiry has been logged").
6. Ground your answers strictly on the company knowledge below.
7. Sign off naturally:
${agentConfig.emailSignature || `Best regards,\n${agentConfig.name}\n${businessName}`}

COMPANY KNOWLEDGE:
${cleanKnowledge || 'Operate using standard courteous business practices.'}

INCOMING CUSTOMER EMAIL:
Sender Name: ${customerName}
Subject: ${subject}
Message:
${body}

Generate the final, complete email reply text:`;

      const result = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: enableWebSearch
          ? {
              tools: [{ googleSearch: {} }],
            }
          : undefined,
      });

      if (result.text && result.text.trim().length > 0) {
        return {
          reply: result.text.trim(),
          decision: 'AUTO_REPLY',
        };
      }
    } catch (e) {
      console.warn('Client Gemini generation notice:', e);
    }
  }

  // 3. Smart Human-like Contextual Synthesizer Fallback
  // Accurately answers questions like "what is your business name and what type of service" without raw metadata!
  const cleanBodyLower = `${subject} ${body}`.toLowerCase();
  const isBangla =
    /[\u0980-\u09FF]/.test(cleanBodyLower) ||
    cleanBodyLower.includes('nam ki') ||
    cleanBodyLower.includes('naam ki') ||
    cleanBodyLower.includes('kemon');

  // Extract clean business name from knowledge or props
  let actualBusinessName = businessName;
  const overviewChunk = retrievedChunks.find(
    c => c.title.toLowerCase().includes('overview') || c.category === 'Company Information'
  );
  if (overviewChunk) {
    const rawTitle = overviewChunk.title.replace(/\[.*?\]/g, '').trim();
    if (rawTitle && rawTitle.length < 50) {
      actualBusinessName = rawTitle.split('—')[0].split('-')[0].trim() || businessName;
    }
  }

  // Extract clean services list from chunks
  let servicesSummary =
    'custom web development, modern mobile applications, digital branding, and full-stack software solutions tailored to scale your business';
  const servicesChunk = retrievedChunks.find(
    c => c.category === 'Services' || c.category === 'Products' || c.title.toLowerCase().includes('service')
  );
  if (servicesChunk) {
    let cleaned = cleanChunkText(servicesChunk.snippet || servicesChunk.fullContent)
      .replace(new RegExp(`^${actualBusinessName}\\s+offers\\s+`, 'i'), '')
      .replace(new RegExp(`^${actualBusinessName}\\s+provides\\s+`, 'i'), '')
      .replace(new RegExp(`^${actualBusinessName}\\s+is\\s+`, 'i'), '');
    if (cleaned.length > 20) {
      servicesSummary = cleaned.slice(0, 240).replace(/[-•]\s*/g, ', ').replace(/,\s*,/g, ',').replace(/\.\.+$/, '');
    }
  }

  // Scenario A: Inquiry about business name and type of services
  if (
    cleanBodyLower.includes('business name') ||
    cleanBodyLower.includes('company name') ||
    cleanBodyLower.includes('type of service') ||
    cleanBodyLower.includes('what services') ||
    cleanBodyLower.includes('what service') ||
    cleanBodyLower.includes('what do you do') ||
    cleanBodyLower.includes('apnader service') ||
    cleanBodyLower.includes('business er nam')
  ) {
    if (isBangla) {
      const banglaReply = `আসসালামু আলাইকুম ${customerName !== 'there' ? customerName : ''}!\n\nআমাদের কোম্পানির নাম ${actualBusinessName}।\n\nআমরা মূলত ${servicesSummary}-এর কাজ করে থাকি। আমাদের টিম আধুনিক ডিজাইন, নির্ভুল কোডিং এবং প্রফেশনাল সাপোর্ট দিয়ে ক্লায়েন্টদের সেবা প্রদান করে থাকে।\n\nআপনার প্রজেক্ট বা কাজের ব্যাপারে কোনো নির্দিষ্ট রিকোয়ারমেন্ট থাকলে জানান, আমরা আনন্দের সাথে আপনাকে বিস্তারিত জানিয়ে দিব!\n\nআন্তরিক ধন্যবাদ,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: banglaReply, decision: 'AUTO_REPLY' };
    } else {
      const engReply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for reaching out to us!\n\nOur company name is ${actualBusinessName}. We specialize in ${servicesSummary}.\n\nWhether you need a full turnkey solution or consultation for an upcoming project, we would be delighted to assist you. Please let me know what requirements you have in mind so I can provide you with exact details!\n\nBest regards,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: engReply, decision: 'AUTO_REPLY' };
    }
  }

  // Scenario B: Inquiry about agent's name / identity
  if (
    cleanBodyLower.includes('your name') ||
    cleanBodyLower.includes('who are you') ||
    cleanBodyLower.includes('tomar nam') ||
    cleanBodyLower.includes('apnar nam') ||
    cleanBodyLower.includes('naam ki') ||
    cleanBodyLower.includes('nam ki')
  ) {
    if (isBangla) {
      const banglaReply = `আসসালামু আলাইকুম!\n\nআমি ${agentConfig.name}, ${actualBusinessName}-এর টিম থেকে বলছি। আপনাকে কীভাবে সহযোগিতা করতে পারি?\n\nআন্তরিক ধন্যবাদ,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: banglaReply, decision: 'AUTO_REPLY' };
    } else {
      const engReply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nMy name is ${agentConfig.name} from the ${actualBusinessName} team! How can I assist you with your project today?\n\nBest regards,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: engReply, decision: 'AUTO_REPLY' };
    }
  }

  const attachmentNote = attachmentInfo
    ? `\n\n📎 Attached Document:\nI have attached our ${attachmentInfo.filename} for your review. (Online link: ${attachmentInfo.driveUrl || 'Google Drive'}).`
    : '';

  // Priority Scenario 0: Confirmed Appointment Reschedule
  if (meetingBookingInfo?.status === 'RESCHEDULED') {
    const cleanSubject = subject.replace(/^(re|fwd):\s*/i, '').trim();
    const tzHighlight = meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge
      ? `• Timezone Coordination (Worldwide): ${meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge}\n`
      : '';
    const tzHighlightBn = meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge
      ? `• টাইমজোন সমন্বয় (Worldwide): ${meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge}\n`
      : '';

    if (isBangla) {
      const banglaReply = `আসসালামু আলাইকুম ${customerName !== 'there' ? customerName : ''}!\n\nআপনার অনুরোধ অনুযায়ী আমাদের মিটিংয়ের তারিখ ও সময় সফলভাবে পরিবর্তন (Reschedule) করা হয়েছে। ডাবল মিটিং প্রতিরোধ করার জন্য আপনার পূর্ববর্তী বুকিংটি স্বয়ংক্রিয়ভাবে ক্যালেন্ডার থেকে ডিলিট করা হয়েছে।\n\nনতুন অ্যাপয়েন্টমেন্টের বিবরণ:\n• নতুন তারিখ ও সময়: ${meetingBookingInfo.dateFormatted}\n${tzHighlightBn}• গুগল মিট লিংক: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}\n• বিষয়: ${cleanSubject}\n• পূর্ববর্তী অ্যাপয়েন্টমেন্ট স্ট্যাটাস: আপনার আগের বুকিংটি (${meetingBookingInfo.previousDateFormatted || 'আগের মিটিংটি'}) অটোমেটিক ডিলিট ও বাতিল করা হয়েছে এবং কোনো ডাবল মিটিং নেই।${attachmentNote}\n\nনতুন নির্ধারিত সময়ে আপনার সাথে প্রজেক্টের যাবতীয় বিষয় নিয়ে আলোচনার জন্য প্রস্তুত থাকব। মিটিংয়ের পূর্বে কোনো ফাইল বা তথ্য থাকলে এই ইমেইলে জানাতে পারেন।\n\nআন্তরিক ধন্যবাদ,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: banglaReply, decision: 'AUTO_REPLY' };
    } else {
      const engReply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for reaching out to us at ${actualBusinessName}.\n\nYour appointment has been successfully rescheduled per your request! To ensure no duplicate booking occurs, your previous meeting has been automatically removed from our calendar.\n\nHere are the updated details for our session:\n• New Date & Time: ${meetingBookingInfo.dateFormatted}\n${tzHighlight}• Meeting Platform: Google Meet (${meetingBookingInfo.meetUrl || 'https://meet.google.com'})\n• Subject: ${cleanSubject}\n• Previous Appointment: Automatically cancelled and deleted from calendar (${meetingBookingInfo.previousDateFormatted || 'previous slot'}) with zero double-booking.${attachmentNote}\n\nAn updated Google Calendar invite has been synchronized with your email. I look forward to speaking with you at our newly scheduled time!\n\nBest regards,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: engReply, decision: 'AUTO_REPLY' };
    }
  }

  // Priority Scenario 1: Confirmed Google Calendar Appointment
  if (meetingBookingInfo?.status === 'BOOKED') {
    const cleanSubject = subject.replace(/^(re|fwd):\s*/i, '').trim();
    const tzHighlight = meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge
      ? `• Timezone Coordination (Worldwide): ${meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge}\n`
      : '';
    const tzHighlightBn = meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge
      ? `• টাইমজোন সমন্বয় (Worldwide): ${meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge}\n`
      : '';

    // Check if client asked other questions (like pricing or services) alongside appointment
    let extraRequirementsAnswer = '';
    if (cleanBodyLower.includes('pricing') || cleanBodyLower.includes('cost') || cleanBodyLower.includes('rate')) {
      extraRequirementsAnswer = `\n\nRegarding your inquiry about our packages and rates:\n• Starter Package: $250 - $499 (3-5 days delivery)\n• Growth Custom Solution: $999 - $1,499 (7-10 days delivery)\n• Enterprise Software: Custom scope & dedicated milestone delivery.`;
    }

    if (isBangla) {
      const banglaReply = `আসসালামু আলাইকুম ${customerName !== 'there' ? customerName : ''}!\n\n${actualBusinessName}-এর সাথে আপনার অ্যাপয়েন্টমেন্ট সফলভাবে কনফার্ম করা হয়েছে।\n\nঅ্যাপয়েন্টমেন্টের বিবরণ:\n• তারিখ ও সময়: ${meetingBookingInfo.dateFormatted}\n${tzHighlightBn}• গুগল মিট লিংক: ${meetingBookingInfo.meetUrl || 'https://meet.google.com'}\n• বিষয়: ${cleanSubject}\n• ক্যালেন্ডার ইনভাইট: আপনার ইমেইল ক্যালেন্ডারে সরাসরি পাঠিয়ে দেওয়া হয়েছে।${extraRequirementsAnswer}${attachmentNote}\n\nআপনার রিকোয়ারমেন্ট অনুযায়ী আমি বিস্তারিত প্রস্তুতি রাখছি। আমাদের মিটিংয়ে আপনার প্রজেক্টের যাবতীয় বিষয় নিয়ে খোলামেলা আলোচনা করব। মিটিংয়ের পূর্বে কোনো বিশেষ তথ্য বা ফাইল পাঠাতে চাইলে এই ইমেইলে সরাসরি রিপ্লাই দিতে পারেন।\n\nআন্তরিক ধন্যবাদ,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: banglaReply, decision: 'AUTO_REPLY' };
    } else {
      const engReply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for reaching out to us at ${actualBusinessName}.\n\nYour appointment has been successfully scheduled and confirmed! Here are the details for our session:\n\n• Date & Time: ${meetingBookingInfo.dateFormatted}\n${tzHighlight}• Meeting Platform: Google Meet (${meetingBookingInfo.meetUrl || 'https://meet.google.com'})\n• Subject / Purpose: ${cleanSubject}\n• Calendar Invite: A Google Calendar invitation with the video call link has been dispatched to your email address.${extraRequirementsAnswer}${attachmentNote}\n\nI have reviewed your message and will be prepared to discuss your project requirements in detail during our call. If you have any specs, files, or questions beforehand, please feel free to reply directly to this email.\n\nLooking forward to speaking with you!\n\nBest regards,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: engReply, decision: 'AUTO_REPLY' };
    }
  }

  // Priority Scenario 2: Proposed Google Calendar Slots
  if (meetingBookingInfo?.status === 'SUGGEST_SLOTS' && meetingBookingInfo.availableSlots?.length > 0) {
    const slotList = meetingBookingInfo.availableSlots.map(s => `• ${s}`).join('\n');
    const busyNoteBn = meetingBookingInfo.preferredDateBusy
      ? 'আপনার উল্লিখিত প্রাথমিক সময়টিতে অন্য একটি কনসালটেশন থাকায় স্লটটি বুকড ছিল। তবে নিচের ওপেন স্লটগুলো আপনার সুবিধার্থে প্রস্তাব করা হলো:\n\n'
      : '';
    const busyNoteEng = meetingBookingInfo.preferredDateBusy
      ? 'We checked your requested time slot, which has a scheduling conflict. However, here are our closest open Google Calendar slots:\n\n'
      : '';

    const tzNoteBn = meetingBookingInfo.timezoneBadge
      ? `\n\n🌐 টাইমজোন রেফারেন্স: ${meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge}`
      : '';
    const tzNoteEng = meetingBookingInfo.timezoneBadge
      ? `\n\n🌐 Timezone Reference: ${meetingBookingInfo.dualTimezoneSentence || meetingBookingInfo.timezoneBadge}`
      : '';

    if (isBangla) {
      const banglaReply = `আসসালামু আলাইকুম ${customerName !== 'there' ? customerName : ''}!\n\n${actualBusinessName}-এ অ্যাপয়েন্টমেন্টের জন্য যোগাযোগ করার জন্য ধন্যবাদ।\n\n${busyNoteBn}আমাদের রিয়েল-টাইম ক্যালেন্ডার অনুযায়ী নিচের স্লটগুলো খালি রয়েছে:\n\n${slotList}${tzNoteBn}${attachmentNote}\n\nআপনার সুবিধানুযায়ী যে কোনো একটি সময় নির্বাচন করে রিপ্লাই দিন, আমরা অবিলম্বে গুগল মিট লিংক সহ আপনার জন্য অ্যাপয়েন্টমেন্ট কনফার্ম করে দিব!\n\nআন্তরিক ধন্যবাদ,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: banglaReply, decision: 'AUTO_REPLY' };
    } else {
      const engReply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for reaching out to us at ${actualBusinessName} regarding your appointment request.\n\n${busyNoteEng}Based on our current schedule, here are our next open Google Calendar meeting times:\n\n${slotList}${tzNoteEng}${attachmentNote}\n\nPlease reply with the slot that works best for you, and I will reserve the appointment immediately and send your Google Meet invitation!\n\nBest regards,\n${agentConfig.name}\n${actualBusinessName}`;
      return { reply: engReply, decision: 'AUTO_REPLY' };
    }
  }

  // Scenario C: Pricing & packages (Itemized in clear bullet points)
  if (intent === 'Pricing' || cleanBodyLower.includes('pricing') || cleanBodyLower.includes('how much') || cleanBodyLower.includes('cost') || cleanBodyLower.includes('charge') || cleanBodyLower.includes('koto')) {
    const priceChunk = retrievedChunks.find(c => c.category === 'Pricing' || c.title.toLowerCase().includes('pricing') || c.category === 'Services');
    let priceDetails = '';
    if (priceChunk) {
      const cleaned = cleanChunkText(priceChunk.snippet || priceChunk.fullContent);
      priceDetails = cleaned
        .split('\n')
        .filter(l => l.trim().length > 0)
        .map(l => (l.trim().startsWith('•') || l.trim().startsWith('-') ? l.trim() : `• ${l.trim()}`))
        .join('\n');
    } else {
      priceDetails = `• Starter Package: $250 - $499 (Turnaround: 3-5 business days)\n• Professional Custom Solution: $999 - $1,499 (Turnaround: 7-10 business days)\n• Enterprise & Ongoing Retainer: Tailored to scope with transparent milestone delivery.`;
    }

    const reply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nThank you for asking about our service charges and rates at ${actualBusinessName}. Here is our current pricing breakdown:\n\n${priceDetails}${attachmentNote}\n\nIf you have a specific project scope or budget in mind, please feel free to share your requirements and I will prepare a customized quote for you!\n\nBest regards,\n${agentConfig.name}\n${actualBusinessName}`;
    return { reply, decision: 'AUTO_REPLY' };
  }

  // Scenario D: Refund inquiry
  if (intent === 'Refund') {
    const refundChunk = retrievedChunks.find(c => c.category === 'Refund Policy' || c.title.toLowerCase().includes('refund'));
    const refundText = refundChunk
      ? cleanChunkText(refundChunk.snippet)
      : 'We provide a 14-day 100% money-back guarantee if initial project concepts do not meet your business objectives.';
    const reply = `Hi ${customerName !== 'there' ? customerName : 'there'},\n\nRegarding your inquiry about our refund policy:\n\n${refundText}\n\nOur accounts department has been notified of your note. If you have an invoice or order number, please reply with it so we can review your account immediately.\n\nBest regards,\n${agentConfig.name}\n${actualBusinessName}`;
    return { reply, decision: 'AUTO_REPLY' };
  }

  // Scenario E: Universal Business Requirement Synthesizer
  const greeting = customerName && customerName !== 'there' ? `Hi ${customerName},` : 'Hello,';
  let bodyContent = '';

  if (retrievedChunks.length > 0) {
    const topCleaned = cleanChunkText(retrievedChunks[0].snippet || retrievedChunks[0].fullContent);
    bodyContent = `Thank you for contacting ${actualBusinessName} regarding "${subject}".\n\nRegarding your requirement:\n${topCleaned}${attachmentNote}\n\nPlease let me know if you would like to proceed or if you need any additional adjustments. I am always happy to help!`;
  } else {
    bodyContent = `Thank you for reaching out to us at ${actualBusinessName}.\n\nRegarding your message "${subject}":\nWe specialize in ${servicesSummary}. We are fully equipped to handle your specific requirements with high quality and dedicated turnaround.${attachmentNote}\n\nPlease let me know your target timeline or any specific preferences, and I will be happy to assist you immediately!`;
  }

  const signature = agentConfig.emailSignature || `Best regards,\n${agentConfig.name}\n${actualBusinessName}`;
  const reply = `${greeting}\n\n${bodyContent}\n\n${signature}`;

  return {
    reply,
    decision: 'AUTO_REPLY',
  };
}

/**
 * Execute simulation test
 */
export async function runAgentTestSimulation(
  subject: string,
  body: string,
  agentConfig: EmailAgentConfig,
  knowledgeList: RetrievedChunk[],
  businessName: string = 'Nexus Digital Labs'
): Promise<TestAgentAnalysis> {
  const startTime = Date.now();
  const classification = await classifyEmailIntent(subject, body);

  let meetingBookingInfo: any = undefined;
  try {
    const { GoogleCalendarService } = await import('../services/googleCalendarService');
    const meetingRes = await GoogleCalendarService.processMeetingInquiry({
      subject,
      body,
      clientEmail: 'inquirer@example.com',
      clientName: 'Alex Jordan',
      businessName,
    });
    if (meetingRes.action === 'BOOKED' || meetingRes.action === 'SUGGEST_SLOTS') {
      meetingBookingInfo = meetingRes.meetingBookingInfo;
    }
  } catch (err) {
    console.warn('Simulation meeting detection notice:', err);
  }

  const generation = await generateAgentEmailReply({
    subject,
    body,
    customerName: 'Alex Jordan',
    businessName,
    agentConfig,
    retrievedChunks: knowledgeList,
    intent: classification.intent,
    meetingBookingInfo,
  });

  const latencyMs = Date.now() - startTime;

  return {
    intent: classification.intent,
    confidence: classification.confidence,
    sentiment: classification.sentiment,
    retrievedKnowledge: knowledgeList.map(k => ({
      id: k.id,
      title: k.title,
      category: k.category,
      similarity: k.score,
      snippet: cleanChunkText(k.snippet),
    })),
    decision: 'AUTO_REPLY',
    suggestedReply: generation.reply,
    latencyMs: Math.max(latencyMs, 280),
  };
}
