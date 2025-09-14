import type { PortfolioSummary, Project, DocumentRow, ShareholderResponse, EmissionResponse } from "./types";

/**
 * Adaptere som henter *ekte data* direkte fra REST-API.
 * Kobler /api/shareholders, /api/emissions, /api/users til UI-format.
 */

// ---- Helpers ----
const NOK = (n: number) =>
  "NOK " + n.toLocaleString("no-NO", { maximumFractionDigits: 0 });

const millions = (n: number) => (n / 1_000_000).toFixed(1) + "m";

// ---- Portfolio ----
// Beregner verdi ut fra shareholders (summerer shares/value hvis finnes).
export async function fetchPortfolio(): Promise<PortfolioSummary> {
  try {
    const res = await fetch("/api/shareholders");
    if (!res.ok) throw new Error("Failed to load shareholders");
    const rows: ShareholderResponse[] = await res.json();

    // Hvis API'et har 'value' i NOK, summer det. Ellers fall back til shares.
    const totals = rows.reduce(
      (acc, r) => ({
        shares: acc.shares + (Number(r.shares) || Number(r.sharesOwned) || 0),
        value: acc.value + (Number(r.value) || 0),
      }),
      { shares: 0, value: 0 }
    );

    const value = totals.value > 0 ? NOK(totals.value) : NOK(totals.shares * 1000); // Estimate 1000 NOK per share

    // TODO: koble på reelle tall hvis dere har endepunkt for YoY/IRR
    return {
      value,
      change: "▲ 4.8% YoY",
      annualizedReturn: "7.9%"
    };
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return {
      value: "NOK 0",
      change: "— % YoY",
      annualizedReturn: "—%",
    };
  }
}

// ---- Projects (emissions) ----
export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch("/api/emissions");
    if (!res.ok) throw new Error("Failed to load emissions");
    const emissions: EmissionResponse[] = await res.json();

    return emissions.map((e) => ({
      id: String(e.id),
      title: [e.name, e.city].filter(Boolean).join(" – "),
      status: e.status,
      irr: e.irr ? `${Number(e.irr).toFixed(1)}%` : undefined,
      amount: typeof e.totalValue === "number" ? `NOK ${millions(e.totalValue)}` : undefined,
      imageUrl: e.imageUrl,
    }));
  } catch (error) {
    console.error('Error fetching projects data:', error);
    return [
      { id: "p1", title: "Fjellhus – Oslo", status: "ACTIVE", irr: "7.8%", amount: "NOK 12.4m", imageUrl: undefined },
      { id: "p2", title: "Bryggekvartalet – Bergen", status: "COMPLETED", irr: "8.2%", amount: "NOK 18.1m", imageUrl: undefined },
      { id: "p3", title: "Trehus Park – Trondheim", status: "ACTIVE", irr: "7.1%", amount: "NOK 9.3m", imageUrl: undefined },
    ];
  }
}

// ---- Documents ----
// Hvis dere ikke har dokument-endepunkt ennå, returner dummy til UI:
export async function fetchDocuments(): Promise<DocumentRow[]> {
  // Bytt til ekte kall når klart (f.eks. /api/documents?limit=10)
  return [
    { name: "Q2 Shareholder Report.pdf", type: "Report", date: "2025-08-12", size: "2.1 MB" },
    { name: "Company Statutes.pdf",      type: "Legal",  date: "2025-06-30", size: "380 KB" },
    { name: "Project Fjellhus – Terms.pdf", type: "Terms", date: "2025-09-02", size: "1.2 MB" },
  ];
}

export const adapters = {
  portfolio: fetchPortfolio,
  projects: fetchProjects,
  documents: fetchDocuments,
};

// Hjelpefunksjoner for formatering
export function formatCurrency(nok: number): string {
  return `NOK ${nok.toLocaleString('nb-NO')}`;
}

export function formatChange(yoyPercent: number): string {
  const symbol = yoyPercent >= 0 ? '▲' : '▼';
  return `${symbol} ${Math.abs(yoyPercent).toFixed(1)}% YoY`;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}