import { useEffect, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import { useAppSelector } from '@/store/hooks';
import PageLayout from '@/components/layout/PageLayout';
import { usePortfolio } from "../hooks/usePortfolio";
import { useProjects } from "../hooks/useProjects";
import { useDocuments } from "../hooks/useDocuments";
import type { Project, DocumentRow } from "../hooks/types";
import type { Shareholder } from '@/components/shareholder/types';
import type { Emission } from '@/types/emission';
import * as shareholdersService from '../services/shareholdersService';
import * as usersService from '../services/usersService';
import * as emissionsService from '../services/emissionsService';
import { ShareholdersChart, ActiveEmissionCard, AccessRestrictedCard } from '@/components/dashboard';

/**
 * MinimalDashboardHomeKinfolk.tsx
 * Scandinavian / editorial (Kinfolk) dashboard
 * - Lys, luftig, sofistikert med profesjonell teal fargepalett
 * - Klare seksjoner og mikrotypografi
 * - Integrert med eksisterende services via hooks
 */

export default function MinimalDashboardHomeKinfolk() {
  const { user } = useAppSelector(state => state.auth);
  const userLevel = user?.level || 1;
  const isUser = user?.role === 'USER';
  const isAdmin = user?.role === 'ADMIN';

  const { data: portfolio, loading: pLoading, error: pError } = usePortfolio();
  const { data: projects, loading: projLoading, error: projError } = useProjects();
  const { data: documents, loading: docLoading, error: docError } = useDocuments();

  // Original dashboard state for missing components
  const [topShareholders, setTopShareholders] = useState<Shareholder[]>([]);
  const [shareholdersLoading, setShareholdersLoading] = useState(true);
  const [totalShares, setTotalShares] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalShareholders, setTotalShareholders] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeEmissions, setActiveEmissions] = useState<Emission[]>([]);
  const [emissionsLoading, setEmissionsLoading] = useState(true);

  const canViewShareholders = isAdmin || (isUser && userLevel >= 2);
  const canViewEmissions = isAdmin || (isUser && userLevel >= 3);

  useEffect(() => {
    const fetchShareholders = async () => {
      if (canViewShareholders) {
        try {
          setShareholdersLoading(true);
          const data = await shareholdersService.getAllShareholders();
          const sorted = data.sort((a, b) => b.shares - a.shares).slice(0, 5);
          setTopShareholders(sorted);
          const total = data.reduce((sum, sh) => sum + sh.shares, 0);
          setTotalShares(total);
          setTotalShareholders(data.length);
        } catch (error) {
          console.error('Failed to fetch shareholders:', error);
        } finally {
          setShareholdersLoading(false);
        }
      } else {
        setShareholdersLoading(false);
      }
    };
    fetchShareholders();
  }, [canViewShareholders]);

  useEffect(() => {
    const fetchStats = async () => {
      if (isAdmin) {
        try {
          setStatsLoading(true);
          const users = await usersService.getAllUsers();
          setTotalUsers(users.length);
        } catch (error) {
          console.error('Failed to fetch users:', error);
        } finally {
          setStatsLoading(false);
        }
      } else {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [isAdmin]);

  useEffect(() => {
    const fetchEmissions = async () => {
      if (canViewEmissions) {
        try {
          setEmissionsLoading(true);
          const emissions = await emissionsService.getAllEmissions();
          const active = emissions.filter(e => e.status === 'ACTIVE');
          setActiveEmissions(active);
        } catch (error) {
          console.error('Failed to fetch emissions:', error);
        } finally {
          setEmissionsLoading(false);
        }
      } else {
        setEmissionsLoading(false);
      }
    };
    fetchEmissions();
  }, [canViewEmissions]);

  // Vis loading mens hoveddata lastes
  if (pLoading && projLoading && docLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto w-full max-w-6xl px-6 py-16">
          <SkeletonLines />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <main className="mx-auto w-full max-w-6xl px-6 pb-28 editorial-spacing">
        {/* Tittel / intro */}
        <div className="flex items-end justify-between gap-6 pt-10">
          <div>
            <h1 className="text-5xl font-normal text-foreground mb-3">Dashboard</h1>
            <p className="text-lg font-light text-muted-foreground">
              Welcome back, {user?.name?.split(' ')[0]}. Here's your comprehensive overview.
            </p>
          </div>
        </div>

        {/* Stats */}
        <section className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Portfolio value"
            value={portfolio?.value ?? "—"}
            sub={portfolio?.change}
            loading={pLoading}
            error={pError}
          />
          <StatCard
            label="Annualized return"
            value={portfolio?.annualizedReturn ?? "—"}
            sub="Net of fees"
            loading={pLoading}
            error={pError}
          />
          {isAdmin && (
            <StatCard
              label="Total Users"
              value={String(totalUsers)}
              sub="System users"
              loading={statsLoading}
              error={undefined}
            />
          )}
          {canViewShareholders && (
            <>
              <StatCard
                label="Total Shareholders"
                value={String(totalShareholders)}
                sub="Active shareholders"
                loading={shareholdersLoading}
                error={undefined}
              />
              <StatCard
                label="Total Shares"
                value={totalShares.toLocaleString('nb-NO')}
                sub="Outstanding shares"
                loading={shareholdersLoading}
                error={undefined}
              />
            </>
          )}
          <StatCard
            label="Active projects"
            value={String(projects?.length ?? 0)}
            sub={projects ? summarizeStatuses(projects) : undefined}
            loading={projLoading}
            error={projError}
          />
        </section>

        {/* Active Emissions */}
        <section className="mt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-normal text-foreground">Active Emissions</h2>
            <a href="/minimal-dashboard/emissions" className="text-sm font-light text-primary hover:underline uppercase tracking-wider">
              View all
            </a>
          </div>

          {canViewEmissions ? (
            <>
              {emissionsLoading ? (
                <SkeletonCards />
              ) : activeEmissions.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2">
                  {activeEmissions.map((emission) => (
                    <ActiveEmissionCard key={emission.id} emission={emission} />
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border backdrop-blur-sm rounded-lg p-12">
                  <div className="text-center">
                    <FiActivity className="mx-auto text-muted-foreground/50 mb-4" size={32} />
                    <p className="text-lg font-light text-card-foreground mb-2">No Active Emissions</p>
                    <p className="text-sm font-light text-muted-foreground">There are no investment opportunities available at the moment.</p>
                    <p className="text-sm font-light text-muted-foreground mt-1">Check back later for new emissions.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <AccessRestrictedCard
              requiredLevel={3}
              message="Active emissions are available to Level 3 users."
            />
          )}
        </section>

        {/* Prosjekter */}
        <section className="mt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-normal text-foreground">Projects</h2>
            <a href="#" className="text-sm font-light text-primary hover:underline uppercase tracking-wider">
              View all
            </a>
          </div>
          {projLoading ? (
            <SkeletonCards />
          ) : projError ? (
            <ErrorCard message="Unable to load projects" />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects?.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>

        {/* Top 5 Shareholders */}
        <section className="mt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-normal text-foreground">Top 5 Shareholders</h2>
            <a href="/minimal-dashboard/shareholders" className="text-sm font-light text-primary hover:underline uppercase tracking-wider">
              View all
            </a>
          </div>

          {canViewShareholders ? (
            <ShareholdersChart
              shareholders={topShareholders}
              totalShares={totalShares}
              loading={shareholdersLoading}
            />
          ) : (
            <AccessRestrictedCard
              requiredLevel={2}
              message="Shareholder information requires Level 2+ access."
            />
          )}
        </section>

        {/* Dokumenter */}
        <section className="mt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-normal text-foreground">Documents</h2>
            <a href="#" className="text-sm font-light text-primary hover:underline uppercase tracking-wider">
              All documents
            </a>
          </div>
          {docLoading ? (
            <SkeletonTable />
          ) : docError ? (
            <ErrorCard message="Unable to load documents" />
          ) : (
            <DocumentTable rows={documents ?? []} />
          )}
        </section>
      </main>
    </div>
  );
}

/* ============ Komponenter ============ */

function StatCard({
  label,
  value,
  sub,
  loading = false,
  error
}: {
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
  error?: unknown;
}) {
  if (loading) {
    return (
      <article className="bg-card border border-border p-8 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-24 mb-3"></div>
          <div className="h-8 bg-muted rounded w-32 mb-2"></div>
          <div className="h-4 bg-muted rounded w-20"></div>
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="bg-card border border-destructive/20 p-8 rounded-lg">
        <div className="text-xs font-light uppercase tracking-wider text-muted-foreground mb-3">{label}</div>
        <div className="text-2xl font-light text-destructive">Error</div>
        <div className="text-sm font-light text-muted-foreground">Unable to load</div>
      </article>
    );
  }

  return (
    <article className="bg-card border border-border p-8 hover:border-primary/20 hover:shadow-lg transition-all rounded-lg group">
      <div className="text-xs font-light uppercase tracking-wider text-muted-foreground mb-3">{label}</div>
      <div className="text-4xl font-light text-card-foreground group-hover:text-primary/90 transition-colors">
        {value}
      </div>
      {sub && <div className="text-sm font-light text-muted-foreground mt-2">{sub}</div>}
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { title, status, irr, amount, imageUrl } = project;
  const isOpen = status.toLowerCase() === "open";

  return (
    <article className="overflow-hidden bg-card border border-border rounded-lg hover:border-primary/20 hover:shadow-lg transition-all group">
      <div className="relative h-40 w-full bg-muted">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        )}
        <span className={`absolute left-4 top-4 rounded-lg px-3 py-1 text-xs font-light uppercase tracking-wider ${
          isOpen
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}>
          {status}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-light text-card-foreground mb-4 group-hover:text-primary/90 transition-colors">
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-light uppercase tracking-wider text-muted-foreground mb-1">Target IRR</div>
            <div className="text-lg font-light text-card-foreground">{irr}</div>
          </div>
          <div>
            <div className="text-xs font-light uppercase tracking-wider text-muted-foreground mb-1">Amount</div>
            <div className="text-lg font-light text-card-foreground">{amount}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

function DocumentTable({ rows }: { rows: DocumentRow[] }) {
  if (!rows.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="text-muted-foreground">No documents available</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-card border border-border rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-6 py-4 font-light uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 font-light uppercase tracking-wider">Type</th>
            <th className="px-6 py-4 font-light uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 font-light uppercase tracking-wider">Size</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.name} className={`border-t border-border hover:bg-muted/20 transition-colors ${
              i % 2 ? "bg-muted/10" : ""
            }`}>
              <td className="px-6 py-4 font-light text-card-foreground">{row.name}</td>
              <td className="px-6 py-4 font-light text-muted-foreground">{row.type}</td>
              <td className="px-6 py-4 font-light text-muted-foreground">{row.date}</td>
              <td className="px-6 py-4 font-light text-muted-foreground">{row.size}</td>
              <td className="px-6 py-4 text-right">
                <a href="#" className="text-sm font-light text-primary hover:underline uppercase tracking-wider">
                  Open
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-card border border-destructive/20 rounded-lg p-12 text-center">
      <div className="text-destructive font-light">{message}</div>
    </div>
  );
}

// Hjelpefunksjoner
function summarizeStatuses(projects: { status: string }[]) {
  const open = projects.filter(p => String(p.status).toLowerCase() === "open").length;
  const funded = projects.filter(p => String(p.status).toLowerCase() === "funded").length;
  if (!projects.length) return undefined;
  return `${open} Open · ${funded} Funded`;
}

// Skeleton komponenter
function SkeletonLines() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-64 rounded bg-muted animate-pulse" />
      <div className="h-6 w-80 rounded bg-muted animate-pulse" />
      <div className="h-48 w-full rounded bg-muted animate-pulse" />
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-lg border border-border bg-muted/50" />
      ))}
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden bg-card border border-border rounded-lg">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 animate-pulse border-b border-border bg-muted/20" />
      ))}
    </div>
  );
}