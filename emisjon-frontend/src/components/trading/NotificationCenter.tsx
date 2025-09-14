import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Circle,
  Filter,
  MoreVertical,
  Package,
  TrendingUp,
  TrendingDown,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { 
  useNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  useUnreadNotificationCount 
} from '@/hooks/useTrading';
import { NotificationType } from '@/types/trading';
import type { Notification } from '@/types/trading';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  className?: string;
  compact?: boolean;
}

export function NotificationCenter({ className, compact = false }: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data: notifications, isLoading, refetch } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const filteredNotifications = notifications?.filter(n => 
    filter === 'all' || !n.read
  ) || [];

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead.mutateAsync(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ORDER_CREATED:
        return <Package className="h-3 w-3 sm:h-4 sm:w-4" />;
      case NotificationType.ORDER_MATCHED:
        return <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case NotificationType.ORDER_CANCELLED:
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />;
      case NotificationType.ORDER_EXPIRED:
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />;
      case NotificationType.TRADE_PENDING:
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />;
      case NotificationType.TRADE_APPROVED:
        return <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case NotificationType.TRADE_REJECTED:
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />;
      case NotificationType.SHARES_RECEIVED:
        return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case NotificationType.SHARES_SOLD:
        return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />;
      default:
        return <Bell className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ORDER_MATCHED:
      case NotificationType.TRADE_APPROVED:
      case NotificationType.SHARES_RECEIVED:
        return 'text-green-600';
      case NotificationType.ORDER_CANCELLED:
      case NotificationType.TRADE_REJECTED:
      case NotificationType.SHARES_SOLD:
        return 'text-red-600';
      case NotificationType.ORDER_EXPIRED:
        return 'text-orange-600';
      case NotificationType.TRADE_PENDING:
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications
            {unreadCount && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto p-1 text-xs"
              >
                Mark all read
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="p-2 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <BellOff className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              filteredNotifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-3 cursor-pointer"
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={cn(
                        "text-sm font-medium",
                        !notification.read && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <Circle className="h-2 w-2 fill-blue-600 text-blue-600 flex-shrink-0 mt-2" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Alerts</span>
            {unreadCount && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadCount} <span className="hidden sm:inline">new</span>
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {filter === 'all' ? 'All' : 'Unread'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <NotificationSkeleton />
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2 sm:mb-4" />
            <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">No notifications</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-auto max-h-[400px] pr-2 sm:pr-4">
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  getIcon={getNotificationIcon}
                  getColor={getNotificationColor}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  getIcon: (type: NotificationType) => React.ReactNode;
  getColor: (type: NotificationType) => string;
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  getIcon, 
  getColor 
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-colors cursor-pointer",
        !notification.read && "bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30",
        notification.read && "hover:bg-muted"
      )}
      onClick={() => !notification.read && onMarkAsRead()}
    >
      <div className={cn("flex-shrink-0 mt-0.5 sm:mt-1", getColor(notification.type))}>
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-xs sm:text-sm truncate",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <Circle className="h-2 w-2 fill-blue-600 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-1.5" />
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3 p-3">
          <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}