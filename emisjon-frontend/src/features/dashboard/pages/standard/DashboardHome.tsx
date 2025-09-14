import * as React from 'react';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/components/ui/primitive';

// Import modular components
import StatsGrid from '@/components/dashboard/StatsGrid';
import ActiveEmissions from '@/components/dashboard/ActiveEmissions';
import TopShareholders from '@/components/dashboard/TopShareholders';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';

// Import services
import {
  getAllEmissions,
  getEmissionStats,
  type Emission
} from '@/services/emissionsService';

// Types for data
interface PortfolioData {
  portfolioValue: number;
  annualizedReturn: number;
  totalUsers?: number;
  totalShareholders: number;
  totalShares: number;
  activeProjects: number;
}

interface ShareholderData {
  id: string;
  name: string;
  email?: string;
  totalShares: number;
  totalValue: number;
  percentage: number;
  isCompany?: boolean;
}

interface ActivityData {
  id: string;
  type: 'emission_created' | 'shareholder_added' | 'subscription_approved' | 'trading_completed' | 'report_generated';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    amount?: number;
    user?: string;
    emission?: string;
  };
}

// Custom hooks for data fetching
function usePortfolioData(userLevel: number) {
  const [data, setData] = React.useState<PortfolioData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch emissions stats
        const stats = await getEmissionStats();

        // Mock portfolio data - replace with real API calls
        const portfolioData: PortfolioData = {
          portfolioValue: 45000000, // 45M NOK
          annualizedReturn: 7.3,
          totalUsers: userLevel >= 3 ? stats.totalInvestors : undefined,
          totalShareholders: stats.totalInvestors,
          totalShares: 125000,
          activeProjects: stats.activeEmissions,
        };

        if (mounted) {
          setData(portfolioData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Kunne ikke laste porteføljedata');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [userLevel]);

  return { data, loading, error };
}

function useEmissionsData() {
  const [data, setData] = React.useState<Emission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch active emissions
        const emissions = await getAllEmissions({
          status: 'ACTIVE',
          limit: 6 // Limit for dashboard display
        });

        if (mounted) {
          setData(emissions);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Kunne ikke laste emisjoner');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

function useShareholdersData(limit: number = 5) {
  const [data, setData] = React.useState<ShareholderData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Mock shareholders data - replace with real API call
        const mockShareholders: ShareholderData[] = [
          {
            id: '1',
            name: 'Maria Jensen',
            email: 'maria@example.no',
            totalShares: 15000,
            totalValue: 1500000,
            percentage: 12.0,
          },
          {
            id: '2',
            name: 'Norges Eiendomsinvest AS',
            email: 'kontakt@norgeseiendom.no',
            totalShares: 12000,
            totalValue: 1200000,
            percentage: 9.6,
            isCompany: true,
          },
          {
            id: '3',
            name: 'Erik Haugen',
            email: 'erik@example.no',
            totalShares: 10000,
            totalValue: 1000000,
            percentage: 8.0,
          },
          {
            id: '4',
            name: 'Lisa Andersen',
            email: 'lisa@example.no',
            totalShares: 8500,
            totalValue: 850000,
            percentage: 6.8,
          },
          {
            id: '5',
            name: 'Bergen Kapital AS',
            email: 'post@bergenkapital.no',
            totalShares: 7500,
            totalValue: 750000,
            percentage: 6.0,
            isCompany: true,
          },
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (mounted) {
          setData(mockShareholders.slice(0, limit));
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Kunne ikke laste aksjonærdata');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [limit]);

  return { data, loading, error };
}

function useActivityData(limit: number = 10) {
  const [data, setData] = React.useState<ActivityData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Mock activity data - replace with real API call
        const mockActivities: ActivityData[] = [
          {
            id: '1',
            type: 'emission_created',
            title: 'Ny emisjon opprettet',
            description: 'Oslo Sentrum Kontorbygg emisjon er klar for investorer',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            metadata: { amount: 15000000, emission: 'Oslo Sentrum Kontorbygg' }
          },
          {
            id: '2',
            type: 'shareholder_added',
            title: 'Ny aksjonær registrert',
            description: 'Maria Jensen har blitt lagt til som aksjonær',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            metadata: { user: 'Maria Jensen' }
          },
          {
            id: '3',
            type: 'subscription_approved',
            title: 'Investering godkjent',
            description: 'Investering i Trondheim Boligprosjekt har blitt godkjent',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            metadata: { amount: 500000, emission: 'Trondheim Boligprosjekt' }
          },
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));

        if (mounted) {
          setData(mockActivities.slice(0, limit));
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Kunne ikke laste aktivitetsdata');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [limit]);

  return { data, loading, error };
}

export default function DashboardHome() {
  const { user } = useAppSelector(state => state.auth);
  const userLevel = user?.level || 1;
  const firstName = user?.name?.split(' ')[0] || 'Bruker';

  // Fetch all data
  const portfolioQuery = usePortfolioData(userLevel);
  const emissionsQuery = useEmissionsData();
  const shareholdersQuery = useShareholdersData(5);
  const activityQuery = useActivityData(10);

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-white to-[#F7F7F5] dark:from-[#0C3C4A] dark:to-[#124F62]"
    )}>
      <main className="max-w-7xl mx-auto px-6 pb-28">
        {/* Welcome Header */}
        <header className="pt-10 pb-12">
          <h1
            className="text-display font-normal tracking-tight text-[#124F62] dark:text-white mb-3"
            style={{ fontFamily: '"EB Garamond", serif' }}
          >
            Dashboard
          </h1>
          <p className="text-body-large font-light text-black/70 dark:text-white/70">
            Velkommen tilbake, {firstName}. Her er en oversikt over dine investeringer og aktivitet.
          </p>
        </header>

        {/* Content Sections */}
        <div className="space-y-16">
          {/* Stats Overview */}
          <StatsGrid
            portfolioValue={portfolioQuery.data?.portfolioValue}
            annualizedReturn={portfolioQuery.data?.annualizedReturn}
            totalUsers={portfolioQuery.data?.totalUsers}
            totalShareholders={portfolioQuery.data?.totalShareholders}
            totalShares={portfolioQuery.data?.totalShares}
            activeProjects={portfolioQuery.data?.activeProjects}
            userLevel={userLevel}
            loading={portfolioQuery.loading}
          />

          {/* Quick Actions */}
          <QuickActions
            userLevel={userLevel}
          />

          {/* Active Emissions */}
          <ActiveEmissions
            emissions={emissionsQuery.data}
            userLevel={userLevel}
            loading={emissionsQuery.loading}
            error={emissionsQuery.error || undefined}
          />

          {/* Bottom Row: Shareholders and Activity */}
          <div className="grid gap-16 lg:grid-cols-2">
            <TopShareholders
              shareholders={shareholdersQuery.data}
              userLevel={userLevel}
              loading={shareholdersQuery.loading}
              error={shareholdersQuery.error || undefined}
            />

            <RecentActivity
              activities={activityQuery.data}
              loading={activityQuery.loading}
              error={activityQuery.error || undefined}
              maxItems={8}
            />
          </div>
        </div>
      </main>
    </div>
  );
}