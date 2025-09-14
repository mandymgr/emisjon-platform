import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getMySubscriptions } from '@/services/subscriptionService';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  UserX,
  Loader2,
  Edit3,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalValue: number;
  pendingApproval: number;
}

const MinimalMySubscriptionsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);

  // Check access - Level 3+ required for subscriptions
  const hasAccess = user && (user.role === 'ADMIN' || user.level >= 3);

  useEffect(() => {
    if (!hasAccess) return;

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const subscriptionsData = await getMySubscriptions();

        // Mock enhanced data for demo
        const enhancedSubscriptions = subscriptionsData.map((subscription: any) => ({
          ...subscription,
          status: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'][Math.floor(Math.random() * 4)],
          sharesRequested: Math.floor(Math.random() * 1000) + 100,
          pricePerShare: Math.floor(Math.random() * 100) + 50,
          totalValue: 0, // Will be calculated
          emissionTitle: `Emission ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          approvalDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
        }));

        // Calculate total values
        const processedSubscriptions = enhancedSubscriptions.map((sub: any) => ({
          ...sub,
          totalValue: sub.sharesRequested * sub.pricePerShare
        }));

        setSubscriptions(processedSubscriptions);

        // Calculate stats
        setStats({
          totalSubscriptions: processedSubscriptions.length,
          activeSubscriptions: processedSubscriptions.filter((s: any) => s.status === 'APPROVED').length,
          totalValue: processedSubscriptions.reduce((sum: number, s: any) => sum + s.totalValue, 0),
          pendingApproval: processedSubscriptions.filter((s: any) => s.status === 'PENDING').length
        });
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-neutral-200 p-12 text-center">
          <UserX className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-neutral-900 mb-3">Level 3+ Access Required</h2>
          <p className="text-neutral-600 max-w-md mx-auto">
            Subscription management requires Level 3+ access or Admin privileges. Contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-neutral-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-light text-neutral-900 mb-3">
          My Subscriptions
        </h1>
        <p className="text-neutral-600">
          Manage your share emission subscriptions and investment portfolio
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <CreditCard className="h-6 w-6 text-neutral-600" />
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Total Subscriptions</p>
          <p className="text-3xl font-light text-neutral-900">
            {stats?.totalSubscriptions || 0}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <TrendingUp className="h-6 w-6 text-neutral-600" />
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Active</p>
          <p className="text-3xl font-light text-neutral-900">
            {stats?.activeSubscriptions || 0}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <DollarSign className="h-6 w-6 text-neutral-600" />
            <ArrowDownRight className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Total Investment</p>
          <p className="text-3xl font-light text-neutral-900">
            ${stats?.totalValue ? Math.floor(stats.totalValue / 1000) : 0}K
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <Activity className="h-6 w-6 text-neutral-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Pending Approval</p>
          <p className="text-3xl font-light text-neutral-900">
            {stats?.pendingApproval || 0}
          </p>
        </div>
      </div>

      {/* Subscriptions List - Gallery Style */}
      <div className="bg-white border border-neutral-200">
        <div className="p-8 border-b border-neutral-200">
          <h2 className="text-xl font-light text-neutral-900">Share Subscriptions</h2>
        </div>

        <div className="p-8">
          {subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {subscriptions.map((subscription: any) => (
                <div key={subscription.id} className="border border-neutral-200 hover:border-neutral-400 transition-colors">
                  {/* Header */}
                  <div className="p-6 border-b border-neutral-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-neutral-900 mb-1">
                          {subscription.emissionTitle}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(subscription.status)}
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600">Shares Requested</p>
                        <p className="font-medium text-neutral-900">
                          {subscription.sharesRequested.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Price per Share</p>
                        <p className="font-medium text-neutral-900">
                          ${subscription.pricePerShare.toFixed(2)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-neutral-600">Total Investment</p>
                        <p className="font-medium text-neutral-900 text-lg">
                          ${subscription.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="pt-4 border-t border-neutral-100 space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-neutral-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Subscribed: {new Date(subscription.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {subscription.approvalDate && (
                        <div className="flex items-center space-x-2 text-xs text-neutral-500">
                          <CheckCircle className="h-3 w-3" />
                          <span>
                            Approved: {new Date(subscription.approvalDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    <div className="flex space-x-2">
                      <button className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors flex items-center justify-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                      {subscription.status === 'PENDING' && (
                        <button className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors flex items-center justify-center space-x-1">
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <CreditCard className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-xl font-light text-neutral-900 mb-3">No Subscriptions Yet</h3>
              <p className="text-neutral-600 mb-6">
                Subscribe to share emissions to start building your investment portfolio
              </p>
              <button className="px-6 py-3 bg-neutral-900 text-white text-sm font-light hover:bg-neutral-800 transition-colors">
                Browse Emissions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinimalMySubscriptionsPage;