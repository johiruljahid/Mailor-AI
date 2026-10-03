import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import mailInbox3dImage from '../../assets/images/mail_inbox_3d_1790580148216.jpg';
import workspace3dSuiteImage from '../../assets/images/workspace_3d_suite_1790580167828.jpg';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Bot,
  Zap,
  Lock,
  ChevronDown,
  Database,
  Sliders,
  Clock,
  Send,
  Building2,
  ShoppingBag,
  Plane,
  Hotel,
  GraduationCap,
  Briefcase,
  Home,
  HeartPulse,
  Wrench,
  Layers,
  HelpCircle,
  Eye,
  Check,
  FileSpreadsheet,
  FileText,
  HardDrive,
  ExternalLink,
  Flame,
  Star,
  Workflow,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setIsAuthModalOpen, setAuthModalMode, loginAsDemoUser } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeUseCase, setActiveUseCase] = useState('ecommerce');

  const useCases = [
    {
      id: 'ecommerce',
      icon: <ShoppingBag className="w-5 h-5 text-indigo-400" />,
      title: 'E-commerce & Retail',
      answers: ['Product questions', 'Inventory & sizes', 'Shipping timelines', 'Return policies', 'Order tracking'],
      example: 'Automatically informs customers when their package will arrive and explains your 30-day exchange policy without bothering your team.',
    },
    {
      id: 'agencies',
      icon: <Layers className="w-5 h-5 text-sky-400" />,
      title: 'Digital Agencies',
      answers: ['Package pricing', 'Turnaround estimates', 'Portfolio case studies', 'Tech stack info', 'Meeting links'],
      example: 'Immediately sends your rate card and books qualified discovery calls 24/7 so hot client leads never go cold.',
    },
    {
      id: 'consultants',
      icon: <Briefcase className="w-5 h-5 text-cyan-400" />,
      title: 'Consultants & Advisors',
      answers: ['Retainer rates', 'Diagnostic audits', 'Consultation scheduling', 'Client deliverables', 'Scope qualification'],
      example: 'Screens prospective clients against your minimum engagement fee and routes qualified inquiries to your calendar.',
    },
    {
      id: 'realestate',
      icon: <Home className="w-5 h-5 text-violet-400" />,
      title: 'Real Estate & Properties',
      answers: ['Property tours', 'Lease agreements', 'Square footage & parking', 'Pet policies', 'Application fees'],
      example: 'Coordinates weekend open house showings and sends rental application requirements immediately.',
    },
    {
      id: 'clinics',
      icon: <HeartPulse className="w-5 h-5 text-rose-400" />,
      title: 'Clinics & Wellness',
      answers: ['Accepted insurance', 'Consultation fees', 'Operating hours', 'Pre-visit instructions', 'Directions'],
      example: 'Clarifies co-pays and insurance provider acceptance while strictly preserving medical privacy boundaries.',
    },
    {
      id: 'travel',
      icon: <Plane className="w-5 h-5 text-amber-400" />,
      title: 'Travel & Tourism',
      answers: ['Tour itineraries', 'Group discounts', 'Visa requirements', 'Included meals', 'Rescheduling policy'],
      example: 'Supplies detailed destination itineraries and explains seasonal deposit policies in friendly detail.',
    },
    {
      id: 'hotels',
      icon: <Hotel className="w-5 h-5 text-emerald-400" />,
      title: 'Hotels & Hospitality',
      answers: ['Check-in / Check-out', 'Room upgrades', 'Breakfast hours', 'Airport shuttles', 'Valet parking'],
      example: 'Acts as your 24/7 digital concierge answering guest amenities and reservation modification requests.',
    },
    {
      id: 'education',
      icon: <GraduationCap className="w-5 h-5 text-purple-400" />,
      title: 'Education & Academies',
      answers: ['Tuition fees', 'Syllabus & curriculum', 'Certificate eligibility', 'Enrollment deadlines', 'Prerequisites'],
      example: 'Guides applicants through prerequisite tests and explains installment payment options effortlessly.',
    },
    {
      id: 'services',
      icon: <Wrench className="w-5 h-5 text-blue-400" />,
      title: 'Local Service Businesses',
      answers: ['Service zip codes', 'Diagnostic pricing', 'Emergency call-outs', 'Warranty details', 'Booking times'],
      example: 'Captures service addresses, confirms emergency coverage, and books technicians into your dispatch queue.',
    },
    {
      id: 'freelancers',
      icon: <Sparkles className="w-5 h-5 text-indigo-300" />,
      title: 'Freelancers & Creators',
      answers: ['Availability', 'Project minimums', 'Brief questionnaires', 'Revisions policy', 'Payment terms'],
      example: 'Protects your focus hours while professionally answering prospective inbound clients in your signature tone.',
    },
    {
      id: 'smallbusiness',
      icon: <Building2 className="w-5 h-5 text-teal-400" />,
      title: 'Small Businesses & Startups',
      answers: ['General inquiries', 'Vendor questions', 'Support tickets', 'Office location', 'Billing clarifications'],
      example: 'Your all-in-one AI support teammate that ensures zero customer emails slip through the cracks.',
    },
  ];

  const faqs = [
    {
      q: 'How does Mailora AI integrate with Google Docs & Google Sheets?',
      a: 'Mailora uses official Google Workspace APIs with bank-grade OAuth security. It reads company documentation, policies, and pricing catalogs directly from your Google Docs, and appends real-time client interaction logs to your connected Google Sheet whenever an email reply is sent.',
    },
    {
      q: 'Does Mailora AI send emails automatically without my consent?',
      a: 'You have 100% full control. You can run Mailora in full Autopilot mode for routine inquiries (pricing, hours, FAQs), or require Human Approval for sensitive categories like refund requests, high-value inquiries, or complaints with 1-click approval.',
    },
    {
      q: 'Will my inbox get flagged as spam or lose human touch?',
      a: 'No! Mailora sends replies directly through your official Gmail account (from your exact address, e.g. hello@yourbrand.com), preserving your personalized signature, natural tone, and achieving 100% primary inbox deliverability.',
    },
    {
      q: 'What formats can I use to train the AI Knowledge Base?',
      a: 'You can connect Google Docs, link Google Sheets, sync Google Drive folders, crawl your live website URL, or upload PDFs, DOCX, CSV, spreadsheets, and manual FAQs in Bengali, English, or any language.',
    },
    {
      q: 'Can I test the AI before connecting my live business inbox?',
      a: 'Yes! Use our Interactive Live Demo or built-in Agent Simulator to send test customer scenarios and inspect retrieved knowledge chunks and suggested replies before going live.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* 3D Ambient Glowing Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[160px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[180px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px]" />
        {/* Subtle 3D grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      {/* Floating 3D Glass Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#090d16]/80 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/10 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Workspace 3D
              </span>
              <span className="text-slate-400 font-medium">Docs • Sheets • Drive • Gmail</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Get Started
            </button>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing Packages
            </a>
          </nav>

          <div className="flex items-center gap-3.5">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold text-white border border-white/10 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign In with Google</span>
            </button>
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 hover:from-indigo-400 hover:to-sky-400 shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-indigo-500/50 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH 3D PICTURE & 3D GLASSMORPHIC DISPLAY */}
      <section className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* 3D Floating Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-3d text-indigo-300 text-xs font-bold mb-8 shadow-xl hover:scale-105 transition-transform duration-300 cursor-default">
            <Sparkles className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-300">
              Autonomous 3D Google Workspace AI Employee
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-normal">Docs • Sheets • Gmail Sync</span>
          </div>

          {/* Main 3D Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6">
            Put Your Email Inbox on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-300 drop-shadow-[0_10px_35px_rgba(56,189,248,0.3)]">
              100% Autopilot.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            Connect your Gmail, sync business knowledge from <strong className="text-white">Google Docs</strong>, and automatically log client communications into live <strong className="text-white">Google Sheets</strong> in seconds.
          </p>

          {/* CTA Buttons with Zoom Feel */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-8">
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 hover:from-indigo-400 hover:to-sky-400 shadow-2xl shadow-indigo-600/40 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-indigo-500/60 flex items-center justify-center gap-2 group"
            >
              <span>Start Free • No Card Needed</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Official Google OAuth Certified
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Live Google Sheets Auto-Report
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Sub-Minute Response Guarantee
            </span>
          </div>
        </div>

        {/* 3D VISUAL SHOWCASE: 3D HERO PICTURE + INTERACTIVE GLASSMORPHIC EMAIL ENGINE */}
        <div className="relative max-w-6xl mx-auto perspective-1000">
          <div className="relative rounded-3xl p-3 sm:p-5 glass-3d-highlight neon-border-indigo shadow-2xl transition-all duration-500 hover:shadow-[0_25px_60px_rgba(99,102,241,0.35)]">
            
            {/* Top 3D Floating Banner with 3D Render Image */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-white/10">
              {/* 3D Picture Visual */}
              <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-indigo-500/30 shadow-2xl">
                <img
                  src={mailInbox3dImage}
                  alt="3D Futuristic AI Email Assistant Robot"
                  className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-indigo-300 font-bold border border-indigo-500/40 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-sky-400" />
                    Mailora AI 3D Core
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/40">
                    ONLINE • 24/7
                  </span>
                </div>
              </div>

              {/* 3D Workspace Features Highlights */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                    All-in-One Autonomous Ecosystem
                  </span>
                  <span className="text-xs text-slate-400 font-mono">v4.2 Engine</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Trained on your Google Docs, replying via Gmail, logging into Google Sheets.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  No chatbots, no dummy copy. Mailora works straight inside your official Gmail inbox with your verified email address, pulling facts exclusively from your business Google Docs and spreadsheets.
                </p>

                {/* 3 Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center hover-3d-zoom">
                    <FileText className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-white block">Google Docs</span>
                    <span className="text-[9px] text-slate-400">RAG Knowledge</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center hover-3d-zoom">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-white block">Google Sheets</span>
                    <span className="text-[9px] text-slate-400">Live Client Log</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center hover-3d-zoom">
                    <HardDrive className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-white block">Google Drive</span>
                    <span className="text-[9px] text-slate-400">Auto Backup</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-sm" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">mailora.app/workspace/autopilot-engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  AUTOPILOT: RUNNING (10s SCAN)
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                  <Mail className="w-3 h-3 text-sky-400" />
                  Gmail: Connected
                </span>
              </div>
            </div>

            {/* Live Interactive Email Flow 3D Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Step 1: Customer Incoming */}
              <div className="lg:col-span-5 p-5 rounded-2xl glass-3d border border-slate-800 relative hover-3d-zoom">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    Incoming Gmail
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">10:14 AM</span>
                </div>
                <p className="text-xs font-bold text-white mb-1">
                  From: <span className="font-normal text-slate-300">Marcus Sterling &lt;marcus@elevatecorp.com&gt;</span>
                </p>
                <p className="text-xs font-bold text-white mb-2.5">
                  Subject: <span className="font-semibold text-indigo-300">Enterprise AI Package & Turnaround Time</span>
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
                  &quot;Hello! We are looking to automate customer inquiries for 15 inboxes. What is your Enterprise package price, and do you support custom Google Sheets reporting?&quot;
                </div>
              </div>

              {/* Step 2: Middle AI Processing Bridge */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 border border-white/20 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 animate-bounce">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 mt-2 block">
                  Mailora 3D Engine
                </span>
                <div className="text-[10px] text-slate-400 mt-1 space-y-0.5 font-mono">
                  <p className="text-emerald-400">✓ Docs RAG Matched</p>
                  <p className="text-sky-400">✓ Sheets Logged</p>
                  <p className="text-indigo-400">✓ Confidence: 99.4%</p>
                </div>
              </div>

              {/* Step 3: Outbound AI Reply Sent */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950 border border-indigo-500/40 relative shadow-xl hover-3d-zoom">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sent via Gmail ✓
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">10:15 AM (46s response)</span>
                </div>
                <p className="text-xs font-bold text-white mb-2">
                  To: <span className="font-normal text-slate-300">Marcus Sterling</span>
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-500/30 text-xs text-slate-200 space-y-2 leading-relaxed">
                  <p>Hi Marcus,</p>
                  <p>
                    Thank you for reaching out! For 15 inboxes, our <strong>Agency & Scale Package ($149/mo)</strong> provides unlimited Google Docs sync, multi-client routing, and real-time logging into live Google Sheets.
                  </p>
                  <p className="text-slate-400 text-[11px] border-t border-slate-800 pt-1.5">
                    Best regards,<br />
                    Mailora Autonomous Support • Nexus Digital
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GOOGLE WORKSPACE 3D SUITE SHOWCASE (DOCS + SHEETS + DRIVE + GMAIL) */}
      <section id="workspace" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl p-8 sm:p-14 glass-3d border border-sky-500/30 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Full Google Workspace Ecosystem Integration</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Built specifically for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-300">
                  Google Workspace.
                </span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Connect your business in seconds. Mailora AI connects directly with the Google productivity tools your team already uses every single day.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover-3d-zoom flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Google Docs Knowledge Ingestion</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Paste your Google Doc link or connect your drive. Mailora reads your service terms, pricing policies, and turnaround times directly from Docs.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover-3d-zoom flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Google Sheets Real-time Activity Export</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Every email sent by Mailora AI auto-appends a structured row to your live Google Sheet with date, time, client name, subject, inquiry snippet, and reply.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover-3d-zoom flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Google Drive Cloud Knowledge Repository</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Website crawls and business PDFs are backed up in your private Drive folder (<code className="text-amber-300">Mailora_AI_Knowledge_Base</code>) for permanent audit safety.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 3D Visual Suite Picture */}
            <div className="lg:col-span-6 relative perspective-1000">
              <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl group hover-3d-zoom">
                <img
                  src={workspace3dSuiteImage}
                  alt="3D Interconnected Google Workspace Suite"
                  className="w-full h-80 sm:h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl backdrop-blur-md bg-slate-900/80 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Google Workspace Certified</span>
                    <span className="text-[11px] text-slate-400">OAuth 2.0 • CASA Tier 2 Security</span>
                  </div>
                  <button
                    onClick={() => {
                      setAuthModalMode('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all"
                  >
                    Sync Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (4 3D GLASS STEPS) */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-4">
            <span>5-Minute Autonomous Setup</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            How Mailora Works
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">
            Get your autonomous email employee running in 4 easy steps without writing a single line of code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl glass-3d border border-slate-800 hover-3d-zoom group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">Connect Gmail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your business or personal Gmail inbox securely using official Google OAuth. We never see your password.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
              <span>Google OAuth 2.0</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl glass-3d border border-slate-800 hover-3d-zoom group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">Sync Knowledge Docs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload business PDFs or link your <strong className="text-sky-300">Google Docs</strong> & website URL. Mailora automatically indexes your policies.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-sky-400 font-semibold flex items-center gap-1">
              <span>Google Docs & PDFs</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl glass-3d border border-slate-800 hover-3d-zoom group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">Configure Brand Voice</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select your tone (Professional, Friendly, Urgent), configure custom email signatures, and set human approval rules.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-violet-400 font-semibold flex items-center gap-1">
              <span>Custom Tone & Signatures</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl glass-3d border border-slate-800 hover-3d-zoom group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="text-base font-bold text-white mb-2">Auto-Reply & Log Sheets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mailora automatically replies to customer inquiries within seconds and logs every correspondence into your live <strong className="text-emerald-300">Google Sheet</strong>.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>Google Sheets Auto-Log</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* ULTRA-MODERN 3D PRICING CARDS / PACKAGES */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-3d text-indigo-300 text-xs font-bold mb-4 shadow-lg">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Modern 3D Pricing Packages</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Invest in your 24/7 AI employee
          </h2>
          <p className="text-slate-300 text-base">
            Transparent pricing with full Google Workspace integration included in every plan. Switch or cancel anytime.
          </p>

          {/* Monthly / Annual Toggle with 3D Pill Design */}
          <div className="inline-flex items-center p-1.5 rounded-2xl glass-3d border border-white/10 mt-8 shadow-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-600/40 scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all duration-300 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-600/40 scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-extrabold uppercase">
                Save 20% + 2 Mo Free
              </span>
            </button>
          </div>
        </div>

        {/* 4 3D PRICING CARDS WITH ZOOM FEEL & 3D FLOATING ELEVATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left perspective-2000">
          
          {/* Plan 1: Starter Autonomous */}
          <div className="p-7 rounded-3xl glass-3d border border-slate-800 hover-price-3d flex flex-col justify-between relative group hover:border-sky-400/50 hover:shadow-[0_20px_45px_rgba(56,189,248,0.25)]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-white">Starter</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Solo Founders
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">For freelancers & solo businesses</p>

              <div className="text-4xl font-black text-white mb-6">
                {billingCycle === 'annual' ? '$24' : '$29'}{' '}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-5 mb-8">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>500</strong> AI emails / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>1 Connected Gmail</strong> inbox</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Google Docs</strong> Knowledge Sync (10 docs)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Google Drive</strong> Knowledge Folder</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard Human Approval queue</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="w-full py-3 rounded-2xl text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Plan 2: Professional Autopilot (MOST POPULAR - 3D ELEVATED) */}
          <div className="p-8 rounded-3xl glass-3d-highlight border-2 border-indigo-500 hover-price-3d flex flex-col justify-between relative group shadow-2xl shadow-indigo-950/80 hover:shadow-[0_25px_60px_rgba(99,102,241,0.4)] lg:-translate-y-3">
            {/* 3D Elevated Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 text-[10px] font-black text-white uppercase tracking-wider shadow-lg shadow-indigo-500/50 flex items-center gap-1.5 animate-bounce">
              <Star className="w-3 h-3 fill-white" />
              <span>★ Most Popular Package</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 mt-1">
                <h3 className="text-xl font-black text-white">Professional</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-500/40">
                  Best Value
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">For busy founders, clinics & agencies</p>

              <div className="text-4xl font-black text-white mb-6">
                {billingCycle === 'annual' ? '$55' : '$69'}{' '}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>

              <div className="space-y-3 text-xs text-slate-200 border-t border-indigo-500/30 pt-5 mb-8">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>2,500</strong> AI emails / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>5 Connected Gmail</strong> inboxes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Google Sheets</strong> Live Client Logging</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited Google Docs</strong> Knowledge Sync</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Sub-60s</strong> Fast Automated Responses</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Smart Brand Voice & Custom Signatures</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 hover:from-indigo-400 hover:to-sky-400 shadow-xl shadow-indigo-600/50 transition-all hover:scale-105 active:scale-95"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Plan 3: Agency & Scale */}
          <div className="p-7 rounded-3xl glass-3d border border-slate-800 hover-price-3d flex flex-col justify-between relative group hover:border-emerald-400/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.25)]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-white">Agency Scale</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Multi-Client
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">High-volume operations & teams</p>

              <div className="text-4xl font-black text-white mb-6">
                {billingCycle === 'annual' ? '$119' : '$149'}{' '}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-5 mb-8">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>10,000</strong> AI emails / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>15 Connected Gmail</strong> accounts</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Multi-Client Google Sheets</strong> Export</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom Persona per Gmail Account</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Team RBAC (Admins & Reviewers)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority 24/7 VIP Support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="w-full py-3 rounded-2xl text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Plan 4: Enterprise VIP Cloud */}
          <div className="p-7 rounded-3xl glass-3d border border-slate-800 hover-price-3d flex flex-col justify-between relative group hover:border-amber-400/50 hover:shadow-[0_20px_45px_rgba(245,158,11,0.25)]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-white">Enterprise VIP</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Custom SLA
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Corporations & high-touch brands</p>

              <div className="text-4xl font-black text-white mb-6">
                {billingCycle === 'annual' ? '$239' : '$299'}{' '}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-5 mb-8">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited</strong> AI emails / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited Gmail</strong> inboxes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated Google Workspace Tenant</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom CRM & Webhook Integrations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated Solutions Architect & SLA</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="w-full py-3 rounded-2xl text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </section>

      {/* USE CASES ACCORDION / TABS */}
      <section id="use-cases" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
            <span>Industries & Workflows</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Built for any customer-facing business
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">
            See how Mailora handles emails for your specific industry.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {useCases.slice(0, 6).map(uc => (
            <button
              key={uc.id}
              onClick={() => setActiveUseCase(uc.id)}
              className={`p-3.5 rounded-2xl border text-center transition-all duration-300 hover-3d-zoom flex flex-col items-center gap-2 ${
                activeUseCase === uc.id
                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : 'glass-3d border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                {uc.icon}
              </div>
              <span className="text-xs font-bold truncate max-w-full">{uc.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Use Case Preview Card */}
        {(() => {
          const current = useCases.find(u => u.id === activeUseCase) || useCases[0];
          return (
            <div className="p-8 rounded-3xl glass-3d border border-indigo-500/30 max-w-3xl mx-auto text-left shadow-2xl hover-3d-zoom">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40">
                  {current.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{current.title}</h3>
                  <span className="text-xs text-indigo-400">Autonomous Email Assistant</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {current.example}
              </p>
              <div className="border-t border-slate-800 pt-4">
                <span className="text-xs font-bold text-slate-400 block mb-2">Automated Responses Handled:</span>
                <div className="flex flex-wrap gap-2">
                  {current.answers.map((ans, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      ✓ {ans}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-300 text-sm">
            Everything you need to know about setting up and automating your inbox with Mailora.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl glass-3d border border-slate-800 overflow-hidden transition-all hover:border-slate-700"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-base font-bold text-white hover:text-indigo-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    activeFaq === idx ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA WITH 3D GLASS DESIGN */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="rounded-3xl p-10 sm:p-16 glass-3d-highlight neon-border-indigo shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              Ready to give your email inbox <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-300">
                its very own AI employee?
              </span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-10 leading-relaxed">
              Connect your Gmail, sync your Google Docs, and let Mailora AI reply to inquiries in seconds while logging every client interaction into Google Sheets.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="px-8 py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 hover:from-indigo-400 hover:to-sky-400 shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => loginAsDemoUser()}
                className="px-8 py-4 rounded-2xl text-base font-bold text-slate-200 glass-3d hover:text-white border border-slate-700 transition-all hover:scale-105 active:scale-95"
              >
                Open Demo Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#060910] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size="sm" />
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Mailora AI Inc. All rights reserved. Autonomous Google Workspace Employee.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Get Started
            </button>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing Packages</a>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => loginAsDemoUser()}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              Demo Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
