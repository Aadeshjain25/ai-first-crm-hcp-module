import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>

          <h2 className="text-3xl font-bold mt-2">{value}</h2>

          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <ArrowUpRight size={15} />
            {subtitle}
          </p>
        </div>

        <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center">
          <Icon className="text-blue-600" size={28} />
        </div>
      </div>
    </div>
  );
}