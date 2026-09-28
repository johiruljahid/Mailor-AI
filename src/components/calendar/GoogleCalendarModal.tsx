import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  Mail,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Plus,
  RefreshCw,
  Settings2,
  CalendarCheck,
  CalendarX,
  Link as LinkIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleCalendarService, AvailableSlot, CalendarEvent } from '../../services/googleCalendarService';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({ isOpen, onClose }) => {
  const {
    calendarBookings,
    calendarConfig,
    setCalendarConfig,
    bookCalendarMeeting,
    getAvailableMeetingSlots,
    isGoogleAuthenticated,
    connectGoogleAccount,
    addToast,
    user,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'availability' | 'quick-book' | 'settings'>('bookings');
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Quick manual test book form
  const [testClientName, setTestClientName] = useState('Rahim Ahmed');
  const [testClientEmail, setTestClientEmail] = useState('rahim.client@gmail.com');
  const [testTopic, setTestTopic] = useState('Discovery Call • Web App Project');
  const [selectedSlotIso, setSelectedSlotIso] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCalendarData();
    }
  }, [isOpen]);

  const loadCalendarData = async () => {
    setIsLoadingSlots(true);
    setIsLoadingEvents(true);
    try {
      const [events, slots] = await Promise.all([
        GoogleCalendarService.listUpcomingEvents(10),
        getAvailableMeetingSlots(4),
      ]);
      setUpcomingEvents(events);
      setAvailableSlots(slots);
      if (slots.length > 0 && !selectedSlotIso) {
        setSelectedSlotIso(slots[0].startIso);
      }
    } catch (err) {
      console.warn('Load calendar data notice:', err);
    } finally {
      setIsLoadingSlots(false);
      setIsLoadingEvents(false);
    }
  };

  if (!isOpen) return null;

  const handleQuickBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotIso) {
      addToast({
        type: 'error',
        title: 'Select a Slot',
        message: 'Please select an available calendar slot first.',
      });
      return;
    }

    const startObj = new Date(selectedSlotIso);
    const endObj = new Date(startObj.getTime() + (calendarConfig.defaultMeetingDurationMinutes || 30) * 60 * 1000);

    setIsBooking(true);
    try {
      const res = await bookCalendarMeeting({
        summary: testTopic,
        description: `Automated test consultation booked via Mailora AI.\nClient: ${testClientName} (${testClientEmail})`,
        startIso: startObj.toISOString(),
        endIso: endObj.toISOString(),
        clientEmail: testClientEmail,
        clientName: testClientName,
      });

      if (res.success) {
        setActiveTab('bookings');
        loadCalendarData();
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Google Calendar Autonomous Hub</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI automatically detects meeting requests, checks your real Google Calendar, books appointments, and creates Google Meet links.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Open Google Calendar"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>AI Booked Meetings ({calendarBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'availability'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Check Calendar Availability</span>
          </button>

          <button
            onClick={() => setActiveTab('quick-book')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'quick-book'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Book Test Appointment</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Calendar Settings</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI Booked Meetings */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Confirmed Client Appointments</h3>
                  <p className="text-xs text-slate-400">
                    Appointments automatically created by Mailora AI via Google Calendar API with Google Meet video links.
                  </p>
                </div>
                <button
                  onClick={loadCalendarData}
                  disabled={isLoadingEvents}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {calendarBookings.length === 0 && upcomingEvents.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">No AI Bookings Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    When a client emails asking for a meeting, Mailora AI checks your calendar availability, automatically locks in the date/time, and replies with Google Meet!
                  </p>
                  <button
                    onClick={() => setActiveTab('quick-book')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                  >
                    Test Auto-Booking Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* AI Bookings */}
                  {calendarBookings.map(b => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/20 via-slate-950 to-slate-900 border border-indigo-500/30 space-y-3 shadow-lg hover:border-indigo-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            CONFIRMED ✓
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5">{b.subject}</h4>
                        </div>
                        <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                          {b.startFormatted}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-slate-300">{b.clientEmail}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        {b.meetUrl ? (
                          <a
                            href={b.meetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Google Meet ↗</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Google Meet included</span>
                        )}

                        <a
                          href="https://calendar.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                        >
                          <span>Calendar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* Calendar Events from API */}
                  {upcomingEvents.map(evt => (
                    <div
                      key={evt.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            CALENDAR EVENT
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1">{evt.summary}</h4>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All day'}
                        </span>
                      </div>

                      {evt.hangoutLink && (
                        <a
                          href={evt.hangoutLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Google Meet link ↗</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Check Availability */}
          {activeTab === 'availability' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Google Calendar Availability Slots</h3>
                  <p className="text-xs text-slate-400">
                    Calculated in real time via Google Calendar Free/Busy API during your standard business hours.
                  </p>
                </div>
                <button
                  onClick={loadCalendarData}
                  disabled={isLoadingSlots}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSlots ? 'animate-spin' : ''}`} />
                  <span>Check Open Slots</span>
                </button>
              </div>

              {isLoadingSlots ? (
                <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Querying Google Calendar free/busy availability...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-xs">
                  No free business slots found in the next 3 days. Adjust your working hours or clear busy calendar blocks.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSlots.map(slot => (
                    <div
                      key={slot.startIso}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          AVAILABLE
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {slot.formattedTime}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-300">{slot.formattedDate}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">30-min consultation window</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedSlotIso(slot.startIso);
                          setActiveTab('quick-book');
                        }}
                        className="w-full py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-bold transition-all border border-indigo-500/30"
                      >
                        Book This Slot →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Book Test Appointment */}
          {activeTab === 'quick-book' && (
            <div className="max-w-xl mx-auto space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Simulate Client Meeting Booking</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test the exact flow: Mailora AI will create an appointment in Google Calendar with a real Google Meet video conference.
                </p>
              </div>

              <form onSubmit={handleQuickBook} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Client Full Name</label>
                    <input
                      type="text"
                      value={testClientName}
                      onChange={e => setTestClientName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="e.g. Sarah Connor"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Client Email (Google Meet Invite)</label>
                    <input
                      type="email"
                      value={testClientEmail}
                      onChange={e => setTestClientEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="client@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Meeting Topic / Subject</label>
                  <input
                    type="text"
                    value={testTopic}
                    onChange={e => setTestTopic(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Discovery Call • Web Development"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Available Date & Time Slot</label>
                  {availableSlots.length > 0 ? (
                    <select
                      value={selectedSlotIso}
                      onChange={e => setSelectedSlotIso(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {availableSlots.map(s => (
                        <option key={s.startIso} value={s.startIso}>
                          {s.displayLabel} (Open Slot)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400">
                      Loading available slots or no slots found...
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isBooking || !selectedSlotIso}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBooking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Google Calendar Event & Meet Link...</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4" />
                      <span>Confirm & Book Appointment on Google Calendar</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Autonomous Meeting Booking</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    When active, client emails asking for calls/demos are automatically booked directly into your Google Calendar.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calendarConfig.autoBookMeetings}
                    onChange={e =>
                      setCalendarConfig(prev => ({
                        ...prev,
                        autoBookMeetings: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Default Consultation Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() =>
                        setCalendarConfig(prev => ({
                          ...prev,
                          defaultMeetingDurationMinutes: mins,
                        }))
                      }
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        calendarConfig.defaultMeetingDurationMinutes === mins
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Google Meet Video Conferences</span>
                </div>
                <p>
                  Every booked meeting automatically generates an official Google Meet room link and notifies attendees with email reminders 24 hours and 15 minutes before the event.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isGoogleAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs text-slate-400 font-mono">
              {isGoogleAuthenticated
                ? `Connected to Google Calendar (${user?.email || 'johirul4856@gmail.com'})`
                : 'Google Calendar API Access Granted'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
