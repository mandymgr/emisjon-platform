import { useEffect, useState } from 'react';
import { FiCamera, FiRefreshCw, FiFilter, FiGitBranch } from 'react-icons/fi';
import { useAppSelector } from '@/store/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import * as snapshotService from '@/services/snapshotService';
import * as emissionsService from '../services/emissionsService';
import type { ShareholderSnapshot } from '@/components/shareholderSnapshot/types';
import type { Emission } from '@/types/emission';
import SnapshotCard from '@/components/shareholderSnapshot/SnapshotCard';
import SnapshotDetailsTable from '@/components/shareholderSnapshot/SnapshotDetailsTable';
import SnapshotComparison from '@/components/shareholderSnapshot/SnapshotComparison';

export default function ShareholderSnapshotsPage() {
  const { user } = useAppSelector(state => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  
  const [snapshots, setSnapshots] = useState<ShareholderSnapshot[]>([]);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ShareholderSnapshot | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSnapshots, setCompareSnapshots] = useState<[ShareholderSnapshot | null, ShareholderSnapshot | null]>([null, null]);
  const [filterEmissionId, setFilterEmissionId] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'details' | 'compare'>('grid');

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [snapshotsData, emissionsData] = await Promise.all([
        snapshotService.getAllSnapshots(),
        emissionsService.getAllEmissions()
      ]);
      setSnapshots(snapshotsData);
      setEmissions(emissionsData);
      setError(null);
    } catch (err) {
      const error = err as Error & { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Reserved for future manual snapshot creation feature
  // const handleCreateManualSnapshot = async (emissionId: string) => {
  //   try {
  //     await snapshotService.createManualSnapshot(emissionId);
  //     fetchData();
  //   } catch (err) {
  //     const error = err as Error & { response?: { data?: { error?: string } } };
  //     setError(error.response?.data?.error || 'Failed to create snapshot');
  //   }
  // };

  const handleSelectSnapshot = (snapshot: ShareholderSnapshot) => {
    if (compareMode) {
      const [first] = compareSnapshots;
      if (!first) {
        setCompareSnapshots([snapshot, null]);
      } else if (first.id !== snapshot.id) {
        setCompareSnapshots([first, snapshot]);
        setView('compare');
        setCompareMode(false);
      }
    } else {
      setSelectedSnapshot(snapshot);
      setView('details');
    }
  };

  const filteredSnapshots = filterEmissionId === 'all' 
    ? snapshots 
    : snapshots.filter(s => s.emissionId === filterEmissionId);

  if (!isAdmin) {
    return (
      <div className="bg-card rounded-lg shadow-md border border-border p-8">
        <div className="text-center">
          <FiCamera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Admin access required to view shareholder snapshots
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Shareholder Snapshots</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Historical records of shareholder ownership at key moments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchData()}
            className="flex items-center gap-2"
          >
            <FiRefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-card rounded-lg shadow-md border border-border p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter size={16} className="text-muted-foreground" />
              <select
                value={filterEmissionId}
                onChange={(e) => setFilterEmissionId(e.target.value)}
                className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="all">All Emissions</option>
                {emissions.map(emission => (
                  <option key={emission.id} value={emission.id}>
                    {emission.title}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant={compareMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode);
                setCompareSnapshots([null, null]);
              }}
              className="flex items-center gap-2"
            >
              <FiGitBranch size={14} />
              {compareMode ? 'Cancel Compare' : 'Compare'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('grid')}
            >
              Grid
            </Button>
            <Button
              variant={view === 'details' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('details')}
              disabled={!selectedSnapshot}
            >
              Details
            </Button>
            <Button
              variant={view === 'compare' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('compare')}
              disabled={!compareSnapshots[0] || !compareSnapshots[1]}
            >
              Comparison
            </Button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Compare Mode Instructions */}
      {compareMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            Select two snapshots to compare. 
            {compareSnapshots[0] && !compareSnapshots[1] && ' Select the second snapshot.'}
            {compareSnapshots[0] && compareSnapshots[1] && ' Click "Comparison" to view the differences.'}
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-card rounded-lg border border-border p-4">
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : filteredSnapshots.length === 0 ? (
        <div className="bg-card rounded-lg shadow-md border border-border p-8">
          <div className="text-center">
            <FiCamera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No snapshots found</p>
            <p className="text-sm text-muted-foreground">
              Snapshots are created automatically when subscriptions are approved or emissions are finalized
            </p>
          </div>
        </div>
      ) : (
        <>
          {view === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSnapshots.map((snapshot) => (
                <SnapshotCard
                  key={snapshot.id}
                  snapshot={snapshot}
                  onClick={() => handleSelectSnapshot(snapshot)}
                  isSelected={
                    selectedSnapshot?.id === snapshot.id ||
                    compareSnapshots[0]?.id === snapshot.id ||
                    compareSnapshots[1]?.id === snapshot.id
                  }
                />
              ))}
            </div>
          )}

          {view === 'details' && selectedSnapshot && (
            <div className="bg-card rounded-lg shadow-md border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">
                      Snapshot Details
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSnapshot.emission?.title} - {new Date(selectedSnapshot.createdAt).toLocaleString('nb-NO')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView('grid')}
                  >
                    Back to Grid
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <SnapshotDetailsTable snapshot={selectedSnapshot} />
              </div>
            </div>
          )}

          {view === 'compare' && compareSnapshots[0] && compareSnapshots[1] && (
            <div className="bg-card rounded-lg shadow-md border border-border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Snapshot Comparison
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comparing changes between two snapshots
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setView('grid');
                    setCompareSnapshots([null, null]);
                  }}
                >
                  Back to Grid
                </Button>
              </div>
              <SnapshotComparison
                beforeSnapshot={compareSnapshots[0]}
                afterSnapshot={compareSnapshots[1]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}