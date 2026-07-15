import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">

      {/* Left */}

      <div>

        <h1 className="text-2xl font-bold text-slate-800">
          AI First CRM
        </h1>

        <p className="text-sm text-slate-500">
          Healthcare Professional Interaction Management
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            placeholder="Search..."
            className="w-72 rounded-xl border border-slate-300 pl-11 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* Notification */}

        <button className="relative h-11 w-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100">

          <Bell
            size={20}
            className="text-slate-600"
          />

          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        {/* Profile */}

        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            A
          </div>

          <div>

            <p className="font-semibold text-slate-800">
              Aadesh Jain
            </p>

            <p className="text-xs text-slate-500">
              Medical Representative
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}