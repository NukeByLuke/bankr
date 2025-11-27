import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { Loader2, Activity, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { apiClient } from '@/utils/api';

interface ActivityLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('create') || actionLower.includes('add')) {
    return <Plus className="h-5 w-5 text-[var(--accent-from)]" />;
  }
  if (actionLower.includes('update') || actionLower.includes('edit')) {
    return <Edit className="h-5 w-5 text-yellow-400" />;
  }
  if (actionLower.includes('delete') || actionLower.includes('remove')) {
    return <Trash2 className="h-5 w-5 text-rose-400" />;
  }
  return <TrendingUp className="h-5 w-5 text-blue-400" />;
};

const getActionColor = (action: string) => {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('create') || actionLower.includes('add')) {
  return 'text-[var(--accent-from)]';
  }
  if (actionLower.includes('update') || actionLower.includes('edit')) {
    return 'text-yellow-400';
  }
  if (actionLower.includes('delete') || actionLower.includes('remove')) {
    return 'text-rose-400';
  }
  return 'text-blue-400';
};

const getActionSymbol = (action: string) => {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('create') || actionLower.includes('add')) {
  return <span className="text-[var(--accent-from)] font-bold text-xl">+</span>;
  }
  if (actionLower.includes('update') || actionLower.includes('edit')) {
    return <span className="text-yellow-400 font-bold text-xl">~</span>;
  }
  if (actionLower.includes('delete') || actionLower.includes('remove')) {
    return <span className="text-rose-400 font-bold text-xl">−</span>;
  }
  return <span className="text-blue-400 font-bold text-xl">•</span>;
};

const formatAction = (action: string, entity: string) => {
  // Convert CREATED_TRANSACTION to "Created Transaction"
  const actionParts = action.split('_');
  const actionWord = actionParts[0].charAt(0) + actionParts[0].slice(1).toLowerCase();
  const entityWord = entity.toLowerCase();
  
  return `${actionWord} ${entityWord}`;
};

export default function ActivityLog() {
  const { data: logs = [], isLoading, isError, error } = useQuery<ActivityLogEntry[]>({
    queryKey: ['activity'],
    queryFn: async () => {
      const response = await apiClient.get('/activity', {
        params: { limit: 100 },
      });
      return response.data as ActivityLogEntry[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <header className="glass-card rounded-2xl p-6 shadow-glass">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-[rgba(var(--accent-from-rgb),0.12)]">
              <Activity className="h-8 w-8 text-[var(--accent-from)]" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold">Activity Log</h1>
              <p className="mt-2 text-sm text-muted">
                Recent changes and updates across your account
              </p>
            </div>
          </div>
        </header>

        {/* Error State */}
        {isError && (
          <div className="glass-card rounded-2xl p-6 border border-rose-500/30 bg-rose-500/10">
            <p className="text-rose-300">
              Failed to load activity logs.{' '}
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </div>
        )}

        {/* Activity Feed */}
        {!isLoading && !isError && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <Activity className="h-16 w-16 text-muted mx-auto mb-4 opacity-30" />
                <p className="text-muted text-sm">No activity yet</p>
                <p className="text-muted text-xs mt-1 opacity-70">
                  Your recent actions will appear here
                </p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={log.id}
                  className="glass-card rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] hover-glow animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(log.action)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary">
                          <span className={getActionColor(log.action)}>
                            {formatAction(log.action, log.entity)}
                          </span>
                          {log.details && (
                            <>
                              <span className="text-muted mx-2">•</span>
                              <span className="font-medium text-primary opacity-90">
                                {log.details}
                              </span>
                            </>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </p>
                          <span className="text-muted opacity-40">•</span>
                          <p className="text-xs text-muted opacity-70">
                            {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Symbol */}
                    <div className="flex-shrink-0 mt-1">
                      {getActionSymbol(log.action)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Footer */}
        {!isLoading && !isError && logs.length > 0 && (
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="text-sm text-muted">
              Showing {logs.length} most recent {logs.length === 1 ? 'activity' : 'activities'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
