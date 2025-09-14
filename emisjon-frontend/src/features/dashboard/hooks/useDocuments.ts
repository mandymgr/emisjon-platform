import { useEffect, useState } from "react";
import type { DocumentRow } from "./types";
import { fetchDocuments } from "./adapters";

type State = { data: DocumentRow[]; loading: boolean; error?: unknown };

export function useDocuments() {
  const [state, setState] = useState<State>({ data: [], loading: true });

  useEffect(() => {
    let alive = true;
    fetchDocuments()
      .then((data) => alive && setState({ data, loading: false }))
      .catch((error) => alive && setState({ data: [], error, loading: false }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}