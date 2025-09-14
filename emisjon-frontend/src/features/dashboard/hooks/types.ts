// Domain-typer brukt av dashboardet - koblet til faktiske API-responser

export type PortfolioSummary = {
  value: string;          // "NOK 1,490,000"
  change?: string;        // "▲ 4.8% YoY"
  annualizedReturn?: string; // "7.9%"
};

export type Project = {
  id: string;
  title: string;          // f.eks. "Fjellhus – Oslo"
  status: "PREVIEW" | "ACTIVE" | "COMPLETED" | "FINALIZED" | string;
  irr?: string;           // "7.8%" hvis tilgjengelig
  amount?: string;        // "NOK 12.4m"
  imageUrl?: string;
};

export type DocumentRow = {
  name: string;
  type: string;           // "Report" | "Legal" | ...
  date: string;           // ISO eller visningsformat
  size: string;           // "2.1 MB"
};

// API Response Types (basert på faktiske endepunkter)
export type ShareholderResponse = {
  id: string;
  name: string;
  shares?: number;
  sharesOwned?: number;    // Alternative field name
  value?: number;          // NOK value hvis tilgjengelig
  percentage?: number;
};

export type EmissionResponse = {
  id: string;
  name: string;
  city?: string;
  status: "PREVIEW" | "ACTIVE" | "COMPLETED" | "FINALIZED";
  startDate?: string;      // ISO format
  endDate?: string;        // ISO format
  totalValue?: number;     // NOK
  irr?: number;           // Percentage
  imageUrl?: string;
  subscriptions?: number;
};

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  level: number;          // 1-3 access level
  phone?: string;
};