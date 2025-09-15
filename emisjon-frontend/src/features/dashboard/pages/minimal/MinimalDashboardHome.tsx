import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppSelector } from '@/store/hooks';
import PageLayout from '@/components/layout/PageLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResultsContainer } from '@/components/ui/ResultsContainer';
import {
  Users,
  Building2,
  TrendingUp,
  Activity,
  ExternalLink,
  FileText,
  Clock,
  Bell
} from 'lucide-react';
import { getAllUsers } from '../services/usersService';
import { getAllShareholders } from '../services/shareholdersService';
import { getAllEmissions } from '../services/emissionsService';
import { getAllSubscriptions } from '@/services/subscriptionService';

interface Stats {
  totalUsers: number;
  totalShareholders: number;
  totalShares: number;
  activeEmissions: number;
  userGrowth: number;
  shareholderGrowth: number;
  pendingSubscriptions: number;
  totalEmissions: number;
}

interface ChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

const MinimalDashboardHome = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topShareholders, setTopShareholders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [activeEmissions, setActiveEmissions] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch stats based on user level
        if (user && user.level >= 2) {
          const [users, shareholders, emissions, subscriptions] = await Promise.all([
            getAllUsers(),
            getAllShareholders(),
            user.level >= 3 ? getAllEmissions() : Promise.resolve([]),
            user.level >= 3 ? getAllSubscriptions() : Promise.resolve([])
          ]);

          const totalShares = shareholders.reduce((sum: number, sh: any) => sum + (sh.shares || 0), 0);
          const activeEmissionsCount = emissions.filter((e: any) => e.status === 'active').length;
          const pendingSubscriptionsCount = subscriptions.filter((s: any) => s.status === 'pending').length;

          setStats({
            totalUsers: users.length,
            totalShareholders: shareholders.length,
            totalShares,
            activeEmissions: activeEmissionsCount,
            userGrowth: 12.5, // Mock data - could be calculated from historical data
            shareholderGrowth: 8.3, // Mock data - could be calculated from historical data
            pendingSubscriptions: pendingSubscriptionsCount,
            totalEmissions: emissions.length
          });

          // Get top 5 shareholders
          const sortedShareholders = [...shareholders]
            .sort((a, b) => (b.shares || 0) - (a.shares || 0))
            .slice(0, 5);
          setTopShareholders(sortedShareholders);

          // Create chart data for shareholder distribution - Professional Teal Palette
          const chartColors = ['#124F62', '#1C6A7E', '#278899', '#0C3C4A', '#E8E8F0'];
          const chartDataArray: ChartData[] = sortedShareholders.map((sh, index) => ({
            label: sh.name,
            value: sh.shares || 0,
            percentage: totalShares > 0 ? ((sh.shares || 0) / totalShares) * 100 : 0,
            color: chartColors[index] || '#6B7280'
          }));

          // Add "Others" category if there are more than 5 shareholders
          if (shareholders.length > 5) {
            const othersShares = shareholders
              .slice(5)
              .reduce((sum: number, sh: any) => sum + (sh.shares || 0), 0);
            if (othersShares > 0) {
              chartDataArray.push({
                label: 'Others',
                value: othersShares,
                percentage: (othersShares / totalShares) * 100,
                color: '#6B7280'
              });
            }
          }
          setChartData(chartDataArray);

          // Set active emissions for display
          const activeEmissionsList = emissions.filter((e: any) => e.status === 'active');
          setActiveEmissions(activeEmissionsList);

          // Mock recent activities - in real app, this would come from an activity log API
          setRecentActivities([
            {
              id: 1,
              type: 'emission_created',
              description: 'New emission created',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              icon: 'plus'
            },
            {
              id: 2,
              type: 'shareholder_added',
              description: 'Shareholder added',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              icon: 'user'
            },
            {
              id: 3,
              type: 'subscription_approved',
              description: 'Subscription approved',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              icon: 'check'
            },
            {
              id: 4,
              type: 'trading_completed',
              description: 'Trading completed',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              icon: 'trending'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <PageLayout
        title="Dashboard"
        subtitle="Loading dashboard data..."
      >
        <LoadingGrid count={4} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16" />
        <LoadingGrid count={3} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Dashboard"
        subtitle="Error loading dashboard"
      >
        <ErrorMessage message={error} />
      </PageLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.userGrowth || 0,
      icon: Users,
      available: user && user.level >= 2,
      path: '/minimal-dashboard/users'
    },
    {
      title: 'Shareholders',
      value: stats?.totalShareholders || 0,
      change: stats?.shareholderGrowth || 0,
      icon: Building2,
      available: user && user.level >= 2,
      path: '/minimal-dashboard/shareholders'
    },
    {
      title: 'Total Shares',
      value: stats?.totalShares || 0,
      change: 5.2,
      icon: TrendingUp,
      available: user && user.level >= 2,
      path: '/minimal-dashboard/shareholders'
    },
    {
      title: 'Active Emissions',
      value: stats?.activeEmissions || 0,
      change: -2.1,
      icon: TrendingUp,
      available: user && user.level >= 3,
      path: '/minimal-dashboard/emissions'
    },
  ];

  return (
    <PageLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}. Here's an overview of your platform activity.`}
    >

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          if (!stat.available) {
            return (
              <div key={stat.title} className="bg-white border border-gray-200 p-6 cursor-not-allowed opacity-60 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3">
                    <Icon className="h-5 w-5 text-sidebar-foreground/40" />
                  </div>
                  <div className="px-3 py-1 bg-gray-100 text-xs font-light text-gray-500 uppercase tracking-wider rounded-md">
                    Level {stat.title === 'Active Emissions' ? '3' : '2'}+
                  </div>
                </div>
                <p className="text-xs font-light text-gray-400 mb-2 uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-serif text-gray-300">—</p>
              </div>
            );
          }

          return (
            <button
              key={stat.title}
              onClick={() => navigate(stat.path)}
              className="bg-white border border-gray-200 p-6 hover:shadow-soft transition-all text-left w-full rounded-2xl group relative"
            >
              {stat.change !== 0 && (
                <span className="absolute top-4 right-4 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600"></span>
                </span>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center space-x-1 text-xs font-light px-3 py-1 bg-gray-100 rounded-md ${
                    stat.change > 0 ? 'text-teal-600' : 'text-black'
                  }`}>
                    {stat.change > 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">{stat.title}</p>
              <p className="text-3xl font-serif text-teal-900 group-hover:text-teal-700 transition-colors">
                {stat.value.toLocaleString('nb-NO')}
              </p>
            </button>
          );
        })}
      </div>

      {/* Shareholder Distribution */}
      {user && user.level >= 2 && chartData.length > 0 && (
        <div className="mb-16">
          <h2 className="font-serif text-3xl text-teal-900 mb-8">Share Distribution</h2>
          <div className="bg-white border border-gray-200 p-8 rounded-2xl">

            {/* Simple Elegant Bars */}
            <div className="space-y-6 mb-8">
              {chartData.map((data) => {
                const maxValue = Math.max(...chartData.map(d => d.value));
                const widthPercentage = (data.value / maxValue) * 100;

                return (
                  <div key={data.label} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-lg font-light text-card-foreground">
                        {data.label.split(',')[0] || data.label}
                      </p>
                      <div className="text-right">
                        <p className="text-lg font-light text-card-foreground">
                          {data.value.toLocaleString()}
                        </p>
                        <p className="text-xs font-light text-muted-foreground">
                          {data.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar - Professional Teal */}
                    <div className="h-2 bg-muted overflow-hidden rounded-full">
                      <div
                        className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                        style={{
                          width: `${widthPercentage}%`,
                          transitionDelay: `${chartData.indexOf(data) * 200}ms`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="pt-8 border-t border-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <p className="text-2xl font-light text-card-foreground mb-1">
                    {chartData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                  </p>
                  <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">Total Shares</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-card-foreground mb-1">
                    {chartData.length}
                  </p>
                  <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">Shareholders</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-card-foreground mb-1">
                    {Math.max(...chartData.map(d => d.value)).toLocaleString()}
                  </p>
                  <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">Largest</p>
                </div>
                <div>
                  <p className="text-2xl font-light text-card-foreground mb-1">
                    {Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toLocaleString()}
                  </p>
                  <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">Average</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Emissions */}
      {user && user.level >= 3 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl text-teal-900">Active Emissions</h2>
            <button
              onClick={() => navigate('/minimal-dashboard/emissions')}
              className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider flex items-center space-x-1"
            >
              <span>View all</span>
              <ExternalLink className="h-3 w-3 text-gray-600" />
            </button>
          </div>

          {activeEmissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEmissions.slice(0, 3).map((emission: any) => (
                <div key={emission.id} className="bg-card border border-border p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-xs font-light text-teal-700 dark:text-teal-400 uppercase tracking-wider rounded-md">
                      Active
                    </div>
                    <Activity className="h-5 w-5 text-gray-600" />
                  </div>

                  <h3 className="text-lg font-light text-card-foreground mb-2">
                    {emission.title || `Emission ${emission.id}`}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-light text-muted-foreground">Target</span>
                      <span className="font-light text-card-foreground">
                        {emission.targetAmount?.toLocaleString() || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-light text-muted-foreground">Raised</span>
                      <span className="font-light text-card-foreground">
                        {emission.currentAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-light text-muted-foreground">Progress</span>
                      <span className="font-light text-card-foreground">
                        {emission.targetAmount > 0
                          ? Math.round((emission.currentAmount / emission.targetAmount) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted h-2 mb-4 rounded-full">
                    <div
                      className="bg-teal-500 dark:bg-teal-400 h-2 transition-all duration-300 rounded-full"
                      style={{
                        width: `${emission.targetAmount > 0
                          ? Math.min((emission.currentAmount / emission.targetAmount) * 100, 100)
                          : 0}%`
                      }}
                    />
                  </div>

                  <button className="w-full py-2 text-sm font-light text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider border border-border hover:border-primary rounded-md">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border p-12 text-center rounded-lg">
              <Activity className="h-12 w-12 text-sidebar-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-light text-muted-foreground mb-2">No Active Emissions</p>
              <p className="text-sm font-light text-muted-foreground/70">Create your first emission to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-16">
        <h2 className="font-serif text-3xl text-teal-900 mb-8">Quick Actions</h2>
        <div className={`grid gap-6 ${user && user.level >= 3 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {user && user.level >= 2 && (
            <button
              onClick={() => navigate('/minimal-dashboard/shareholders')}
              className="bg-white border border-gray-200 p-8 hover:shadow-soft transition-all text-center rounded-2xl group min-h-[180px] flex flex-col justify-center relative"
            >
              <Building2 className="h-5 w-5 text-gray-600 mx-auto mb-4" />
              <p className="text-base font-light text-card-foreground mb-2">Add Shareholder</p>
              <p className="text-sm font-light text-muted-foreground">Manage ownership</p>
            </button>
          )}

          {user && user.level >= 3 && (
            <button
              onClick={() => navigate('/minimal-dashboard/emissions')}
              className="bg-white border border-gray-200 p-8 hover:shadow-soft transition-all text-center rounded-2xl group min-h-[180px] flex flex-col justify-center relative"
            >
              <TrendingUp className="h-5 w-5 text-gray-600 mx-auto mb-4" />
              <p className="text-base font-light text-card-foreground mb-2">Create Emission</p>
              <p className="text-sm font-light text-muted-foreground">New investment round</p>
            </button>
          )}

          <button className="bg-white border border-gray-200 p-8 hover:shadow-soft transition-all text-center rounded-2xl group min-h-[180px] flex flex-col justify-center relative">
            <FileText className="h-5 w-5 text-gray-600 mx-auto mb-4" />
            <p className="text-base font-light text-card-foreground mb-2">Generate Report</p>
            <p className="text-sm font-light text-muted-foreground">Export data</p>
          </button>

          <button className="bg-white border border-gray-200 p-8 hover:shadow-soft transition-all text-center rounded-2xl group min-h-[180px] flex flex-col justify-center relative">
            <Bell className="h-5 w-5 text-gray-600 mx-auto mb-4" />
            <p className="text-base font-light text-card-foreground mb-2">Notifications</p>
            <p className="text-sm font-light text-muted-foreground">Stay updated</p>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Shareholders */}
        <div className="lg:col-span-2 bg-card border border-border p-8 rounded-lg">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light text-card-foreground">Top Shareholders</h2>
            <button
              onClick={() => navigate('/minimal-dashboard/shareholders')}
              className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider flex items-center space-x-1"
            >
              <span>View all</span>
              <ExternalLink className="h-3 w-3 text-gray-600" />
            </button>
          </div>

          {user && user.level >= 2 ? (
            <div className="space-y-4">
              {topShareholders.map((shareholder) => (
                <div key={shareholder.id} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {shareholder.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-light text-card-foreground">
                        {shareholder.name}
                      </p>
                      <p className="text-sm font-light text-muted-foreground">{shareholder.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-light text-card-foreground">
                      {shareholder.shares?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">shares</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-lg font-light text-muted-foreground mb-3">Level 2+ Required</p>
                <p className="text-sm font-light text-muted-foreground/70">Contact admin for access</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border p-8 rounded-lg">
          <h2 className="text-2xl font-light text-card-foreground mb-8">Recent Activity</h2>

          <div className="space-y-6">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const getActivityColor = (type: string) => {
                  switch (type) {
                    case 'emission_created': return 'bg-gray-500';
                    case 'shareholder_added': return 'bg-blue-500';
                    case 'subscription_approved': return 'bg-yellow-500';
                    case 'trading_completed': return 'bg-purple-500';
                    default: return 'bg-muted-foreground';
                  }
                };

                const getTimeAgo = (timestamp: string) => {
                  const now = new Date();
                  const activityDate = new Date(timestamp);
                  const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));

                  if (diffInHours < 1) return 'Just now';
                  if (diffInHours === 1) return '1 hour ago';
                  if (diffInHours < 24) return `${diffInHours} hours ago`;

                  const diffInDays = Math.floor(diffInHours / 24);
                  if (diffInDays === 1) return '1 day ago';
                  return `${diffInDays} days ago`;
                };

                return (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="relative flex h-3 w-3 mt-1">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600"></span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-light text-card-foreground">{activity.description}</p>
                      <p className="text-sm font-light text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-sidebar-foreground/50 mx-auto mb-3" />
                <p className="text-base font-light text-muted-foreground">No recent activity</p>
                <p className="text-sm font-light text-muted-foreground/70">Activity will appear here as it happens</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MinimalDashboardHome;