import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getAllSubscriptions } from '@/services/subscriptionService';
import PageLayout from '@/components/layout/PageLayout';
import type { Subscription } from '@/types/subscription';
import {
  Shield,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  UserX,
  Loader2,
  Search,
  Calendar,
  Eye,
  Check,
  X
} from 'lucide-react';

interface ManagementStats {
  totalSubscriptions: number;
  pendingApproval: number;
  approvedToday: number;
  totalValue: number;
}

interface EnhancedSubscription extends Subscription {
  totalValue: number;
  emissionTitle: string;
  userName: string;
  sharesAllocated: number;
  pricePerShare: number;
  subscriberName: string;
  subscriberEmail: string;
  reviewedAt: string | null;
}

const MinimalSubscriptionManagementPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<EnhancedSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<EnhancedSubscription[]>([]);
  const [stats, setStats] = useState<ManagementStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Check access - Admin Level 2+ required for subscription management
  const hasAccess = user && user.role === 'ADMIN' && user.level >= 2;

  useEffect(() => {
    if (!hasAccess) return;

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const subscriptionsData = await getAllSubscriptions();

        // Mock enhanced data for demo
        const enhancedSubscriptions = subscriptionsData.map((subscription: Subscription): EnhancedSubscription => ({
          ...subscription,
          status: (['PENDING', 'APPROVED', 'REJECTED'] as const)[Math.floor(Math.random() * 3)],
          sharesRequested: Math.floor(Math.random() * 1000) + 100,
          sharesAllocated: subscription.sharesAllocated || 0,
          pricePerShare: Math.floor(Math.random() * 100) + 50,
          totalValue: 0, // Will be calculated
          emissionTitle: `Emission ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          userName: subscription.user?.name || 'Unknown User',
          subscriberName: `User ${Math.floor(Math.random() * 100) + 1}`,
          subscriberEmail: `user${Math.floor(Math.random() * 100) + 1}@example.com`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          reviewedAt: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null
        }));

        // Calculate total values
        const processedSubscriptions = enhancedSubscriptions.map((sub: EnhancedSubscription): EnhancedSubscription => ({
          ...sub,
          totalValue: sub.sharesRequested * sub.pricePerShare
        }));

        setSubscriptions(processedSubscriptions);

        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        setStats({
          totalSubscriptions: processedSubscriptions.length,
          pendingApproval: processedSubscriptions.filter((s: EnhancedSubscription) => s.status === 'PENDING').length,
          approvedToday: processedSubscriptions.filter((s: EnhancedSubscription) =>
            s.status === 'APPROVED' &&
            s.reviewedAt &&
            new Date(s.reviewedAt) >= today
          ).length,
          totalValue: processedSubscriptions.reduce((sum: number, s: EnhancedSubscription) => sum + s.totalValue, 0)
        });
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [hasAccess]);

  useEffect(() => {
    let filtered = subscriptions.filter(sub =>
      sub.subscriberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subscriberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.emissionTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, statusFilter]);

  if (!hasAccess) {
    return (
      <PageLayout
        title="Access Denied"
        subtitle="You do not have sufficient access to this page"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border border-gray-200 p-12 rounded-2xl shadow-soft">
            <UserX className="h-16 w-16 text-sidebar-foreground/30 mx-auto mb-6" />
            <h2 className="text-xl font-serif text-teal-900 mb-2">Admin Level 2+ Required</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Subscription management requires administrator rights with Level 2+ access. Contact your administrator for access.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout
        title="Loading..."
        subtitle="Fetching subscription data"
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </PageLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-gray-400" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-gray-400" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-black';
      case 'APPROVED': return 'bg-gray-100 text-black';
      case 'REJECTED': return 'bg-gray-100 text-black';
      default: return 'bg-gray-100 text-black';
    }
  };

  return (
    <PageLayout
      title="Subscription Management"
      subtitle="View and manage all subscription requests"
      actions={
        <div className="flex items-center space-x-4">
          <Shield className="h-6 w-6 text-gray-600" />
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total Subscriptions</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.totalSubscriptions || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Pending Approval</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.pendingApproval || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3">
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Approved Today</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.approvedToday || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3">
              <DollarSign className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total Value</p>
          <p className="text-3xl font-serif text-teal-900">
            ${stats?.totalValue ? Math.floor(stats.totalValue / 1000000) : 0}M
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-6 mb-8 rounded-2xl shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-teal-900"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED')}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-teal-900 min-w-[120px]"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions List - Gallery Style */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft">
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-teal-900">Subscription Requests</h2>
            <span className="text-sm text-gray-600">
              {filteredSubscriptions.length} results
            </span>
          </div>
        </div>

        <div className="p-8">
          {filteredSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredSubscriptions.map((subscription: EnhancedSubscription) => (
                <div key={subscription.id} className="border border-neutral-200 hover:border-neutral-400 transition-colors">
                  {/* Header */}
                  <div className="p-6 border-b border-neutral-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-teal-900 mb-1">
                          {subscription.emissionTitle}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {subscription.subscriberName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {subscription.subscriberEmail}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        {getStatusIcon(subscription.status)}
                        <span className={`px-3 py-1 text-xs font-medium ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Shares Requested</p>
                        <p className="font-medium text-teal-900">
                          {subscription.sharesRequested.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price per Share</p>
                        <p className="font-medium text-teal-900">
                          ${subscription.pricePerShare.toFixed(2)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Total Value</p>
                        <p className="font-medium text-teal-900 text-lg">
                          ${subscription.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="pt-4 border-t border-neutral-100 space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 text-gray-600" />
                        <span>
                          Requested: {new Date(subscription.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {subscription.reviewedAt && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Activity className="h-3 w-3 text-gray-600" />
                          <span>
                            Reviewed: {new Date(subscription.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    <div className="flex space-x-2">
                      <button className="flex-1 py-2 border border-neutral-300 text-sm text-gray-600 hover:text-teal-900 hover:border-neutral-400 transition-colors flex items-center justify-center space-x-1">
                        <Eye className="h-3 w-3 text-gray-600" />
                        <span>Details</span>
                      </button>
                      {subscription.status === 'PENDING' && (
                        <>
                          <button className="flex-1 py-2 bg-gray-600 text-white text-sm hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1">
                            <Check className="h-3 w-3 text-gray-600" />
                            <span>Approve</span>
                          </button>
                          <button className="flex-1 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors flex items-center justify-center space-x-1">
                            <X className="h-3 w-3 text-gray-600" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Shield className="h-16 w-16 text-sidebar-foreground/30 mx-auto mb-6" />
              <h3 className="text-xl font-light text-teal-900 mb-3">No Subscriptions Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No subscription requests to review at this time'
                }
              </p>
              {(searchTerm || statusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                  }}
                  className="px-6 py-3 bg-neutral-900 text-white text-sm font-light hover:bg-neutral-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MinimalSubscriptionManagementPage;