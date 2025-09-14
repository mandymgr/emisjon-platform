import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// // import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Shield, 
  Bell, 
  History as HistoryIcon,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { TradingDashboard } from '@/components/trading/TradingDashboard';
import { AdminApprovalPanel } from '@/components/trading/AdminApprovalPanel';
import { NotificationCenter } from '@/components/trading/NotificationCenter';
import { TradingHistory } from '@/components/trading/TradingHistory';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';


export default function Trading() {
  const { user } = useAppSelector(state => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const userLevel = user?.level || 1;
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: shareholders } = useQuery({
    queryKey: ['shareholders'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/shareholders');
      return response.data;
    },
    enabled: !!user,
  });

  // Helper functions for access control
  const hasAdminL2Access = () => isAdmin && userLevel >= 2;
  const hasUserL1Access = () => userLevel >= 1;

  const showAdminPanel = hasAdminL2Access();

  if (!user) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Please Log In</AlertTitle>
              <AlertDescription>
                You need to be logged in to access the trading platform.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasUserL1Access()) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Insufficient Access Level</AlertTitle>
              <AlertDescription>
                Your account does not have access to the trading platform.
                Please contact your administrator to upgrade your access level.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Trading Platform</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationCenter compact />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:inline-grid p-1 h-auto">
          <TabsTrigger value="dashboard" className="data-[state=active]:text-white flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2.5 h-auto cursor-pointer">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Trade</span>
          </TabsTrigger>
          {showAdminPanel && (
            <TabsTrigger value="admin" className="data-[state=active]:text-white flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2.5 h-auto cursor-pointer">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="data-[state=active]:text-white flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2.5 h-auto cursor-pointer">
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:text-white flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2.5 h-auto cursor-pointer">
            <HistoryIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TradingDashboard shareholders={shareholders} />
        </TabsContent>

        {showAdminPanel && (
          <TabsContent value="admin" className="space-y-6">
            <AdminApprovalPanel />
          </TabsContent>
        )}

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <TradingHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}