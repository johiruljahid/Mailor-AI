import { 
  Business, 
  EmailAgentConfig, 
  EmailThread, 
  EmailMessage, 
  KnowledgeItem, 
  SubscriptionInfo, 
  AutomationRule,
  UserProfile,
  ConnectedGmailAccount
} from '../types';

export const INITIAL_USER: UserProfile = {
  uid: 'usr_owner_8829',
  email: 'johirul4856@gmail.com',
  displayName: 'Johirul Islam',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  businessId: 'biz_mailora_901',
  role: 'owner',
  createdAt: '2026-01-15T09:00:00Z',
};

export const INITIAL_BUSINESS: Business = {
  id: 'biz_mailora_901',
  ownerUid: 'usr_owner_8829',
  name: 'Nexus Digital Agency',
  industry: 'Agencies & Service Business',
  website: 'https://nexusdigital.example.com',
  timezone: 'America/New_York (EST)',
  supportEmail: 'hello@nexusdigital.example.com',
  createdAt: '2026-01-15T09:15:00Z',
};

export const INITIAL_GMAIL_ACCOUNT: ConnectedGmailAccount = {
  email: 'johirul4856@gmail.com',
  name: 'Nexus Support Inbox',
  status: 'connected',
  connectedAt: '2026-03-01T14:20:00Z',
  dailySentCount: 38,
  dailyQuota: 500,
  isDemo: true,
};

export const INITIAL_AGENT: EmailAgentConfig = {
  id: 'agt_mailora_01',
  businessId: 'biz_mailora_901',
  name: 'Mailora Assistant',
  status: 'ACTIVE',
  autoReplyEnabled: true,
  humanApprovalRequired: false,
  replyLanguage: 'English',
  tone: 'Friendly',
  instructions: `You are the AI customer support employee for Nexus Digital Agency.
Always answer using verified company information from our knowledge base.
Never invent prices, discounts, delivery dates, or policies not explicitly stated in our documents.
If a customer asks for a refund or reports an angry complaint, respond empathetically and escalate for human manager review.
Always remain professional, helpful, and concise.`,
  emailSignature: `Best regards,
Mailora AI Support Team
Nexus Digital Agency | www.nexusdigital.example.com
"Delivering Next-Gen Web & Brand Experiences"`,
  confidenceThreshold: 0.85,
  updatedAt: '2026-09-20T10:00:00Z',
};

