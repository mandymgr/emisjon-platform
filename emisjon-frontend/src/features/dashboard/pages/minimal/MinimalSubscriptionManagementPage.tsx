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
        title="Tilgang nektet"
        subtitle="Du har ikke tilstrekkelig tilgang til denne siden"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-soft">
            <UserX className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif text-teal-900 mb-3">Admin Level 2+ påkrevd</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Abonnementsstyring krever administratorrettigheter med Level 2+ tilgang. Kontakt din administrator for tilgang.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout
        title="Laster..."
        subtitle="Henter abonnementsdata"
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </PageLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-neutral-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <PageLayout
      title="Abonnementsstyring"
      subtitle="Se og administrer alle abonnementsforespørsler"
      actions={
        <div className="flex items-center space-x-4">
          <Shield className="h-6 w-6 text-teal-700" />
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <Users className="h-6 w-6 text-teal-700" />
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2 uppercase tracking-wider font-light">Totale abonnementer</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.totalSubscriptions || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <Clock className="h-6 w-6 text-teal-700" />
            <ArrowUpRight className="h-4 w-4 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2 uppercase tracking-wider font-light">Venter godkjenning</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.pendingApproval || 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <TrendingUp className="h-6 w-6 text-teal-700" />
            <ArrowDownRight className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2 uppercase tracking-wider font-light">Godkjent i dag</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats?.approvedToday || 0}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <DollarSign className="h-6 w-6 text-neutral-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Total Value</p>
          <p className="text-3xl font-light text-neutral-900">
            ${stats?.totalValue ? Math.floor(stats.totalValue / 1000000) : 0}M
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED')}
              className="px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
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
      <div className="bg-white border border-neutral-200">
        <div className="p-8 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-neutral-900">Subscription Requests</h2>
            <span className="text-sm text-neutral-600">
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
                        <h3 className="text-lg font-medium text-neutral-900 mb-1">
                          {subscription.emissionTitle}
                        </h3>
                        <p className="text-sm text-neutral-600 mb-2">
                          {subscription.subscriberName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {subscription.subscriberEmail}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        {getStatusIcon(subscription.status)}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
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
                        <p className="text-neutral-600">Total Value</p>
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
                          Requested: {new Date(subscription.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {subscription.reviewedAt && (
                        <div className="flex items-center space-x-2 text-xs text-neutral-500">
                          <Activity className="h-3 w-3" />
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
                      <button className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors flex items-center justify-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>Details</span>
                      </button>
                      {subscription.status === 'PENDING' && (
                        <>
                          <button className="flex-1 py-2 bg-green-600 text-white text-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-1">
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button className="flex-1 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors flex items-center justify-center space-x-1">
                            <X className="h-3 w-3" />
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
              <Shield className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-xl font-light text-neutral-900 mb-3">No Subscriptions Found</h3>
              <p className="text-neutral-600 mb-6">
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