import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { apiClient } from '@/utils/api';
import DayModal from './DayModal';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'transaction' | 'subscription' | 'scheduled';
  category?: string;
  color?: string;
  eventType?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ['calendar', format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const response = await apiClient.get('/calendar', {
        params: {
          startDate: calendarStart.toISOString(),
          endDate: calendarEnd.toISOString(),
        },
      });
      // Backend returns array directly or wrapped in data property
      return (response.data?.data || response.data || []) as CalendarEvent[];
    },
  });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  const getEventDots = (dayEvents: CalendarEvent[]) => {
    const types = new Set<string>();
    dayEvents.forEach((event) => {
      if (event.type === 'subscription') {
        types.add('subscription');
      } else if (event.type === 'scheduled') {
        types.add(event.eventType === 'income' ? 'income' : 'expense');
      } else {
        // For now, we don't have transaction type, so we'll use amount sign
        types.add(event.amount >= 0 ? 'income' : 'expense');
      }
    });
    return Array.from(types);
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-[var(--accent-from)]';
      case 'expense':
        return 'bg-rose-400';
      case 'subscription':
        return 'bg-purple-400';
      default:
        return 'bg-yellow-400';
    }
  };

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <header className="glass-card rounded-2xl p-6 shadow-glass">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Calendar</h1>
              <p className="mt-2 text-sm text-muted">
                Track all your financial events in one view
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousMonth}
                className="glass-input rounded-full p-2 hover:bg-white/10 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="min-w-[180px] text-center">
                <h2 className="text-xl font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
              </div>

              <button
                onClick={handleNextMonth}
                className="glass-input rounded-full p-2 hover:bg-white/10 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Legend */}
        <div className="glass-card rounded-2xl p-4 shadow-glass">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[var(--accent-from)]" />
              <span className="text-muted">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="text-muted">Expense</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-400" />
              <span className="text-muted">Subscription</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 shadow-glass overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const hasEvents = dayEvents.length > 0;
                const eventDots = getEventDots(dayEvents);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`
                      relative min-h-[100px] rounded-xl p-3 transition-all duration-300
                      hover:scale-[1.03] hover-glow
                      ${isCurrentMonth ? 'glass-input' : 'opacity-40'}
                      ${isCurrentDay ? 'ring-2 ring-[var(--accent-from)] ring-offset-2 ring-offset-[#0a0a0a]' : ''}
                      ${hasEvents ? 'cursor-pointer' : ''}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`
                        text-sm font-medium mb-2
                        ${isCurrentDay ? 'text-[var(--accent-from)]' : 'text-primary'}
                      `}>
                        {format(day, 'd')}
                      </div>

                      {hasEvents && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-1">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {eventDots.slice(0, 3).map((type, idx) => (
                              <div
                                key={`${type}-${idx}`}
                                className={`h-2 w-2 rounded-full ${getDotColor(type)}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted">
                            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Day Modal */}
      {selectedDate && (
        <DayModal
          date={selectedDate}
          events={getEventsForDay(selectedDate)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
