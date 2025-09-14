interface AccessLevelIndicatorProps {
  isAdmin: boolean;
  userLevel: number;
}

export default function AccessLevelIndicator({ isAdmin, userLevel }: AccessLevelIndicatorProps) {
  const getAccessLabel = () => {
    if (isAdmin) return 'Full Access';
    if (userLevel === 1) return 'Basic Access';
    if (userLevel === 2) return 'Shareholder View';
    return 'Full Access';
  };

  return (
    <div className="flex items-center mb-4">
      <h3 className="text-lg font-semibold text-foreground">
        {isAdmin ? 'Administrator Dashboard' : `User Level: ${userLevel}`}
      </h3>
      <span className="ml-3 px-2 py-1 text-xs font-medium bg-primary/10 text-primary dark:text-primary-foreground rounded-full">
        {getAccessLabel()}
      </span>
    </div>
  );
}