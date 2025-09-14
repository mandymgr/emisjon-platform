import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getAllShareholders } from '../services/shareholdersService';
import {
  TrendingUp,
  Shield,
  Bell,
  History,
  ArrowUpRight,
  ArrowDownRight,
  UserX,
  Activity,
  Users,
  DollarSign,
  Loader2
} from 'lucide-react';

interface TradeOrder {
  id: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  shareholder: string;
}

interface MarketStats {
  totalTrades: number;
  totalVolume: number;
  avgPrice: number;
  activeOrders: number;
}

const TradingPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [, setShareholders] = useState<any[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<TradeOrder[]>([]);

  const hasAccess = user && user.level >= 1;
  const isAdmin = user?.role === 'ADMIN' && user?.level >= 2;

  useEffect(() => {
    if (!hasAccess) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const shareholdersData = await getAllShareholders();
        setShareholders(shareholdersData);

        // Mock trading data
        setMarketStats({
          totalTrades: 127,
          totalVolume: 45600,
          avgPrice: 125.50,
          activeOrders: 12
        });

        setRecentTrades([
          {
            id: '1',
            type: 'BUY',
            shares: 100,
            price: 125.00,
            status: 'APPROVED',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            shareholder: 'John Doe'
          },
          {
            id: '2',
            type: 'SELL',
            shares: 50,
            price: 126.75,
            status: 'PENDING',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            shareholder: 'Jane Smith'
          },
          {
            id: '3',
            type: 'BUY',
            shares: 200,
            price: 124.25,
            status: 'APPROVED',
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            shareholder: 'Mike Johnson'
          }
        ]);
      } catch (error) {
        console.error('Error fetching trading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-neutral-200 p-12 text-center">
          <UserX className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-neutral-900 mb-3">Trading Access Required</h2>
          <p className="text-neutral-600 max-w-md mx-auto">
            Level 1+ access required to use the trading platform. Contact your administrator for access.
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

  const tabs = [
    { id: 'dashboard', label: 'Trading', icon: TrendingUp },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-light text-neutral-900 mb-3">
          Trading Platform
        </h1>
        <p className="text-neutral-600">
          Manage share transactions and market activity
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-12 border-b border-neutral-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-light border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-12">
          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white border border-neutral-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <Activity className="h-6 w-6 text-neutral-600" />
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-neutral-600 mb-2">Total Trades</p>
              <p className="text-3xl font-light text-neutral-900">
                {marketStats?.totalTrades.toLocaleString()}
              </p>
            </div>

            <div className="bg-white border border-neutral-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <TrendingUp className="h-6 w-6 text-neutral-600" />
                <ArrowUpRight className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm text-neutral-600 mb-2">Volume</p>
              <p className="text-3xl font-light text-neutral-900">
                {marketStats?.totalVolume.toLocaleString()}
              </p>
            </div>

            <div className="bg-white border border-neutral-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <DollarSign className="h-6 w-6 text-neutral-600" />
                <ArrowDownRight className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm text-neutral-600 mb-2">Avg. Price</p>
              <p className="text-3xl font-light text-neutral-900">
                ${marketStats?.avgPrice.toFixed(2)}
              </p>
            </div>

            <div className="bg-white border border-neutral-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <Users className="h-6 w-6 text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-600 mb-2">Active Orders</p>
              <p className="text-3xl font-light text-neutral-900">
                {marketStats?.activeOrders}
              </p>
            </div>
          </div>

          {/* Recent Trades - Gallery Style */}
          <div className="bg-white border border-neutral-200">
            <div className="p-8 border-b border-neutral-200">
              <h2 className="text-xl font-light text-neutral-900">Recent Trading Activity</h2>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {recentTrades.map(trade => (
                  <div key={trade.id} className="border-l-2 border-neutral-200 pl-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                        trade.type === 'BUY'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type}
                      </div>
                      <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                        trade.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : trade.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.status}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Shares</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {trade.shares.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Price</span>
                        <span className="text-sm font-medium text-neutral-900">
                          ${trade.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-600">Total</span>
                        <span className="text-sm font-medium text-neutral-900">
                          ${(trade.shares * trade.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100">
                      <p className="text-sm text-neutral-900 mb-1">{trade.shareholder}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(trade.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Tab */}
      {activeTab === 'admin' && isAdmin && (
        <div className="bg-white border border-neutral-200 p-12 text-center">
          <Shield className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-neutral-900 mb-3">Admin Panel</h2>
          <p className="text-neutral-600">
            Approve pending trades and manage platform settings
          </p>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-neutral-200 p-12 text-center">
          <Bell className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-neutral-900 mb-3">Trading Alerts</h2>
          <p className="text-neutral-600">
            Stay updated on market activity and trade notifications
          </p>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white border border-neutral-200 p-12 text-center">
          <History className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-neutral-900 mb-3">Trading History</h2>
          <p className="text-neutral-600">
            View complete history of all trading transactions
          </p>
        </div>
      )}
    </div>
  );
};

export default TradingPage;