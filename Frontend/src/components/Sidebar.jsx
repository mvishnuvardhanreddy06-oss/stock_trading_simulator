import React from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  History,
  Home,
  UserCircle,
  Settings
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "market", label: "Markets", icon: BarChart3 },
  { id: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "history", label: "History", icon: History },
  { id: "profile", label: "Settings", icon: Settings },
  { id: "account", label: "Profile", icon: UserCircle }
];

function Sidebar({ activeView, onChangeView }) {
  return (
    <aside className="sidebar">
      <div className="brand-mark">SK</div>
      <nav aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={activeView === item.id ? "sidebar-link active" : "sidebar-link"}
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
