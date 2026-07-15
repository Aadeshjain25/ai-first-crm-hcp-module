import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchInteractions,
  selectAllInteractions,
  selectHistoryError,
  selectHistoryStatus,
} from "../store/slices/historySlice";

export default function History() {
  const dispatch = useDispatch();
  const interactions = useSelector(selectAllInteractions);
  const status = useSelector(selectHistoryStatus);
  const error = useSelector(selectHistoryError);

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h1 className="text-3xl font-bold mb-6">
        Interaction History
      </h1>

      {status === "loading" ? (
        <p className="text-slate-500">Loading...</p>
      ) : status === "failed" ? (
        <p className="text-red-600">{error}</p>
      ) : interactions.length === 0 ? (
        <p className="text-slate-500">No interactions found.</p>
      ) : (
        <div className="space-y-4">
          {interactions.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {item.hcp_name}
                  </h2>

                  <p className="text-slate-500">
                    {item.interaction_type}
                  </p>
                </div>

                <div className="text-right">
                  <p>{item.interaction_date}</p>

                  <p className="text-sm text-slate-500">
                    {item.interaction_time}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p>
                  <span className="font-semibold">
                    Discussion:
                  </span>{" "}
                  {item.discussion || "—"}
                </p>

                <p className="mt-2">
                  <span className="font-semibold">
                    Outcome:
                  </span>{" "}
                  {item.outcome || "—"}
                </p>

                <p className="mt-2">
                  <span className="font-semibold">
                    Follow-up:
                  </span>{" "}
                  {item.follow_up || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
