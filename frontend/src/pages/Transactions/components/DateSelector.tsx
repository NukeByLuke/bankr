import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

interface DateSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function DateSelector({ value, onChange }: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentMonth(value);
  }, [value]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get starting day of week (0 = Sunday)
  const startingDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startingDayOfWeek).fill(null);

  const displayText = isToday(value) ? 'Today' : format(value, 'EEE, MMM dd, yyyy');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
  className="glass-input flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 hover:shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.18)]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-black" />
          </div>
          <div className="text-left">
            <p className="text-xs text-muted">Transaction Date</p>
            <p className="text-sm font-medium text-primary">{displayText}</p>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="glass-popover absolute z-50 mt-2 w-full rounded-2xl p-4 animate-[fadeInUp_0.3s_ease-out]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-semibold text-primary">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="py-1 text-center text-xs font-medium text-muted">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="aspect-square" />
            ))}
            {daysInMonth.map((day) => {
              const isSelected = isSameDay(day, value);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day.toString()}
                  type="button"
                  onClick={() => {
                    onChange(day);
                    setIsOpen(false);
                  }}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all duration-200
                    ${isSelected
                      ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_15px_rgba(var(--accent-to-rgb),0.3)]'
                      : isTodayDate
                      ? 'border border-[rgba(var(--accent-from-rgb),0.5)] text-primary hover:bg-black/5 dark:hover:bg-white/10'
                      : 'text-muted hover:bg-black/5 dark:hover:bg-white/10'
                    }
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-2 border-t border-subtle pt-4">
            <button
              type="button"
              onClick={() => {
                onChange(new Date());
                setIsOpen(false);
              }}
              className="glass-input flex-1 rounded-lg px-3 py-2 text-xs font-medium text-primary transition-colors hover:shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.18)]"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
