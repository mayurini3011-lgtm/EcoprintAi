import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";

/**
 * Ensures the demo dataset is seeded exactly once.
 * The seed mutation is idempotent, so double-invocation (StrictMode) is safe.
 */
export function useEnsureDemoData() {
  const status = useQuery(api.admin.demoStatus);
  const seed = useMutation(api.seed.seedDemoData);
  const attempted = useRef(false);

  useEffect(() => {
    if (status && !status.seeded && !attempted.current) {
      attempted.current = true;
      void seed();
    }
  }, [status, seed]);

  return status;
}
