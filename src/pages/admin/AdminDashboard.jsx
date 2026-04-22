import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 7000 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 8000 },
  { month: "Jul", revenue: 9000 },
  { month: "Aug", revenue: 7500 },
  { month: "Sep", revenue: 8200 },
  { month: "Oct", revenue: 9500 },
  { month: "Nov", revenue: 11000 },
  { month: "Dec", revenue: 13000 }
];

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard-container">

      {/* ===== CARDS ===== */}
      <div className="admin-cards">
        <div className="admin-card">
          <h4>Total Earnings</h4>
          <h2>₦334,945</h2>
        </div>

        <div className="admin-card orange">
          <h4>Total Orders</h4>
          <h2>2,802</h2>
        </div>

        <div className="admin-card purple">
          <h4>Customers</h4>
          <h2>4,945</h2>
        </div>

        <div className="admin-card blue">
          <h4>Balance</h4>
          <h2>₦4,945</h2>
        </div>
      </div>

      {/* ===== MODERN CHART ===== */}
      <div className="admin-chart-card">
        <h4>Revenue Overview (Jan - Dec)</h4>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>

            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff6b00" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ff6b00"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
