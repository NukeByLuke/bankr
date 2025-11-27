import { useState } from 'react';
import { Repeat, ChevronDown, Infinity, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface RepeatSelectorProps {
  enabled: boolean;
  interval: number;
  period: 'day' | 'week' | 'month' | 'year';
  endDate: Date | null;
  onChange: (data: {
    enabled: boolean;
    interval: number;
    period: 'day' | 'week' | 'month' | 'year';
    endDate: Date | null;
  }) => void;
}

export default function RepeatSelector({ enabled, interval, period, endDate, onChange }: RepeatSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(enabled);
  const [hasEndDate, setHasEndDate] = useState(endDate !== null);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setIsExpanded(newEnabled);
    onChange({ enabled: newEnabled, interval, period, endDate });
  };

  const handleIntervalChange = (newInterval: number) => {
    onChange({ enabled, interval: newInterval, period, endDate });
  };

  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month' | 'year') => {
    onChange({ enabled, interval, period: newPeriod, endDate });
  };

  const handleEndDateToggle = () => {
    const newHasEndDate = !hasEndDate;
    setHasEndDate(newHasEndDate);
    onChange({ enabled, interval, period, endDate: newHasEndDate ? new Date() : null });
  };

  const handleEndDateChange = (date: string) => {
    onChange({ enabled, interval, period, endDate: new Date(date) });
  };

  return (
    <div className="space-y-3">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={handleToggle}
        className={`
          w-full flex items-center justify-between rounded-xl border transition-all duration-300 px-4 py-3
          ${enabled
            ? 'bg-gradient-to-r from-[rgba(var(--accent-from-rgb),0.1)] to-[rgba(var(--accent-to-rgb),0.1)] border-[rgba(var(--accent-from-rgb),0.3)]'
            : 'glass-input hover:shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.18)]'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
            ${enabled ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)]' : 'bg-white/5'}
          `}>
            <Repeat className={`h-5 w-5 ${enabled ? 'text-black' : 'text-muted'}`} />
          </div>
          <div className="text-left">
            <p className="text-xs text-muted">Recurring Transaction</p>
            <p className="text-sm font-medium text-primary">
              {enabled ? `Every ${interval} ${period}${interval > 1 ? 's' : ''}` : 'One-time transaction'}
            </p>
          </div>
        </div>
  <ChevronDown className={`h-5 w-5 text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Options */}
      {isExpanded && enabled && (
        <div className="space-y-3 animate-[fadeInUp_0.3s_ease-out]">
          {/* Interval Input */}
          <div className="flex items-center gap-3 px-4">
            <label className="flex-shrink-0 text-sm text-muted">Repeat every</label>
            <input
              type="number"
              min="1"
              value={interval}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
              className="glass-input w-20 rounded-lg px-3 py-2 text-center focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)]"
            />
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value as 'day' | 'week' | 'month' | 'year')}
              className="glass-input flex-1 cursor-pointer appearance-none rounded-lg px-3 py-2 focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)]"
            >
              <option value="day">Day{interval > 1 ? 's' : ''}</option>
              <option value="week">Week{interval > 1 ? 's' : ''}</option>
              <option value="month">Month{interval > 1 ? 's' : ''}</option>
              <option value="year">Year{interval > 1 ? 's' : ''}</option>
            </select>
          </div>

          {/* End Date Toggle */}
          <div className="px-4 space-y-3">
            <button
              type="button"
              onClick={handleEndDateToggle}
              className="glass-input flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors hover:shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.18)]"
            >
              <div className="flex items-center gap-3">
                {hasEndDate ? (
                  <Calendar className="h-5 w-5 text-[var(--accent-from)]" />
                ) : (
                  <Infinity className="h-5 w-5 text-muted" />
                )}
                <span className="text-sm text-primary">
                  {hasEndDate ? 'Until specific date' : 'Repeat forever'}
                </span>
              </div>
            </button>

            {hasEndDate && endDate && (
              <input
                type="date"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="glass-input w-full rounded-lg px-4 py-3 focus:outline-none focus:border-[rgba(var(--accent-from-rgb),0.5)]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
