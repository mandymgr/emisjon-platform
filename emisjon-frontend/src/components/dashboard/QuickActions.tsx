import * as React from 'react';
import { Link } from 'react-router';
import { cn } from '@/components/ui/primitive';
import {
  UserPlusIcon,
  EditIcon,
  FileIcon,
  InfoIcon
} from '@/components/icons';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  requiredLevel?: number;
}

interface QuickActionCardProps {
  action: QuickAction;
  className?: string;
}

function QuickActionCard({ action, className }: QuickActionCardProps) {
  return (
    <Link
      to={action.href}
      className={cn(
        "card-professional p-6 group hover:scale-[1.02] transition-all duration-300 block",
        className
      )}
    >
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
          {action.icon}
        </div>

        <div className="space-y-2">
          <h3 className="font-light text-lg text-foreground group-hover:text-foreground transition-colors">
            {action.title}
          </h3>
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            {action.description}
          </p>
        </div>

        <div className="pt-2">
          <div className="text-xs font-light text-primary group-hover:text-primary/80 flex items-center space-x-1">
            <span>Gå til</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface RestrictedActionProps {
  action: QuickAction;
  className?: string;
}

function RestrictedAction({ action, className }: RestrictedActionProps) {
  return (
    <div className={cn(
      "card-professional p-6 opacity-60",
      className
    )}>
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          {action.icon}
        </div>

        <div className="space-y-2">
          <h3 className="font-light text-lg text-foreground">
            {action.title}
          </h3>
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            {action.description}
          </p>
        </div>

        <div className="pt-2 flex items-center space-x-2">
          <InfoIcon size={14} className="text-muted-foreground" />
          <span className="text-xs font-light text-muted-foreground">
            Nivå {action.requiredLevel}+ tilgang kreves
          </span>
        </div>
      </div>
    </div>
  );
}

interface QuickActionsProps {
  userLevel?: number;
  className?: string;
}

export function QuickActions({
  userLevel = 1,
  className
}: QuickActionsProps) {
  const allActions: QuickAction[] = [
    {
      id: 'add-shareholder',
      title: 'Legg til aksjonær',
      description: 'Registrer nye investorer og administrer aksjonærinformasjon',
      icon: <UserPlusIcon size={20} />,
      href: '/shareholders/add',
      requiredLevel: 2,
    },
    {
      id: 'create-emission',
      title: 'Opprett emisjon',
      description: 'Start en ny investeringsrunde for dine prosjekter',
      icon: <EditIcon size={20} />,
      href: '/emissions/create',
      requiredLevel: 3,
    },
    {
      id: 'generate-report',
      title: 'Generer rapport',
      description: 'Lag detaljerte rapporter for investorer og myndigheter',
      icon: <FileIcon size={20} />,
      href: '/reports/generate',
      requiredLevel: 2,
    },
    {
      id: 'notifications',
      title: 'Varsler',
      description: 'Se viktige meldinger og oppdateringer',
      icon: <InfoIcon size={20} />,
      href: '/notifications',
      requiredLevel: 1,
    },
  ];

  // Filter actions based on user level and separate into accessible/restricted
  const { accessibleActions, restrictedActions } = React.useMemo(() => {
    const accessible: QuickAction[] = [];
    const restricted: QuickAction[] = [];

    allActions.forEach(action => {
      if (!action.requiredLevel || userLevel >= action.requiredLevel) {
        accessible.push(action);
      } else {
        restricted.push(action);
      }
    });

    return { accessibleActions: accessible, restrictedActions: restricted };
  }, [userLevel]);

  return (
    <section className={cn("space-y-8", className)}>
      <div className="space-y-2">
        <h2 className="heading-professional text-title-large font-light">
          Hurtighandlinger
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Ofte brukte funksjoner for effektiv administrasjon
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Accessible actions */}
        {accessibleActions.map((action) => (
          <QuickActionCard
            key={action.id}
            action={action}
          />
        ))}

        {/* Restricted actions */}
        {restrictedActions.map((action) => (
          <RestrictedAction
            key={action.id}
            action={action}
          />
        ))}
      </div>
    </section>
  );
}

export default QuickActions;