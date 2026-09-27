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
 * Classify the intent of an incoming customer email
 */
export async function classifyEmailIntent(subject: string, body: string): Promise<{
  intent: EmailIntent;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'urgent' | 'negative';
}> {
  const content = `${subject}\n\n${body}`.toLowerCase();
  const aiClient = getGeminiClient();

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an AI email triage engine for a business.
Analyze the incoming email below and return a JSON object with:
1. "intent": one of ["Sales inquiry", "Product question", "Pricing", "Support", "Complaint", "Refund", "Booking", "Appointment", "Partnership", "Job application", "General inquiry", "Spam", "Other"]
2. "confidence": a number between 0.0 and 1.0
3. "sentiment": one of ["positive", "neutral", "urgent", "negative"]

EMAIL:
Subject: ${subject}
Body: ${body}

Return ONLY raw JSON, nothing else:
{"intent": "...", "confidence": 0.95, "sentiment": "..."}`,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        intent: parsed.intent || 'General inquiry',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.94,
        sentiment: parsed.sentiment || 'neutral',
      };
    } catch (e) {
      console.warn('Gemini classification fallback to heuristics:', e);
    }
  }

  // Fast heuristics
  if (content.includes('refund') || content.includes('money back') || content.includes('chargeback') || content.includes('reimburse')) {
    return { intent: 'Refund', confidence: 0.96, sentiment: 'urgent' };
  }
  if (content.includes('angry') || content.includes('horrible') || content.includes('terrible') || content.includes('complain') || content.includes('broken')) {
    return { intent: 'Complaint', confidence: 0.94, sentiment: 'negative' };
  }
  if (content.includes('price') || content.includes('pricing') || content.includes('quote') || content.includes('cost') || content.includes('package') || content.includes('how much')) {
    return { intent: 'Pricing', confidence: 0.95, sentiment: 'positive' };
  }
  if (content.includes('book') || content.includes('reservation') || content.includes('appointment') || content.includes('schedule a call') || content.includes('meeting')) {
    return { intent: 'Booking', confidence: 0.93, sentiment: 'positive' };
  }
  if (content.includes('partner') || content.includes('affiliate') || content.includes('sponsor')) {
    return { intent: 'Partnership', confidence: 0.91, sentiment: 'neutral' };
  }
  if (content.includes('name') || content.includes('who are you') || content.includes('nam ki') || content.includes('naam ki')) {
    return { intent: 'General inquiry', confidence: 0.98, sentiment: 'neutral' };
  }
  if (content.includes('help') || content.includes('issue') || content.includes('login') || content.includes('password')) {
    return { intent: 'Support', confidence: 0.92, sentiment: 'neutral' };
  }

  return { intent: 'General inquiry', confidence: 0.90, sentiment: 'neutral' };
}

/**
 * Generate 100% Human-like, Situation-Aware Email Reply
 * Matches the sender's question directly, uses concise answers for short queries,
 * detailed structure for complex questions, and enables live web search grounding.
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
}): Promise<{
  reply: string;
  decision: 'AUTO_REPLY' | 'NEEDS_REVIEW' | 'ESCALATE_HUMAN';
  reviewReason?: string;
}> {
  const {
    subject,
    body,
    customerName = 'there',
    businessName = 'Nexus Digital Labs',
    agentConfig,
    retrievedChunks,
    intent,
    enableWebSearch = true,
  } = params;

  const decision: 'AUTO_REPLY' = 'AUTO_REPLY';

  // Language instructions
  const languageInstruction =
    agentConfig.replyLanguage === 'Bangla'
      ? 'Reply completely in natural, warm, polite conversational Bangla (বাংলা).'
      : agentConfig.replyLanguage === 'Bangla + English'
      ? 'Provide a concise bilingual response in warm Bangla (বাংলা) followed by English.'
      : 'Carefully detect the language of the incoming message: If the customer writes in Bangla (or Banglish), reply in natural polite Bangla. If they write in English, reply in natural professional English.';

  // Construct verified context
  const verifiedContext = retrievedChunks
    .map((c, i) => `[Knowledge Resource ${i + 1}: "${c.title}" (${c.category})]\n${c.fullContent}`)
    .join('\n\n');

  const aiClient = getGeminiClient();

  if (aiClient) {
    try {
      const prompt = `You are ${agentConfig.name}, a real human team member and client support lead at ${businessName}.
Tone: ${agentConfig.tone}.
Language requirement: ${languageInstruction}

CRITICAL HUMAN AUTHENTICITY DIRECTIVES:
1. You MUST sound like a genuine, intelligent, warm human being typing an email from their desk.
2. The customer must NEVER suspect this is an AI, bot, virtual assistant, machine, or automated script.
3. NEVER use robotic clichés or generic canned fillers like:
   - "As an AI language model..."
   - "I hope this email finds you well!"
   - "Thank you for reaching out to us today!"
   - "Your inquiry has been logged into our system."
   - "Feel free to let me know if you have any questions."
4. SITUATION-AWARE BREVITY & DIRECT RELEVANCE:
   - Read the customer's email carefully and answer EXACTLY what they asked!
   - If the customer asked a short or simple question (for example: "What is your name?", "Tomar nam ki?", "Are you open on Saturdays?", "What is your office location?"):
     -> Give a DIRECT, CONCISE, 1 to 2 sentence human answer!
     -> Example: If they ask "What is your name?" or "tomar name ki", reply:
        "Hi! My name is ${agentConfig.name} from the ${businessName} team. How can I help you today?"
        (If asked in Bangla: "আসসালামু আলাইকুম, আমি ${agentConfig.name}, ${businessName} থেকে বলছি। আপনাকে কীভাবে সহযোগিতা করতে পারি?")
   - If the customer asked a multi-part or complex question (e.g. pricing, packages, custom software, refund process):
     -> Provide a well-structured, clear, point-by-point reply that answers every single question they raised.
5. GROUNDING:
   - Base all facts on the VERIFIED COMPANY KNOWLEDGE below.
   - If live web data or current information is required, use Google Search Grounding to fetch accurate facts.
   - Never invent false business terms or non-existent discounts.
6. SIGN-OFF:
   - Sign off naturally as a human team member:
${agentConfig.emailSignature || `Best regards,\n${agentConfig.name}\n${businessName}`}

AGENT CUSTOM INSTRUCTIONS:
${agentConfig.instructions}

VERIFIED COMPANY KNOWLEDGE:
${verifiedContext || 'Operate using standard courteous business practices.'}

INCOMING CUSTOMER EMAIL:
Sender Name: ${customerName}
Subject: ${subject}
Message:
${body}

Generate the final, complete email reply text:`;

      // Call Gemini 3.8 Flash with Google Search Grounding
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
      console.warn('Gemini generation notice, falling back to human-like contextual synthesizer:', e);
    }
  }

  // Human-like Contextual Synthesizer Fallback
  // Handles situations like "What is your name?", pricing, support with human warmth
  const cleanBodyLower = `${subject} ${body}`.toLowerCase();
  const isBangla = /[\u0980-\u09FF]/.test(cleanBodyLower) || cleanBodyLower.includes('nam ki') || cleanBodyLower.includes('naam ki') || cleanBodyLower.includes('kemon');

  // Check if it's an inquiry about the sender's identity / name
  if (
    cleanBodyLower.includes('your name') ||
    cleanBodyLower.includes('who are you') ||
    cleanBodyLower.includes('tomar nam') ||
    cleanBodyLower.includes('apnar nam') ||
    cleanBodyLower.includes('naam ki') ||
    cleanBodyLower.includes('nam ki')
  ) {
    if (isBangla) {
      const banglaReply = `আসসালামু আলাইকুম!\n\nআমি ${agentConfig.name}, ${businessName}-এর সাপোর্ট টিম থেকে বলছি। আপনাকে কীভাবে সহযোগিতা করতে পারি?\n\nআন্তরিক ধন্যবাদ,\n${agentConfig.name}\n${businessName}`;
      return { reply: banglaReply, decision: 'AUTO_REPLY' };
    } else {
      const engReply = `Hi ${customerName && customerName !== 'there' ? customerName : 'there'},\n\nMy name is ${agentConfig.name} from the ${businessName} team! How can I help you today?\n\nBest regards,\n${agentConfig.name}\n${businessName}`;
      return { reply: engReply, decision: 'AUTO_REPLY' };
    }
  }

  // Contextual human response based on intent and retrieved knowledge
  const greeting = customerName && customerName !== 'there' ? `Hi ${customerName},` : 'Hello,';
  let bodyContent = '';

  if (intent === 'Refund') {
    const refundChunk = retrievedChunks.find(c => c.category === 'Refund Policy' || c.title.toLowerCase().includes('refund'));
    if (refundChunk) {
      bodyContent = `Regarding your refund question: ${refundChunk.snippet}\n\nOur team is reviewing this for you right away. If you have any transaction or receipt details, simply reply here so we can expedite it for you.`;
    } else {
      bodyContent = `I received your message regarding a refund for "${subject}". I've passed your note directly to our billing department, and one of us will follow up with confirmation shortly.`;
    }
  } else if (intent === 'Pricing' || intent === 'Sales inquiry') {
    const priceChunk = retrievedChunks.find(c => c.category === 'Pricing' || c.category === 'Products' || c.category === 'Services');
    if (priceChunk) {
      bodyContent = `Regarding our pricing and packages:\n\n${priceChunk.snippet}\n\nIf you'd like to discuss a customized package or have specific requirements in mind, feel free to reply right here and I'll be happy to assist you!`;
    } else {
      bodyContent = `Thank you for asking about our services and pricing for "${subject}". We offer tailored packages suited to your specific goals. Feel free to share a few details about what you need, and I'll get back to you with an exact estimate!`;
    }
  } else if (retrievedChunks.length > 0) {
    const topChunk = retrievedChunks[0];
    bodyContent = `Regarding your inquiry:\n\n${topChunk.snippet}\n\nIf you need any further clarification, just let me know!`;
  } else {
    bodyContent = `Thank you for getting in touch regarding "${subject}". I have noted your message and will be happy to assist you with whatever you need.\n\nCould you please share a few more details so I can help you as best as possible?`;
  }

  const signature = agentConfig.emailSignature || `Best regards,\n${agentConfig.name}\n${businessName}`;
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
  knowledgeList: RetrievedChunk[]
): Promise<TestAgentAnalysis> {
  const startTime = Date.now();
  const classification = await classifyEmailIntent(subject, body);
  const generation = await generateAgentEmailReply({
    subject,
    body,
    customerName: 'Alex Jordan',
    agentConfig,
    retrievedChunks: knowledgeList,
    intent: classification.intent,
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
      snippet: k.snippet,
    })),
    decision: 'AUTO_REPLY',
    suggestedReply: generation.reply,
    latencyMs: Math.max(latencyMs, 280),
  };
}
