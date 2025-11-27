import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, CalendarDays, Palette, Loader2 } from 'lucide-react';
import { apiClient } from '@/utils/api';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoanVariant = 'one-time' | 'long-term';

type LoanType = 'lent' | 'borrowed';

const COLOR_SWATCHES = ['#5af0c8', '#3be8a0', '#38bdf8', '#f97316', '#f472b6', '#a855f7', '#facc15'];

const normalizeToMidday = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(12, 0, 0, 0);
  return normalized;
};

const toInputDate = (date: Date) => format(normalizeToMidday(date), 'yyyy-MM-dd');

const createDefaultValues = () => ({
  name: '',
  amount: '',
  type: 'lent' as LoanType,
  variant: 'one-time' as LoanVariant,
  color: COLOR_SWATCHES[0],
  notes: '',
  startDate: toInputDate(new Date()),
  endDate: '',
});

const loanFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    amount: z.string().min(1, 'Amount is required'),
    type: z.enum(['lent', 'borrowed']),
    variant: z.enum(['one-time', 'long-term']),
    color: z.string().optional(),
    notes: z.string().max(500, 'Notes should be concise').optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const amount = Number.parseFloat(data.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid amount greater than zero',
        path: ['amount'],
      });
    }

    if (data.variant === 'long-term') {
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date is required for long term loans',
          path: ['endDate'],
        });
      } else {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End date must be after the start date',
            path: ['endDate'],
          });
        }
      }
    }
  });

type LoanFormValues = z.infer<typeof loanFormSchema>;

export default function AddLoanModal({ isOpen, onClose }: AddLoanModalProps) {
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: createDefaultValues(),
  });

  const variant = watch('variant');
  const selectedType = watch('type');
  const selectedColor = watch('color');

  useEffect(() => {
    if (isOpen) {
      reset(createDefaultValues());
      setIsClosing(false);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (variant === 'one-time') {
      setValue('endDate', '');
    }
  }, [variant, setValue]);

  const startClose = () => {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const createLoan = useMutation({
    mutationFn: async (values: LoanFormValues) => {
      const payload = {
        name: values.name.trim(),
        type: values.type,
        amount: Number.parseFloat(values.amount),
        color: values.color || undefined,
        notes: values.notes?.trim() ? values.notes.trim() : undefined,
        startDate: normalizeToMidday(new Date(values.startDate)).toISOString(),
        endDate:
          values.variant === 'long-term' && values.endDate
            ? normalizeToMidday(new Date(values.endDate)).toISOString()
            : undefined,
      };

      const response = await apiClient.post('/loans', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      reset(createDefaultValues());
      startClose();
    },
  });

  const onSubmit = (values: LoanFormValues) => {
    createLoan.mutate(values);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !createLoan.isPending) {
          startClose();
        }
      }}
    >
      <div
        className={`surface-overlay relative m-4 w-full max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl transition-all duration-300 ${
          isClosing ? 'translate-y-4 scale-95 opacity-0' : 'translate-y-0 scale-100 opacity-100'
        }`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="glass-header sticky top-0 z-10 flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Add Loan</h2>
            <p className="text-sm text-muted">Keep your lending and borrowing in sync.</p>
          </div>
          <button
            type="button"
            onClick={() => !createLoan.isPending && startClose()}
            disabled={createLoan.isPending}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10"
            aria-label="Close add loan modal"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setValue('type', 'lent')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                selectedType === 'lent'
                  ? 'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_18px_rgba(var(--accent-to-rgb),0.35)]'
                  : 'glass-input text-muted'
              }`}
            >
              Lent
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'borrowed')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                selectedType === 'borrowed'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  : 'glass-input text-muted'
              }`}
            >
              Borrowed
            </button>
          </div>

          <div>
            <label className="label" htmlFor="loan-name">
              Loan name
            </label>
            <input
              id="loan-name"
              type="text"
              {...register('name')}
              className="glass-input w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
              placeholder="e.g. Sarah's camera"
            />
            {errors.name && <p className="mt-2 text-sm text-rose-400">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="loan-amount">
              Amount
            </label>
            <input
              id="loan-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              {...register('amount')}
              className="glass-input w-full rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
              placeholder="0.00"
            />
            {errors.amount && <p className="mt-2 text-sm text-rose-400">{errors.amount.message}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setValue('variant', 'one-time')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                variant === 'one-time'
                  ? 'bg-black/5 text-primary shadow-[0_0_16px_rgba(0,0,0,0.12)] dark:bg-white/10'
                  : 'glass-input text-muted'
              }`}
            >
              One time loan
            </button>
            <button
              type="button"
              onClick={() => setValue('variant', 'long-term')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                variant === 'long-term'
                  ? 'bg-black/5 text-primary shadow-[0_0_16px_rgba(0,0,0,0.12)] dark:bg-white/10'
                  : 'glass-input text-muted'
              }`}
            >
              Long term
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="loan-start">
                Start date
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                <input
                  id="loan-start"
                  type="date"
                  {...register('startDate')}
                  className="glass-input w-full rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
                />
              </div>
              {errors.startDate && <p className="mt-2 text-sm text-rose-400">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="loan-end">
                End date
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                <input
                  id="loan-end"
                  type="date"
                  {...register('endDate')}
                  disabled={variant === 'one-time'}
                  className="glass-input w-full rounded-xl px-10 py-3 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
                />
              </div>
              {errors.endDate && <p className="mt-2 text-sm text-rose-400">{errors.endDate.message}</p>}
            </div>
          </div>

          <div>
            <p className="label">Card color</p>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_SWATCHES.map((hex) => {
                const isActive = selectedColor === hex;
                return (
                  <button
                    type="button"
                    key={hex}
                    onClick={() => setValue('color', hex)}
                    className={`h-9 w-9 rounded-full border-2 transition-all ${
                      isActive
                        ? 'border-white shadow-[0_0_12px_rgba(var(--accent-to-rgb),0.45)]'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ background: hex }}
                    aria-label={`Select ${hex} color`}
                  />
                );
              })}
              <button
                type="button"
                onClick={() => setValue('color', '')}
                className="flex items-center gap-2 rounded-xl border border-dashed border-subtle px-3 py-2 text-xs text-muted transition-colors hover:border-[rgba(var(--accent-from-rgb),0.4)] hover:text-primary"
              >
                <Palette className="h-4 w-4" /> Clear
              </button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="loan-notes">
              Notes
            </label>
            <textarea
              id="loan-notes"
              rows={4}
              {...register('notes')}
              className="glass-input w-full resize-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-from-rgb),0.4)]"
              placeholder="Add details, repayment expectations, or reminders."
            />
            {errors.notes && <p className="mt-2 text-sm text-rose-400">{errors.notes.message}</p>}
          </div>

          {createLoan.isError && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              Failed to save loan. Please try again.
            </div>
          )}

          <button
            type="submit"
            disabled={createLoan.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] px-6 py-4 text-base font-semibold text-[color-mix(in_srgb,var(--accent-to)_15%,black)] shadow-[0_0_24px_rgba(var(--accent-to-rgb),0.35)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--accent-to-rgb),0.45)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createLoan.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> Save loan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
