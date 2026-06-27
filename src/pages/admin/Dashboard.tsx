import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminDashboard, useGetSalesData } from "@/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, ShoppingBag, Users, Pill, FileText, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminDashboard();
  const { data: salesData, isLoading: salesLoading } = useGetSalesData();

  if (statsLoading || salesLoading || !stats || !salesData) {
    return (
      <AdminLayout title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardHeader className="h-24"></CardHeader></Card>
          ))}
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, trend: stats.revenueGrowth, trendSuffix: "vs last month", color: "text-green-600" },
    { title: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag, trend: stats.ordersGrowth, trendSuffix: "vs last month", color: "text-blue-600" },
    { title: "Active Users", value: stats.activeUsers.toString(), icon: Users, color: "text-purple-600" },
    { title: "Medicines", value: stats.totalMedicines.toString(), icon: Pill, color: "text-indigo-600" },
    { title: "Pending Rx", value: stats.pendingPrescriptions.toString(), icon: FileText, color: "text-orange-600" },
    { title: "Total Customers", value: stats.totalCustomers.toString(), icon: Activity, color: "text-rose-600" },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  {stat.trend !== undefined && (
                    <p className={`text-xs mt-2 font-medium ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend >= 0 ? '+' : ''}{stat.trend}% {stat.trendSuffix}
                    </p>
                  )}
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gray-50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-muted-foreground uppercase tracking-wider">Revenue Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={value => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 4, fill: '#1d4ed8', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-muted-foreground uppercase tracking-wider">Orders Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