export const INITIAL_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: 'kb_01',
    businessId: 'biz_mailora_901',
    title: 'Website Development Packages & Pricing',
    category: 'Pricing',
    content: `Our Website Development packages are structured into three tiers:
1. Starter Package ($1,499): Includes a high-converting 5-page responsive website, mobile optimization, basic SEO setup, contact forms, and 2 rounds of design revisions. Delivery time: 10 business days.
2. Growth Package ($2,999): Includes up to 12 pages, custom UI/UX design in Figma, CMS integration, speed optimization (90+ Google PageSpeed), blog setup, and 30 days of post-launch support. Delivery time: 3 weeks.
3. Custom Enterprise ($5,500+): Full-stack custom web apps, e-commerce stores, custom animations, CRM integrations, and priority staging environments.
All packages require a 50% upfront deposit to secure the project start date.`,
    status: 'READY',
    isEnabled: true,
    sourceFileName: 'Pricing_Packages_2026.pdf',
    sourceFileType: 'PDF',
    sourceFileSize: '245 KB',
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'kb_02',
    businessId: 'biz_mailora_901',
    title: 'Refund & Satisfaction Policy',
    category: 'Refund Policy',
    content: `Refund Policy:
We offer a 100% money-back guarantee during the initial design concept stage (prior to client approval of the Figma wireframes and development kickoff).
Once frontend development has commenced, deposits become non-refundable as labor and developer hours have been allocated.
For monthly maintenance retainers, clients can cancel at any time with 14 days written notice prior to the next billing cycle.
All refund requests must be reviewed and signed off by the Operations Director.`,
    status: 'READY',
    isEnabled: true,
    sourceFileName: 'Company_Policies_Master.docx',
    sourceFileType: 'DOCX',
    sourceFileSize: '118 KB',
    createdAt: '2026-02-11T14:30:00Z',
    updatedAt: '2026-02-11T14:30:00Z',
  },
  {
    id: 'kb_03',
    businessId: 'biz_mailora_901',
    title: 'Working Hours & Consultation Scheduling',
    category: 'Opening Hours',
    content: `Office Hours:
Monday through Friday: 9:00 AM – 6:00 PM EST.
Saturday & Sunday: Closed (emergency server monitoring active for Enterprise SLA clients).
Clients can schedule a 30-minute discovery call directly via our calendar at calendly.com/nexusdigital/discovery.
Response SLA: All emails received during business hours are addressed within 2 hours. Messages received over the weekend are answered first thing Monday morning.`,
    status: 'READY',
    isEnabled: true,
    sourceFileName: 'Operations_SLA.txt',
    sourceFileType: 'TXT',
    sourceFileSize: '18 KB',
    createdAt: '2026-02-12T09:15:00Z',
    updatedAt: '2026-02-12T09:15:00Z',
  },
  {
    id: 'kb_04',
    businessId: 'biz_mailora_901',
    title: 'SEO & Performance Guarantee FAQ',
    category: 'FAQ',
    content: `Frequently Asked Questions:
Q: Do you guarantee Page 1 rankings on Google?
A: No ethical agency can guarantee specific #1 organic search rankings due to Google's dynamic algorithm. However, we follow white-hat technical SEO best practices, schema markup, semantic headings, and performance optimizations that consistently improve organic visibility.
Q: Will my site be fast on mobile?
A: Yes, we guarantee a Core Web Vitals score above 90 on mobile devices.
Q: Who owns the code and domain?
A: You retain 100% intellectual property ownership of your website, assets, and design files upon final payment.`,
    status: 'READY',
    isEnabled: true,
    sourceFileName: 'Client_FAQ_Cheatsheet.csv',
    sourceFileType: 'CSV',
    sourceFileSize: '54 KB',
    createdAt: '2026-02-14T16:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
  }
];

export const INITIAL_THREADS: EmailThread[] = [
  {
    id: 'thr_01',
    businessId: 'biz_mailora_901',
    customerEmail: 'sarah.j@crestline.io',
    customerName: 'Sarah Jenkins',
    subject: 'Website development package price inquiry',
    snippet: 'Hi, I want to know your website development package price and turnaround time for a 5-page site...',
    detectedIntent: 'Pricing',
    status: 'AUTO_REPLIED',
    confidenceScore: 0.98,
    lastMessageAt: '12 minutes ago',
    unread: false,
    matchedKnowledgeIds: ['kb_01'],
  },
  {
    id: 'thr_02',
    businessId: 'biz_mailora_901',
    customerEmail: 'marcus@vancemedia.com',
    customerName: 'Marcus Vance',
    subject: 'Request for full refund on deposit #NX-8831',
    snippet: 'Due to unexpected internal budget cuts, we cannot move forward. Please process a full refund of our $1,500 deposit...',
    detectedIntent: 'Refund',
    status: 'NEEDS_REVIEW',
    confidenceScore: 0.96,
    lastMessageAt: '28 minutes ago',
    unread: true,
    matchedKnowledgeIds: ['kb_02'],
    aiReviewReason: 'Refund request requires manager sign-off and contract milestone verification ($1,500 deposit).',
  },
  {
    id: 'thr_03',
    businessId: 'biz_mailora_901',
    customerEmail: 'elena.rostova@brightpeak.org',
    customerName: 'Elena Rostova',
    subject: 'Can we book a discovery call for Thursday afternoon?',
    snippet: 'Hello team, we loved your portfolio! We would like to schedule a 30-min call with your design lead this Thursday at 3 PM...',
    detectedIntent: 'Booking',
    status: 'AUTO_REPLIED',
    confidenceScore: 0.95,
    lastMessageAt: '1 hour ago',
    unread: false,
    matchedKnowledgeIds: ['kb_03'],
  },
  {
    id: 'thr_04',
    businessId: 'biz_mailora_901',
    customerEmail: 'd.chen@apextechnologies.io',
    customerName: 'David Chen',
    subject: 'Extremely disappointed with staging environment responsiveness',
    snippet: 'The preview link you sent is freezing on Safari mobile. This is unacceptable for our upcoming investor launch next Tuesday...',
    detectedIntent: 'Complaint',
    status: 'NEEDS_REVIEW',
    confidenceScore: 0.93,
    lastMessageAt: '2 hours ago',
    unread: true,
    matchedKnowledgeIds: ['kb_04'],
    aiReviewReason: 'Urgent complaint detected regarding staging preview & launch deadline.',
  },
  {
    id: 'thr_05',
    businessId: 'biz_mailora_901',
    customerEmail: 'partnerships@growthforge.net',
    customerName: 'Jordan Blake',
    subject: 'Strategic Co-marketing & Partner Directory Listing',
    snippet: 'Hey guys, we run an agency matchmaking directory with 15k monthly founders. Would you be open to an affiliate partnership?',
    detectedIntent: 'Partnership',
    status: 'ESCALATED',
    confidenceScore: 0.91,
    lastMessageAt: '4 hours ago',
    unread: false,
    aiReviewReason: 'Strategic partnership proposal routed to executive team.',
  }
];

