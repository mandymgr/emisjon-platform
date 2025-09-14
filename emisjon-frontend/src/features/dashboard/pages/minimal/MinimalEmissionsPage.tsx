import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getAllEmissions } from '../services/emissionsService';
import {
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  UserX,
  Loader2,
  Plus,
  Eye,
  Activity
} from 'lucide-react';

interface EmissionStats {
  totalEmissions: number;
  activeEmissions: number;
  totalValue: number;
  totalSubscriptions: number;
}

const MinimalEmissionsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [emissions, setEmissions] = useState<any[]>([]);
  const [stats, setStats] = useState<EmissionStats | null>(null);

  // Check access - Level 3+ required for emissions
  const hasAccess = user && (user.role === 'ADMIN' || user.level >= 3);

  useEffect(() => {
    if (!hasAccess) return;

    const fetchEmissions = async () => {
      try {
        setLoading(true);
        const emissionsData = await getAllEmissions();

        // Mock enhanced data for demo
        const enhancedEmissions = emissionsData.map((emission: any) => ({
          ...emission,
          subscriptions: Math.floor(Math.random() * 50) + 10,
          totalValue: Math.floor(Math.random() * 5000000) + 1000000,
          status: ['PREVIEW', 'ACTIVE', 'COMPLETED', 'FINALIZED'][Math.floor(Math.random() * 4)],
          startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        }));

        setEmissions(enhancedEmissions);

        // Calculate stats
        setStats({
          totalEmissions: enhancedEmissions.length,
          activeEmissions: enhancedEmissions.filter((e: any) => e.status === 'ACTIVE').length,
          totalValue: enhancedEmissions.reduce((sum: number, e: any) => sum + e.totalValue, 0),
          totalSubscriptions: enhancedEmissions.reduce((sum: number, e: any) => sum + e.subscriptions, 0)
        });
      } catch (error) {
        console.error('Error fetching emissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmissions();
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-neutral-200 p-12 text-center">
          <UserX className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-neutral-900 mb-3">Level 3+ Access Required</h2>
          <p className="text-neutral-600 max-w-md mx-auto">
            Emissions management requires Level 3+ access or Admin privileges. Contact your administrator for access.
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PREVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'FINALIZED': return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-light text-neutral-900 mb-3">
            Emissions
          </h1>
          <p className="text-neutral-600">
            Manage company share emissions and capital raising activities
          </p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-neutral-900 text-white text-sm font-light hover:bg-neutral-800 transition-colors">
          <Plus className="h-4 w-4" />
          <span>New Emission</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <Activity className="h-6 w-6 text-neutral-600" />
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Total Emissions</p>
          <p className="text-3xl font-light text-neutral-900">
            {stats?.totalEmissions || 0}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <TrendingUp className="h-6 w-6 text-neutral-600" />
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Active</p>
          <p className="text-3xl font-light text-neutral-900">
            {stats?.activeEmissions || 0}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <DollarSign className="h-6 w-6 text-neutral-600" />
            <ArrowDownRight className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Total Value</p>
          <p className="text-3xl font-light text-neutral-900">
            ${stats?.totalValue ? Math.floor(stats.totalValue / 1000000) : 0}M
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <Users className="h-6 w-6 text-neutral-600" />
          </div>
          <p className="text-sm text-neutral-600 mb-2">Subscriptions</p>
          <p className="text-3xl font-light text-neutral-900">
            {stats?.totalSubscriptions || 0}
          </p>
        </div>
      </div>

      {/* Emissions Grid - Gallery Style */}
      <div className="bg-white border border-neutral-200">
        <div className="p-8 border-b border-neutral-200">
          <h2 className="text-xl font-light text-neutral-900">Share Emissions</h2>
        </div>

        <div className="p-8">
          {emissions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {emissions.map((emission: any) => (
                <div key={emission.id} className="border border-neutral-200 hover:border-neutral-400 transition-colors">
                  {/* Header */}
                  <div className="p-6 border-b border-neutral-100">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-medium text-neutral-900 line-clamp-2">
                        {emission.title}
                      </h3>
                      <div className={`px-3 py-1 text-xs font-medium rounded-full ml-3 flex-shrink-0 ${getStatusColor(emission.status)}`}>
                        {emission.status}
                      </div>
                    </div>

                    {emission.description && (
                      <p className="text-sm text-neutral-600 line-clamp-3 mb-4">
                        {emission.description}
                      </p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600">Shares Available</p>
                        <p className="font-medium text-neutral-900">
                          {emission.sharesAvailable?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Price per Share</p>
                        <p className="font-medium text-neutral-900">
                          ${emission.pricePerShare?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Subscriptions</p>
                        <p className="font-medium text-neutral-900">
                          {emission.subscriptions}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Total Value</p>
                        <p className="font-medium text-neutral-900">
                          ${Math.floor(emission.totalValue / 1000)}K
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="pt-4 border-t border-neutral-100">
                      <div className="flex items-center space-x-2 text-xs text-neutral-500 mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(emission.startDate).toLocaleDateString()} - {' '}
                          {new Date(emission.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    <div className="flex space-x-2">
                      <button className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors flex items-center justify-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                      <button className="flex-1 py-2 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>Subscribe</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Activity className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-xl font-light text-neutral-900 mb-3">No Emissions Yet</h3>
              <p className="text-neutral-600 mb-6">
                Create your first share emission to start raising capital
              </p>
              <button className="px-6 py-3 bg-neutral-900 text-white text-sm font-light hover:bg-neutral-800 transition-colors">
                Create Emission
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinimalEmissionsPage;