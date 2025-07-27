import React, { useState } from "react";
import { PlusCircle, Edit3, Trash2, Video } from "lucide-react";
import { NavLink } from "react-router";

export default function Admin() {
  const [active, setActive] = useState("");

  const adminOptions = [
    {
      id: "create",
      title: "Create Problem",
      desc: "Add a new coding problem",
      icon: PlusCircle,
      color: "success",
      route: "/admin/create",
    },
    {
      id: "update",
      title: "Update Problem",
      desc: "Edit existing problems",
      icon: Edit3,
      color: "warning",
      route: "/admin/update",
    },
    {
      id: "delete",
      title: "Delete Problem",
      desc: "Remove problems",
      icon: Trash2,
      color: "error",
      route: "/admin/delete",
    },
    {
      id: "video",
      title: "Video Resources",
      desc: "Upload/manage tutorials",
      icon: Video,
      color: "info",
      route: "/admin/video",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-300 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-base-content/60 mt-2">
            Efficiently manage all coding content
          </p>
        </header>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-[200px] mt-3">
          {adminOptions.map(({ id, title, desc, icon: Icon, color, route }) => {
            const isActive = active === id;
            return (
              <NavLink
                key={id}
                to={route}
                onClick={() => setActive(id)}
                className={`relative block p-6 bg-base-100 rounded-2xl shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-${color}/50
                  ${
                    isActive
                      ? `border-2 border-${color}`
                      : `border border-transparent`
                  }`}
              >
                <div
                  className={`absolute -top-5 right-5 p-3 bg-${color}/20 rounded-full`}
                >
                  <Icon size={24} className={`text-${color}`} />
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-semibold text-base-content">
                    {title}
                  </h2>
                  <p className="text-sm text-base-content/70 mt-1">{desc}</p>
                </div>
                <span
                  className={`mt-6 p-2 inline-block btn btn-sm btn-outline btn-${color}`}
                >
                  Go
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