export const INITIAL_MESSAGES: Record<string, EmailMessage[]> = {
  thr_01: [
    {
      id: 'msg_01_in',
      threadId: 'thr_01',
      businessId: 'biz_mailora_901',
      sender: 'sarah.j@crestline.io',
      senderName: 'Sarah Jenkins',
      recipient: 'hello@nexusdigital.example.com',
      direction: 'INBOUND',
      body: `Hi there,\n\nI came across your agency and love your design style. I want to know your website development package price and turnaround time for a clean 5-page responsive site for our boutique consulting firm.\n\nLooking forward to hearing from you!\n\nBest,\nSarah Jenkins\nDirector of Operations, Crestline`,
      createdAt: 'Today, 10:15 AM',
    },
    {
      id: 'msg_01_out',
      threadId: 'thr_01',
      businessId: 'biz_mailora_901',
      sender: 'hello@nexusdigital.example.com',
      senderName: 'Mailora Assistant (Nexus Digital)',
      recipient: 'sarah.j@crestline.io',
      direction: 'OUTBOUND_AI',
      body: `Hi Sarah,\n\nThank you so much for reaching out to Nexus Digital! We would love to help you build a high-performing site for Crestline.\n\nFor a 5-page responsive website, our Starter Package ($1,499) is the perfect fit. It includes:\n• Custom responsive design optimized for mobile and desktop\n• Core SEO setup & fast loading architecture\n• Contact and lead capture forms\n• 2 rounds of design revisions\n• Turnaround time: 10 business days from kickoff\n\nIf you'd like to discuss the project or see examples of similar consulting websites we've launched, feel free to book a quick 30-minute discovery call with our team here: calendly.com/nexusdigital/discovery.\n\nLooking forward to collaborating with you!\n\nBest regards,\nMailora AI Support Team\nNexus Digital Agency | www.nexusdigital.example.com\n"Delivering Next-Gen Web & Brand Experiences"`,
      createdAt: 'Today, 10:16 AM',
      matchedKnowledgeSummary: ['Website Development Packages & Pricing', 'Working Hours & Consultation Scheduling'],
    }
  ],
  thr_02: [
    {
      id: 'msg_02_in',
      threadId: 'thr_02',
      businessId: 'biz_mailora_901',
      sender: 'marcus@vancemedia.com',
      senderName: 'Marcus Vance',
      recipient: 'hello@nexusdigital.example.com',
      direction: 'INBOUND',
      body: `Hello Nexus Team,\n\nDue to unexpected Q2 budget restructuring, our board has decided to freeze all external digital initiatives. As a result, we cannot proceed with the planned redesign. Please issue a full refund of our initial $1,500 deposit for invoice #NX-8831 at your earliest convenience.\n\nThank you,\nMarcus Vance\nManaging Partner, Vance Media`,
      createdAt: 'Today, 09:42 AM',
      aiDraft: `Hi Marcus,\n\nThank you for reaching out and informing us about your board's decision regarding the project pause.\n\nAccording to our policy, refunds are fully supported during the initial design concept stage prior to wireframe approval and developer assignment. I have escalated your request directly to our Operations Director along with invoice #NX-8831 to review the current stage of deliverables and process this accordingly.\n\nWe will get back to you within 24 business hours with the exact resolution.\n\nBest regards,\nMailora AI Support Team\nNexus Digital Agency`,
      reviewReason: 'Financial transaction over $500: Refund request flagged for executive review prior to outbound transmission.',
      matchedKnowledgeSummary: ['Refund & Satisfaction Policy'],
    }
  ],
  thr_03: [
    {
      id: 'msg_03_in',
      threadId: 'thr_03',
      businessId: 'biz_mailora_901',
      sender: 'elena.rostova@brightpeak.org',
      senderName: 'Elena Rostova',
      recipient: 'hello@nexusdigital.example.com',
      direction: 'INBOUND',
      body: `Hello Nexus team,\n\nWe saw your recent case study and want to know if we can schedule a discovery call with your lead architect this Thursday around 3:00 PM EST?\n\nWarm regards,\nElena`,
      createdAt: 'Today, 08:30 AM',
    },
    {
      id: 'msg_03_out',
      threadId: 'thr_03',
      businessId: 'biz_mailora_901',
      sender: 'hello@nexusdigital.example.com',
      senderName: 'Mailora Assistant (Nexus Digital)',
      recipient: 'elena.rostova@brightpeak.org',
      direction: 'OUTBOUND_AI',
      body: `Hi Elena,\n\nThank you for reaching out! We're thrilled that you enjoyed our recent case study.\n\nOur team is available this Thursday at 3:00 PM EST. To reserve that specific time slot instantly on our calendar, please click here: calendly.com/nexusdigital/discovery.\n\nIf that link doesn't display Thursday 3:00 PM, let us know and we'll manually send you a direct Google Meet invite!\n\nBest regards,\nMailora AI Support Team\nNexus Digital Agency`,
      createdAt: 'Today, 08:31 AM',
      matchedKnowledgeSummary: ['Working Hours & Consultation Scheduling'],
    }
  ],
  thr_04: [
    {
      id: 'msg_04_in',
      threadId: 'thr_04',
      businessId: 'biz_mailora_901',
      sender: 'd.chen@apextechnologies.io',
      senderName: 'David Chen',
      recipient: 'hello@nexusdigital.example.com',
      direction: 'INBOUND',
      body: `The preview link you sent yesterday is freezing on Safari mobile when tapping the navigation dropdown. This is unacceptable as we have a live investor demo next Tuesday. Who is fixing this and when?`,
      createdAt: 'Today, 07:15 AM',
      aiDraft: `Hi David,\n\nI completely understand your urgency, especially with your investor presentation coming up next Tuesday. I am sincerely sorry for the navigation freeze on Safari mobile.\n\nI have marked this as high priority and assigned our lead frontend engineer to test on Safari iOS immediately. We will push an update to your preview link by 1:00 PM EST today and confirm back with you as soon as the patch is verified.\n\nThank you for bringing this to our attention.\n\nBest regards,\nNexus Digital Support`,
      reviewReason: 'Customer dissatisfaction & critical deadline detected. Needs human engineering verification.',
      matchedKnowledgeSummary: ['SEO & Performance Guarantee FAQ'],
    }
  ]
};

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'rule_01',
    businessId: 'biz_mailora_901',
    name: 'Auto-reply to Pricing inquiries',
    trigger: 'EMAIL_RECEIVED',
    conditionIntent: 'Pricing',
    action: 'AUTO_REPLY',
    isActive: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'rule_02',
    businessId: 'biz_mailora_901',
    name: 'Hold Refund requests for Human Manager Approval',
    trigger: 'EMAIL_RECEIVED',
    conditionIntent: 'Refund',
    action: 'REVIEW_QUEUE',
    isActive: true,
    createdAt: '2026-02-01T10:05:00Z',
  },
  {
    id: 'rule_03',
    businessId: 'biz_mailora_901',
    name: 'Route Angry Complaints to Review Queue',
    trigger: 'EMAIL_RECEIVED',
    conditionIntent: 'Complaint',
    action: 'REVIEW_QUEUE',
    isActive: true,
    createdAt: '2026-02-01T10:10:00Z',
  },
  {
    id: 'rule_04',
    businessId: 'biz_mailora_901',
    name: 'Auto-reply with Booking link to Appointment requests',
    trigger: 'EMAIL_RECEIVED',
    conditionIntent: 'Booking',
    action: 'AUTO_REPLY',
    isActive: true,
    createdAt: '2026-02-05T12:00:00Z',
  }
];

