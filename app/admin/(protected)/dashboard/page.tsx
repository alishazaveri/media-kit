import { connectDB } from "@/db";
import User from "@/db/models/user";
import Subscription from "@/db/models/subscription";
import Invoice from "@/db/models/invoice";

async function getStats() {
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeSubscriptions,
    trialUsers,
    revenueAgg,
    recentUsers,
    recentInvoices,
  ] = await Promise.all([
    User.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    User.countDocuments({ trial_ends_at: { $gt: now } }),
    Invoice.aggregate([
      { $match: { status: "paid", created_at: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } },
    ]),
    User.find()
      .sort({ created_at: -1 })
      .limit(8)
      .select("name email username created_at trial_ends_at")
      .lean(),
    Invoice.find({ status: "paid" })
      .sort({ created_at: -1 })
      .limit(8)
      .select("customer_name plan_name total_amount created_at invoice_number")
      .lean(),
  ]);

  return {
    totalUsers,
    activeSubscriptions,
    trialUsers,
    revenueThisMonth: revenueAgg[0]?.total ?? 0,
    recentUsers,
    recentInvoices,
  };
}

function fmtPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function timeAgo(date: Date | string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default async function AdminDashboardPage() {
  const { totalUsers, activeSubscriptions, trialUsers, revenueThisMonth, recentUsers, recentInvoices } =
    await getStats();

  const stats = [
    { label: "Total creators", value: totalUsers.toLocaleString() },
    { label: "Active subscribers", value: activeSubscriptions.toLocaleString() },
    { label: "On trial", value: trialUsers.toLocaleString() },
    { label: "Revenue this month", value: fmtPaise(revenueThisMonth) },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of all activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{s.label}</p>
            <p className="text-3xl font-black text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Two-column tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent signups */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">Recent signups</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentUsers as any[]).map((u) => (
              <div key={u._id.toString()} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name || u.username}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-4">{timeAgo(u.created_at)}</span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No signups yet</p>
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">Recent payments</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentInvoices as any[]).map((inv) => (
              <div key={inv._id.toString()} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{inv.customer_name}</p>
                  <p className="text-xs text-gray-400">{inv.plan_name}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-black text-gray-900">{fmtPaise(inv.total_amount)}</p>
                  <p className="text-xs text-gray-400">{timeAgo(inv.created_at)}</p>
                </div>
              </div>
            ))}
            {recentInvoices.length === 0 && (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No payments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
