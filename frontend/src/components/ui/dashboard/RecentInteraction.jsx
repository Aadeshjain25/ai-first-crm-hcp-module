const SENTIMENT_STYLE = {
  Positive: "bg-green-100 text-green-700",
  Neutral: "bg-slate-100 text-slate-600",
  Negative: "bg-red-100 text-red-700",
};

export default function RecentInteractions({ interactions = [] }) {
  const recent = interactions.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold mb-5">Recent Interactions</h2>

      {recent.length === 0 ? (
        <p className="text-sm text-slate-500">
          No interactions logged yet. Head to Log Interaction to add one.
        </p>
      ) : (
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left text-slate-500">
              <th className="pb-3">Doctor</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Product</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Sentiment</th>
            </tr>
          </thead>

          <tbody>
            {recent.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-0 hover:bg-slate-50"
              >
                <td className="py-4 font-medium">{item.hcp_name || "—"}</td>
                <td>{item.interaction_type || "—"}</td>
                <td>{item.products_discussed || "—"}</td>
                <td>{item.interaction_date || "—"}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      SENTIMENT_STYLE[item.sentiment] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.sentiment || "Unknown"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
