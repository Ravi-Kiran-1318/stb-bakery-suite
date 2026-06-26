import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

const AnimatedNumber = ({ value }) => {
  const spring = useSpring(0, { duration: 1000, bounce: 0 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

const GrowthBadge = ({ value }) => {
  const isPositive = value > 0;
  const isZero = value === 0;
  
  if (isZero) return <span className="text-xs font-medium text-muted ml-2">No change</span>;
  
  return (
    <span className={`text-xs font-bold ml-2 px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isPositive ? '+' : ''}{value}% {isPositive ? '↑' : '↓'}
    </span>
  );
};

const RevenueTab = () => {
  const [range, setRange] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/orders/analytics?range=${range}`);
        setData(res.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [range]);

  if (loading && !data) return <div className="min-h-[50vh] flex items-center justify-center"><Loader fullScreen={false} /></div>;
  if (error) return <div className="min-h-[50vh] flex items-center justify-center"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!data) return null;

  const PIE_COLORS = {
    'Cake': '#F59E0B',
    'Bread': '#6B7280',
    'Pastry': '#10B981',
    'Bun': '#3B82F6',
    'Cookies': '#8B5CF6',
    'Default': '#EC4899'
  };

  return (
    <div className="space-y-8">
      {/* Time Range Pills */}
      <div className="flex gap-2">
        {['daily', 'weekly', 'monthly', 'annually'].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
              range === r 
                ? 'bg-accent text-white border border-accent shadow-sm' 
                : 'bg-white text-muted border border-border hover:border-accent hover:text-accent'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {data.summary.totalOrders === 0 ? (
        <div className="bg-white py-16 px-4 rounded-lg shadow-sm text-center border border-border mt-6">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-dark mb-2">No order data yet for this period.</h3>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: data.summary.totalRevenue, prefix: '₹', growth: data.summary.revenueGrowth },
          { title: 'Total Orders', value: data.summary.totalOrders, prefix: '', growth: data.summary.ordersGrowth },
          { title: 'Avg Order Value', value: data.summary.avgOrderValue, prefix: '₹' },
          { title: 'Top Item', textValue: data.summary.topItem.name, subValue: `${data.summary.topItem.unitsSold} sold` }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-5 rounded-lg border border-border shadow-sm flex flex-col justify-center"
          >
            <p className="text-sm font-semibold text-muted uppercase tracking-wider">{card.title}</p>
            <div className="mt-2 flex items-baseline">
              {card.textValue ? (
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-dark truncate">{card.textValue}</span>
                  <span className="text-xs text-muted mt-1">{card.subValue}</span>
                </div>
              ) : (
                <>
                  <span className="text-2xl font-bold text-dark font-display">
                    {card.prefix}<AnimatedNumber value={card.value} />
                  </span>
                  {card.growth !== undefined && <GrowthBadge value={card.growth} />}
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-dark mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} dot={{r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-dark mb-4">Orders Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ordersTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  cursor={{fill: '#F3F4F6'}}
                />
                <Bar dataKey="orders" fill="#111827" radius={[4, 4, 0, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-dark mb-4 text-center">Revenue by Category</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  isAnimationActive={true}
                >
                  {data.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.category] || PIE_COLORS['Default']} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <span className="text-xs font-semibold text-muted">By Category</span>
            </div>
          </div>
        </div>

        {/* Payment Doughnut */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-dark mb-4 text-center">Payment Methods</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Online', value: data.paymentSplit.online },
                    { name: 'Cash on Delivery', value: data.paymentSplit.cod }
                  ].filter(d => d.value > 0)}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  isAnimationActive={true}
                >
                  <Cell fill="#F59E0B" />
                  <Cell fill="#E5E7EB" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Peak Hours Heatmap */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-muted uppercase mb-4">Peak Hours</h3>
          {data.peakHours.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted italic text-sm">Not enough data yet.</div>
          ) : (
            <div className="grid grid-cols-7 gap-1 h-32">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] text-muted mb-1">{day[0]}</span>
                  {[
                    { label: 'M', hours: [6, 11] },
                    { label: 'A', hours: [12, 16] },
                    { label: 'E', hours: [17, 20] },
                    { label: 'N', hours: [21, 23, 0, 5] }
                  ].map((block, i) => {
                    const count = data.peakHours.filter(p => p.day === day && block.hours.includes(p.hour)).reduce((acc, p) => acc + p.orders, 0);
                    const opacity = Math.min(count / 5, 1); // 5+ orders is max intensity
                    return (
                      <div 
                        key={i} 
                        className="w-full h-4 rounded-sm transition-all"
                        style={{ backgroundColor: `rgba(245, 158, 11, ${opacity || 0.05})` }}
                        title={`${block.label}: ${count} orders`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery vs Pickup */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-muted uppercase mb-4">Delivery vs Pickup</h3>
          <div className="w-full h-4 bg-surface rounded-full overflow-hidden flex">
            {data.deliverySplit.delivery === 0 && data.deliverySplit.pickup === 0 ? (
              <div className="w-full h-full bg-gray-200"></div>
            ) : (
              <>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.deliverySplit.delivery / (data.deliverySplit.delivery + data.deliverySplit.pickup)) * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-accent"
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.deliverySplit.pickup / (data.deliverySplit.delivery + data.deliverySplit.pickup)) * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gray-300"
                />
              </>
            )}
          </div>
          <div className="flex justify-between mt-3 text-sm font-semibold">
            <span className="text-accent flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent"></div> Delivery ({data.deliverySplit.delivery})
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              Pickup ({data.deliverySplit.pickup}) <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </span>
          </div>
        </div>

        {/* New vs Returning */}
        <div className="bg-white p-5 rounded-lg border border-border shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-muted uppercase mb-4">Customer Types</h3>
          <div className="flex justify-between items-center px-4">
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-accent">
                <AnimatedNumber value={data.newCustomers} />
              </p>
              <p className="text-xs text-muted uppercase font-semibold mt-1">New</p>
            </div>
            <div className="h-12 w-px bg-border"></div>
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-dark">
                <AnimatedNumber value={data.returningCustomers} />
              </p>
              <p className="text-xs text-muted uppercase font-semibold mt-1">Returning</p>
            </div>
          </div>
        </div>

        </div>
      </>
      )}
    </div>
  );
};

export default RevenueTab;
