import { X, Calendar, Tag, TrendingUp, TrendingDown, Repeat } from 'lucide-react';
import { format } from 'date-fns';

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

interface DayModalProps {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

const getEventIcon = (event: CalendarEvent) => {
  if (event.type === 'subscription') {
    return <Repeat className="h-5 w-5 text-purple-400" />;
  }
  
  const isIncome = event.eventType === 'income' || event.amount >= 0;
  return isIncome ? (
    <TrendingUp className="h-5 w-5 text-[var(--accent-from)]" />
  ) : (
    <TrendingDown className="h-5 w-5 text-rose-400" />
  );
};

const getEventTypeLabel = (event: CalendarEvent) => {
  switch (event.type) {
    case 'subscription':
      return 'Subscription';
    case 'scheduled':
      return `Scheduled ${event.eventType === 'income' ? 'Income' : 'Expense'}`;
    case 'transaction':
      return 'Transaction';
    default:
      return 'Event';
  }
};

const getAmountColor = (event: CalendarEvent) => {
  if (event.type === 'subscription') return 'text-purple-400';
  const isIncome = event.eventType === 'income' || event.amount >= 0;
  return isIncome ? 'text-[var(--accent-from)]' : 'text-rose-400';
};

export default function DayModal({ date, events, onClose }: DayModalProps) {
  const totalAmount = events.reduce((sum, event) => {
    if (event.type === 'subscription') return sum - event.amount;
    if (event.eventType === 'expense') return sum - event.amount;
    return sum + event.amount;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-2xl rounded-2xl p-6 shadow-glass max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-muted mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{format(date, 'EEEE')}</span>
            </div>
            <h2 className="text-2xl font-semibold">
              {format(date, 'MMMM d, yyyy')}
            </h2>
            {events.length > 0 && (
              <p className="mt-2 text-sm text-muted">
                {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-white/5 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        {events.length > 0 && (
          <div className="glass-card rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Net Total</span>
              <span className={`text-xl font-semibold ${totalAmount >= 0 ? 'text-[var(--accent-from)]' : 'text-rose-400'}`}>
                {totalAmount >= 0 ? '+' : ''}{formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center">
            <Calendar className="h-12 w-12 text-muted mx-auto mb-3 opacity-50" />
            <p className="text-muted">No events scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="glass-card rounded-xl p-4 hover-glow transition-all duration-300"
                style={{ borderLeft: `3px solid ${event.color || 'var(--accent-from)'}` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary truncate">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted">
                            {getEventTypeLabel(event)}
                          </span>
                          {event.category && (
                            <div className="flex items-center gap-1 text-xs text-muted">
                              <Tag className="h-3 w-3" />
                              <span>{event.category}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <p className={`text-lg font-semibold ${getAmountColor(event)}`}>
                          {event.type === 'subscription' || event.eventType === 'expense' ? '-' : '+'}
                          {formatCurrency(event.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="glass-input rounded-xl px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