export const INITIAL_SUBSCRIPTION: SubscriptionInfo = {
  businessId: 'biz_mailora_901',
  plan: 'Business',
  status: 'active',
  emailsHandled: 342,
  emailQuota: 1000,
  storageBytesUsed: 1.4 * 1024 * 1024 * 1024, // 1.4 GB
  storageQuotaBytes: 5 * 1024 * 1024 * 1024, // 5 GB
  renewalDate: '2026-10-15T00:00:00Z',
  aiCredits: 2658,
  aiCreditsTotal: 5000,
};

// 11 Industry Business Templates for Onboarding & Customization
export const BUSINESS_TEMPLATES: Record<string, {
  name: string;
  description: string;
  icon: string;
  sampleInstruction: string;
  suggestedFAQs: { title: string; category: string; content: string }[];
}> = {
  ecommerce: {
    name: 'E-commerce & Retail',
    description: 'Automate order tracking, return policies, shipping times, and stock inquiries.',
    icon: 'ShoppingBag',
    sampleInstruction: `You are the AI support representative for an online store.
Help customers track their orders, answer product specs, explain shipping timeframes, and clarify return procedures using our verified policies.
Always ask for order numbers when relevant and maintain a warm, welcoming shopping vibe.`,
    suggestedFAQs: [
      {
        title: 'Shipping & Delivery Timelines',
        category: 'Shipping Policy',
        content: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. Free standard shipping on orders over $50.'
      },
      {
        title: '30-Day Return & Exchange Window',
        category: 'Refund Policy',
        content: 'Items can be returned within 30 days of delivery in original, unused condition with tags attached for a full refund.'
      }
    ]
  },
  travel: {
    name: 'Travel Agencies & Tour Operators',
    description: 'Answer package inquiries, itinerary customization, visa rules, and group bookings.',
    icon: 'Plane',
    sampleInstruction: `You are the travel booking assistant for our luxury travel agency.
Provide adventurous, inspiring, and precise responses regarding tour dates, included amenities, visa requirements, and deposit schedules.`,
    suggestedFAQs: [
      {
        title: 'Tour Cancellation & Weather Policies',
        category: 'Refund Policy',
        content: 'Cancellations 30+ days before departure receive a 90% refund. 15-29 days receive 50%. Force majeure weather events offer free rescheduling.'
      }
    ]
  },
  hotels: {
    name: 'Hotels & Hospitality',
    description: 'Handle check-in times, breakfast options, room upgrades, parking, and reservations.',
    icon: 'Hotel',
    sampleInstruction: `You are the virtual concierge for our boutique hotel.
Answer guest questions with five-star warmth, detailing check-in/out hours, room amenities, dining options, and local attractions.`,
    suggestedFAQs: [
      {
        title: 'Check-in & Check-out Hours',
        category: 'Opening Hours',
        content: 'Check-in begins at 3:00 PM. Check-out is by 11:00 AM. Early check-in or late checkout can be requested subject to availability.'
      }
    ]
  },
  education: {
    name: 'Education & Online Courses',
    description: 'Handle admissions, syllabus questions, certificate eligibility, and tuition fees.',
    icon: 'GraduationCap',
    sampleInstruction: `You are the admissions advisor for our academy.
Provide clear guidance on enrollment deadlines, course prerequisites, payment installments, and graduate career outcomes.`,
    suggestedFAQs: [
      {
        title: 'Course Access & Certification',
        category: 'FAQ',
        content: 'Students receive lifetime access to course recordings. To receive an accredited certificate, complete all 4 capstone projects with 80%+ grade.'
      }
    ]
  },
  consultants: {
    name: 'Consultants & Professional Advisors',
    description: 'Screen incoming leads, share retainer rates, qualify project scope, and book discovery calls.',
    icon: 'Briefcase',
    sampleInstruction: `You are the executive assistant to our principal consultant.
Politely qualify inbound client inquiries, explain our advisory methodology, and invite qualified enterprise decision-makers to book an introductory audit.`,
    suggestedFAQs: [
      {
        title: 'Advisory Retainers & Discovery Audits',
        category: 'Pricing',
        content: 'Initial diagnostic audits start at $2,500. Monthly strategic retainers range from $4,000 to $10,000 depending on advisory hours.'
      }
    ]
  },
  realestate: {
    name: 'Real Estate & Property Management',
    description: 'Answer property showings, lease terms, square footage, neighborhood amenities, and maintenance.',
    icon: 'Home',
    sampleInstruction: `You are the property agent assistant.
Provide accurate details on available residential and commercial listings, schedule viewing appointments, and explain application requirements.`,
    suggestedFAQs: [
      {
        title: 'Tenant Application & Screening Requirements',
        category: 'Company Information',
        content: 'Applicants must show monthly income of 3x rent, clean credit history, and submit background verification with a $45 non-refundable application fee.'
      }
    ]
  },
  clinics: {
    name: 'Clinics & Wellness Centers',
    description: 'Coordinate appointments, insurance coverage, clinic hours, and preparation guidelines.',
    icon: 'HeartPulse',
    sampleInstruction: `You are the patient coordinator assistant for our wellness clinic.
Answer questions about clinic locations, accepted insurance plans, and appointment scheduling. NEVER provide clinical diagnostic advice; direct medical emergencies to local emergency services.`,
    suggestedFAQs: [
      {
        title: 'Accepted Insurance & Co-pays',
        category: 'Pricing',
        content: 'We accept BlueCross, Aetna, UnitedHealthcare, and Medicare. Self-pay consultation rates are $175 for initial visits and $95 for follow-ups.'
      }
    ]
  },
  services: {
    name: 'Home & Local Service Businesses',
    description: 'Electricians, plumbers, landscapers, cleaners—handle quotes, emergency calls, and service areas.',
    icon: 'Wrench',
    sampleInstruction: `You are the dispatch coordinator for our local home service business.
Confirm our service zip codes, quote diagnostic rates, and coordinate same-day emergency dispatch.`,
    suggestedFAQs: [
      {
        title: 'Service Coverage Areas & Emergency Rates',
        category: 'Company Information',
        content: 'We service the greater metropolitan area within 35 miles. Standard diagnostic fee is $89, waived when repairs are approved.'
      }
    ]
  },
  freelancers: {
    name: 'Freelancers & Solo Creators',
    description: 'Protect your focus by letting AI screen freelance inquiries, negotiate base rates, and send contracts.',
    icon: 'Sparkles',
    sampleInstruction: `You are the virtual business manager for an independent creator.
Politely thank potential clients, screen project timelines and budget fit, and guide qualified projects into an onboarding questionnaire.`,
    suggestedFAQs: [
      {
        title: 'Project Minimums & Turnaround',
        category: 'Pricing',
        content: 'My minimum engagement fee is $1,200. Average delivery is 2 weeks from contract signing and initial deposit.'
      }
    ]
  },
  agencies: {
    name: 'Agencies & Creative Studios',
    description: 'Design, marketing, software development agencies managing client briefs and deliverables.',
    icon: 'Layers',
    sampleInstruction: `You are the client success coordinator for our digital agency.
Answer questions on deliverables, packages, tech stacks, and team availability while maintaining a cutting-edge creative tone.`,
    suggestedFAQs: [
      {
        title: 'Design Sprints & Development Scope',
        category: 'Services',
        content: 'We run 2-week agile design sprints. Full product builds include UI/UX, Next.js/React frontend, cloud infrastructure, and CI/CD setup.'
      }
    ]
  },
  smallbusiness: {
    name: 'Small Businesses & Startups',
    description: 'General versatile AI employee handling everyday client, vendor, and partner emails.',
    icon: 'Building2',
    sampleInstruction: `You are the frontline AI employee for our business.
Answer everyday customer questions clearly and accurately using our company knowledge base, leaving no client waiting for hours.`,
    suggestedFAQs: [
      {
        title: 'Business Hours & Contact Methods',
        category: 'Contact Information',
        content: 'We are open Monday through Friday 9 AM to 5 PM. For urgent inquiries, email support@company.com or call our office line.'
      }
    ]
  }
};
