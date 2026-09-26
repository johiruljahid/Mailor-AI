import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
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
      q: 'How does Mailora AI learn about my business?',
      a: 'You can upload your existing documents (PDF, DOCX, TXT, CSV, spreadsheets) or type in your FAQs, pricing packages, and policies directly. Mailora chunks and indexes this information into an isolated knowledge base. Whenever an email arrives, Mailora searches only your verified documents to formulate the answer.',
    },
    {
      q: 'Will Mailora send emails automatically without my review?',
      a: 'You have complete control. You can choose full Auto-Reply mode, or turn on the Human Approval System. Sensitive emails like refund requests, angry complaints, and large transactions are automatically held in your "Needs Attention" queue so you can review, edit, or approve before anything goes out.',
    },
    {
      q: 'Does Mailora have access to my private emails or password?',
      a: 'Never. Mailora connects via official Google OAuth with least-privilege permissions. We never see or store your Google password, and you can revoke access anytime with a single click in your Google account settings.',
    },
    {
      q: 'Can Mailora respond in multiple languages?',
      a: 'Yes! Mailora supports English, standard Bangla (বাংলা), bilingual Bangla + English, and multi-language auto-detection based on the language your customer wrote in.',
    },
    {
      q: 'What happens if a customer asks something not in my documents?',
      a: 'Mailora never hallucinates or invents prices. If information is unavailable in your uploaded business knowledge, Mailora either acknowledges and escalates to a human, or places the email in your review queue with a note explaining that knowledge was missing.',
    },
    {
      q: 'Can I test how the AI will reply before turning it live?',
      a: 'Absolutely. Mailora includes a dedicated "Test Agent Sandbox" where you can type any customer question and inspect the intent classification, matched knowledge chunks, and drafted reply in real-time before activating automatic sending.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[150px]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Next-Gen Autonomous Email SaaS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span className="text-slate-400 font-normal">Trained on your business knowledge</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Let AI Handle <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-300">
            Your Email.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          Connect your Gmail, teach Mailora about your business, and let your AI employee handle repetitive customer emails automatically.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-6">
          <button
            onClick={() => {
              setAuthModalMode('signup');
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-xl shadow-indigo-600/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Start Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              loginAsDemoUser();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 shadow-md transition-all duration-200 hover:text-white flex items-center justify-center gap-2 group"
          >
            <Eye className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            <span>Live Interactive Demo</span>
          </button>
        </div>

        {/* Supporting statement */}
        <p className="text-xs sm:text-sm text-slate-400 mb-16">
          Connect Gmail. Teach your AI. Let it work. • No credit card required.
        </p>

        {/* Live Animated Product Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto rounded-2xl p-2 sm:p-4 bg-gradient-to-b from-indigo-500/20 via-slate-800/40 to-slate-950 border border-indigo-500/30 shadow-2xl shadow-indigo-950/80">
          <div className="rounded-xl bg-slate-900/95 border border-slate-800 p-4 sm:p-6 text-left shadow-inner">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400">mailora.app/workspace/agent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Agent Status: ACTIVE
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full">
                  <Mail className="w-3 h-3 text-sky-400" />
                  Gmail: Connected
                </span>
              </div>
            </div>

            {/* Email Flow Simulation Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Step 1: Customer Incoming */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    Incoming Email (Gmail)
                  </span>
                  <span className="text-[10px] text-slate-500">10:14 AM</span>
                </div>
                <p className="text-xs font-semibold text-white mb-1">
                  From: <span className="font-normal text-slate-300">Sarah Jenkins &lt;sarah@crestline.io&gt;</span>
                </p>
                <p className="text-xs font-semibold text-white mb-2">
                  Subject: <span className="font-normal text-indigo-300">Website development package price</span>
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 italic">
                  "Hi! I want to know your website development package price and turnaround time for a clean 5-page responsive site."
                </div>
              </div>

              {/* Step 2: Middle AI Processing Bridge */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center py-2">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/30">
                  <Bot className="w-5 h-5 animate-bounce" />
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                    Mailora Engine
                  </span>
                  <div className="text-[9px] text-slate-400 mt-0.5 space-y-0.5 font-mono">
                    <p>✓ Intent: Pricing</p>
                    <p>✓ Retrieved: 2 Chunks</p>
                    <p>✓ Confidence: 98%</p>
                  </div>
                </div>
              </div>

              {/* Step 3: Outbound AI Reply Sent */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/40 relative shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AI Reply Sent ✓
                  </span>
                  <span className="text-[10px] text-slate-400">10:15 AM (58s response)</span>
                </div>
                <p className="text-xs font-semibold text-white mb-2">
                  To: <span className="font-normal text-slate-300">Sarah Jenkins</span>
                </p>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-indigo-500/20 text-xs text-slate-200 space-y-1.5 font-normal leading-relaxed">
                  <p>Hi Sarah,</p>
                  <p>
                    Thank you for reaching out! For a 5-page responsive site, our <strong>Starter Package ($1,499)</strong> includes custom mobile design, core SEO, and a 10-day turnaround.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Best regards, <br />
                    Mailora AI Support • Nexus Digital
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Mailora Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-900/50 border-t border-b border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4">
            <span>Simple 4-Step Setup</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            How Mailora Works
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto mb-16">
            Get your autonomous email employee running in under 5 minutes without writing a single line of code.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Connect Gmail</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect your business or personal Gmail inbox securely using official Google OAuth. We never see your password.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Teach Mailora</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload your business PDFs, website links, pricing packages, FAQs, and refund policies. Mailora indexes your knowledge.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Turn on your AI Agent</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Set your brand tone, customize email signature, configure safety thresholds, and test responses in the simulator.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Let Mailora Handle Emails</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                When an email arrives, Mailora understands the inquiry, retrieves relevant facts, and replies instantly or queues for approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase: AI Agent, Knowledge RAG, and Human Approval */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <span>Built for Modern Businesses</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Your inbox, on autopilot.
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            A complete email management platform engineered to save business owners 15+ hours every week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Teach AI Your Business */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition-all shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Teach AI your business</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Upload PDFs, spreadsheets, word docs, or text snippets. Our smart chunking and retrieval architecture ensures only verified company facts are used in replies.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Supports PDF, DOCX, CSV, TXT & spreadsheets</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero hallucination guarantee via grounding</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real-time keyword & semantic chunk search</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Reply in Seconds */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/30 transition-all shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Reply in seconds</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Customers buy from whoever responds first. Mailora automatically classifies intent, pulls exact answers, and sends personalized responses around the clock.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sub-minute automated response times</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>13+ automatic intent classification models</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Custom brand voice & dynamic email signatures</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Keep Humans in Control */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/30 transition-all shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Keep humans in control</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Never send risky emails automatically. Configure rules where complaints, refund requests, or low-confidence emails stop in a clean human approval queue.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1-click "Approve & Send" or inline edits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automatic escalation for dissatisfied clients</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Detailed AI reasoning & knowledge citation</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Business Use Cases Section */}
      <section id="use-cases" className="py-20 bg-slate-900/40 border-t border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
              <span>Versatile Across All Sectors</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Tailored for Your Business
            </h2>
            <p className="text-slate-300 text-base max-w-2xl mx-auto">
              Select your industry to see how Mailora automates your specific repetitive conversations.
            </p>
          </div>

          {/* Industry pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {useCases.map(uc => (
              <button
                key={uc.id}
                onClick={() => setActiveUseCase(uc.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeUseCase === uc.id
                    ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {uc.icon}
                <span>{uc.title}</span>
              </button>
            ))}
          </div>

          {/* Selected Use Case Card */}
          {(() => {
            const current = useCases.find(u => u.id === activeUseCase) || useCases[0];
            return (
              <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    {current.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{current.title}</h3>
                    <p className="text-xs text-indigo-300 font-medium">Automatic Email Coverage</p>
                  </div>
                </div>

                <p className="text-slate-300 text-sm mb-6 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {current.example}
                </p>

                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                    Top Questions Mailora Handles Instantly:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {current.answers.map((ans, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200"
                      >
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{ans}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Security & Privacy Commitment */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Enterprise-Grade Security & Privacy
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              We treat your business and customer data with the highest integrity. Mailora is built with strict multi-tenant isolation, official Google OAuth tokens, and server-side encryption.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <Lock className="w-5 h-5 text-indigo-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">No Passwords Stored</h4>
                <p className="text-xs text-slate-400">
                  Authentication is handled directly through Google. We never store or see your inbox password.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <Database className="w-5 h-5 text-sky-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Isolated Knowledge</h4>
                <p className="text-xs text-slate-400">
                  Your business policies and uploaded documents are encrypted and never shared with other tenants.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Instant Revocation</h4>
                <p className="text-xs text-slate-400">
                  Disconnect your Gmail account at any time with a single click in your workspace or Google settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900/30 border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Invest in your 24/7 AI employee
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto mb-8">
            Start free, scale as your customer volume grows. Switch plans or cancel anytime.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 mb-16">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                billingCycle === 'annual'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual billing</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Free */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Free</h3>
                <p className="text-xs text-slate-400 mb-4">For solo founders testing the waters</p>
                <div className="text-3xl font-extrabold text-white mb-6">
                  $0 <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>50 AI emails / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1 Connected Gmail account</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>5 Knowledge documents (10 MB)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Standard Human Approval queue</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Starter */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Starter</h3>
                <p className="text-xs text-slate-400 mb-4">For freelancers & growing shops</p>
                <div className="text-3xl font-extrabold text-white mb-6">
                  {billingCycle === 'annual' ? '$29' : '$39'}{' '}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>500 AI emails / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2 Connected Gmail accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Knowledge uploads (1 GB)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom brand tone & signatures</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Multi-language (Bangla & English)</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Start 14-Day Trial
              </button>
            </div>

            {/* Business (Popular) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500 relative flex flex-col justify-between shadow-xl shadow-indigo-950/60">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-[10px] font-bold text-white uppercase tracking-wider shadow">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Business</h3>
                <p className="text-xs text-slate-400 mb-4">For agencies, clinics & busy teams</p>
                <div className="text-3xl font-extrabold text-white mb-6">
                  {billingCycle === 'annual' ? '$69' : '$89'}{' '}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2,000 AI emails / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>5 Connected Gmail inboxes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>5 GB Knowledge storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Advanced Automation rules builder</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Team members & RBAC roles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Priority email support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-md shadow-indigo-600/30 transition-all"
              >
                Start 14-Day Trial
              </button>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Pro / Scale</h3>
                <p className="text-xs text-slate-400 mb-4">High volume support operations</p>
                <div className="text-3xl font-extrabold text-white mb-6">
                  {billingCycle === 'annual' ? '$149' : '$189'}{' '}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>10,000 AI emails / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Gmail connections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>25 GB Knowledge storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom vector search integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated account engineer & SLA</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
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
              className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-base font-semibold text-white hover:text-indigo-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    activeFaq === idx ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-r from-indigo-900/60 via-slate-900 to-sky-950/60 border border-indigo-500/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Ready to give your email inbox <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-200">
                its very own AI employee?
              </span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-10">
              Join thousands of founders and business owners who never stress about customer email response times again.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Start Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => loginAsDemoUser()}
                className="px-8 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all hover:text-white"
              >
                Open Demo Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size="sm" />
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Mailora AI Inc. All rights reserved. Your AI Employee for Email.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setCurrentView('settings')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
