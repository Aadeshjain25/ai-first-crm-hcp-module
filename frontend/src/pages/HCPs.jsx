import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users } from "lucide-react";

import {
  fetchInteractions,
  selectAllInteractions,
  selectHistoryStatus,
} from "../store/slices/historySlice";

const SENTIMENT_STYLE = {
  Positive: "bg-green-100 text-green-700",
  Neutral: "bg-slate-100 text-slate-600",
  Negative: "bg-red-100 text-red-700",
};

// Derives an HCP directory from the same normalized interaction list used by
// History/Dashboard, rather than maintaining a separate hardcoded HCP table.
function buildHcpDirectory(interactions) {
  const byHcp = new Map();

  for (const item of interactions) {
    const name = item.hcp_name?.trim();
    if (!name) continue;

    const existing = byHcp.get(name) || {
      name,
      count: 0,
      lastInteractionDate: null,
      lastSentiment: null,
    };

    existing.count += 1;

    if (
      !existing.lastInteractionDate ||
      (item.interaction_date && item.interaction_date > existing.lastInteractionDate)
    ) {
      existing.lastInteractionDate = item.interaction_date || existing.lastInteractionDate;
      existing.lastSentiment = item.sentiment || existing.lastSentiment;
    }

    byHcp.set(name, existing);
  }

  return Array.from(byHcp.values()).sort((a, b) => b.count - a.count);
}

export default function HCPs() {
  const dispatch = useDispatch();
  const interactions = useSelector(selectAllInteractions);
  const status = useSelector(selectHistoryStatus);

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  const hcps = useMemo(() => buildHcpDirectory(interactions), [interactions]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h1 className="text-3xl font-bold mb-2">HCP Directory</h1>
      <p className="text-slate-500 mb-6">
        Healthcare professionals derived from your logged interactions.
      </p>

      {status === "loading" ? (
        <p className="text-slate-500">Loading...</p>
      ) : hcps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-slate-500">
          <Users size={32} className="text-slate-300" />
          <p>No HCPs yet. Log an interaction to build your directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hcps.map((hcp) => (
            <div
              key={hcp.name}
              className="rounded-2xl border border-slate-200 p-5 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {hcp.name}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    SENTIMENT_STYLE[hcp.lastSentiment] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {hcp.lastSentiment || "Unknown"}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {hcp.count} interaction{hcp.count === 1 ? "" : "s"} logged
              </p>

              {hcp.lastInteractionDate && (
                <p className="mt-1 text-sm text-slate-400">
                  Last seen {hcp.lastInteractionDate}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
