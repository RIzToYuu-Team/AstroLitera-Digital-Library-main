import React from "react";
import "./AdminDashboardPage.css";

const dashboardSummary = {
  totalBooks: 50,
  totalUsers: 36,
  pendingAccessRequests: 36,
  totalActivities: 100,
};

const stats = [
  {
    title: "Total Buku",
    value: dashboardSummary.totalBooks,
    description: "Buku tersedia dalam sistem",
    icon: "/src/assets/book-icon.png",
    iconClass: "is-blue",
  },
  {
    title: "Total Pengguna",
    value: dashboardSummary.totalUsers,
    description: "Pengguna aktif",
    icon: "/src/assets/user-icon.png",
    iconClass: "is-green",
  },
  {
    title: "Permintaan Akses Baca",
    value: dashboardSummary.pendingAccessRequests,
    description: "Permintaan akses yang perlu ditinjau",
    icon: "/src/assets/access-icon.png",
    iconClass: "is-purple",
  },
  {
    title: "Total Aktivitas",
    value: dashboardSummary.totalActivities,
    description: "Seluruh aktivitas pengguna",
    icon: "/src/assets/activity-icon.png",
    iconClass: "is-violet",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard-page">

      {/*Header*/}
      <header className="admin-dashboard-topbar">
        <div className="admin-dashboard-brand">
          <div className="admin-dashboard-brand__logo" />
          <span>AstroLitera</span>
        </div>
        <button
          className="admin-dashboard-menu-btn"
          type="button"
          aria-label="Buka menu">
          <span />
          <span />
          <span />
        </button>
      </header>


      <main className="admin-dashboard-content">
        <section className="admin-dashboard-stats">
          {stats.slice(0, 3).map((item) => (
            <DashboardStatCard key={item.title} item={item} />
          ))}
        </section>

        <section className="admin-dashboard-bottom">
          <div className="admin-dashboard-chart-card">
            <div className="admin-dashboard-card-title">Statistik Aktivitas</div>

            <div className="admin-dashboard-chart-placeholder">
              
              <span>statistik</span>
            </div>
          </div>

          <DashboardStatCard item={stats[3]} variant="small" />
        </section>
      </main>
    </div>
  );
}

function DashboardStatCard({ item, variant = "" }) {
  return (
    <article className={`admin-dashboard-stat-card ${variant}`}>
      <h2>{item.title}</h2>

      <div className="admin-dashboard-stat-main">
        <div className={`admin-dashboard-icon-box ${item.iconClass}`}>
          <img
            src={item.icon}
            alt=""
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        <strong>{item.value}</strong>
      </div>

      <p>{item.description}</p>
    </article>
  );
}
