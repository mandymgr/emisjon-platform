import { useEffect, useState } from "react";
import type { PortfolioSummary } from "./types";
import { fetchPortfolio } from "./adapters";

type State = { data?: PortfolioSummary; loading: boolean; error?: unknown };

export function usePortfolio() {
  const [state, setState] = useState<State>({ loading: true });

  useEffect(() => {
    let alive = true;
    fetchPortfolio()
      .then((data) => alive && setState({ data, loading: false }))
      .catch((error) => alive && setState({ error, loading: false }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}