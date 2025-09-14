import * as React from 'react';
import { cn } from '@/components/ui/primitive';
import {
  EditIcon,
  UserPlusIcon,
  CheckIcon,
  CurrencyIcon,
  CalendarIcon
} from '@/components/icons';

interface ActivityItem {
  id: string;
  type: 'emission_created' | 'shareholder_added' | 'subscription_approved' | 'trading_completed' | 'report_generated';
  title: string;
  description: string;
  timestamp: string; // ISO date string
  metadata?: {
    amount?: number;
    user?: string;
    emission?: string;
  };
}

interface ActivityRowProps {
  activity: ActivityItem;
  className?: string;
}

function ActivityRow({ activity, className }: ActivityRowProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'emission_created':
        return <EditIcon size={16} className="text-blue-600 dark:text-blue-400" />;
      case 'shareholder_added':
        return <UserPlusIcon size={16} className="text-green-600 dark:text-green-400" />;
      case 'subscription_approved':
        return <CheckIcon size={16} className="text-green-600 dark:text-green-400" />;
      case 'trading_completed':
        return <CurrencyIcon size={16} className="text-purple-600 dark:text-purple-400" />;
      case 'report_generated':
        return <CalendarIcon size={16} className="text-gray-600 dark:text-gray-400" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-muted" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} min siden`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} timer siden`;
    } else if (diffInHours < 48) {
      return 'I går';
    } else {
      return date.toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString('nb-NO');
  };

  return (
    <div className={cn(
      "flex items-start space-x-4 p-4 hover:bg-accent/50 rounded-lg transition-colors",
      className
    )}>
      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-light text-foreground leading-relaxed">
          {activity.title}
        </h4>
        <p className="text-sm font-light text-muted-foreground leading-relaxed">
          {activity.description}
          {activity.metadata?.amount && (
            <span className="ml-1 font-medium text-foreground">
              ({formatAmount(activity.metadata.amount)} NOK)
            </span>
          )}
        </p>
        <div className="text-xs font-light text-muted-foreground">
          {formatTimestamp(activity.timestamp)}
        </div>
      </div>
    </div>
  );
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  maxItems?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function RecentActivity({
  activities = [],
  maxItems = 10,
  loading = false,
  error,
  className
}: RecentActivityProps) {
  // Default/demo activities if none provided
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'emission_created',
      title: 'Ny emisjon opprettet',
      description: 'Oslo Sentrum Kontorbygg emisjon er klar for investorer',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      metadata: { amount: 15000000, emission: 'Oslo Sentrum Kontorbygg' }
    },
    {
      id: '2',
      type: 'shareholder_added',
      title: 'Ny aksjonær registrert',
      description: 'Maria Jensen har blitt lagt til som aksjonær',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      metadata: { user: 'Maria Jensen' }
    },
    {
      id: '3',
      type: 'subscription_approved',
      title: 'Investering godkjent',
      description: 'Investering i Trondheim Boligprosjekt har blitt godkjent',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      metadata: { amount: 500000, emission: 'Trondheim Boligprosjekt' }
    },
    {
      id: '4',
      type: 'trading_completed',
      title: 'Handel gjennomført',
      description: 'Sekundærmarked-transaksjon er fullført',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      metadata: { amount: 250000 }
    },
    {
      id: '5',
      type: 'report_generated',
      title: 'Rapport generert',
      description: 'Q3 2024 aksjonærrapport er klar for nedlasting',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;
  const limitedActivities = displayActivities.slice(0, maxItems);

  // Loading skeleton
  if (loading) {
    return (
      <section className={cn("space-y-8", className)}>
        <div className="space-y-2">
          <h2 className="heading-professional text-title-large font-light">
            Siste aktivitet
          </h2>
          <p className="text-sm font-light text-muted-foreground">
            Nylige hendelser i systemet
          </p>
        </div>

        <div className="card-professional">
          <div className="divide-y divide-border/50">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 animate-pulse">
                <div className="w-8 h-8 bg-muted/30 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/30 rounded w-3/4"></div>
                  <div className="h-3 bg-muted/30 rounded w-full"></div>
                  <div className="h-3 bg-muted/30 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={cn("space-y-8", className)}>
        <div className="space-y-2">
          <h2 className="heading-professional text-title-large font-light">
            Siste aktivitet
          </h2>
        </div>

        <div className="card-professional p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <CalendarIcon size={24} className="text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-light text-foreground">
                Kunne ikke laste aktivitet
              </h3>
              <p className="text-sm font-light text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("space-y-8", className)}>
      <div className="space-y-2">
        <h2 className="heading-professional text-title-large font-light">
          Siste aktivitet
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Nylige hendelser i systemet
        </p>
      </div>

      {limitedActivities.length === 0 ? (
        <div className="card-professional p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <CalendarIcon size={24} className="text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-light text-foreground">
                Ingen aktivitet enda
              </h3>
              <p className="text-sm font-light text-muted-foreground">
                Aktivitet vil vises her når handlinger utføres i systemet
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-professional">
          <div className="divide-y divide-border/50">
            {limitedActivities.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
              />
            ))}
          </div>

          {displayActivities.length > maxItems && (
            <div className="p-4 border-t border-border/50 text-center">
              <button className="btn-professional-ghost">
                <span>Se all aktivitet</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default RecentActivity;