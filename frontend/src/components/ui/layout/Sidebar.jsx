import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardPenLine,
  Users,
  History,
  Settings,
  Sparkles,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Log Interaction",
    path: "/log-interaction",
    icon: ClipboardPenLine,
  },
  {
    name: "HCP Directory",
    path: "/hcps",
    icon: Users,
  },
  {
    name: "History",
    path: "/history",
    icon: History,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-white border-r border-slate-200 flex flex-col">

      {/* Logo */}

      <div className="h-24 border-b border-slate-200 flex items-center px-8">

        <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
          <Sparkles size={22} />
        </div>

        <div className="ml-4">

          <h1 className="text-xl font-bold text-slate-800">
            AI First CRM
          </h1>

          <p className="text-xs text-slate-500">
            Healthcare Platform
          </p>

        </div>

      </div>

      {/* Menu */}

      <nav className="flex-1 px-5 py-8">

        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4">
          Navigation
        </p>

        <div className="space-y-2">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={20} />

                <span className="font-medium">
                  {item.name}
                </span>
              </NavLink>
            );
          })}

        </div>

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-200 p-5">

        <button className="flex items-center gap-4 w-full rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100 transition">

          <Settings size={20} />

          <span className="font-medium">
            Settings
          </span>

        </button>

      </div>

    </aside>
  );
}