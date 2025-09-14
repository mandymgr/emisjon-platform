import { useEffect, useState } from "react";
import type { Project } from "./types";
import { fetchProjects } from "./adapters";

type State = { data: Project[]; loading: boolean; error?: unknown };

export function useProjects() {
  const [state, setState] = useState<State>({ data: [], loading: true });

  useEffect(() => {
    let alive = true;
    fetchProjects()
      .then((data) => alive && setState({ data, loading: false }))
      .catch((error) => alive && setState({ data: [], error, loading: false }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}