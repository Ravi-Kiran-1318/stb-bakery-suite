import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

const AnimatedNumber = ({ value }) => {
  const safeValue = isNaN(value) || value === null ? 0 : Number(value);
  const spring = useSpring(0, { duration: 1000, bounce: 0 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(safeValue);
  }, [safeValue, spring]);

  return <motion.span>{display}</motion.span>;
};

const GrowthBadge = ({ value }) => {
  const safeValue = isNaN(value) || value === null ? 0 : Number(value);
  const isPositive = safeValue > 0;
  const isZero = safeValue === 0;
  
  if (isZero) return <span className="text-xs font-medium text-gray-400 ml-2 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">0%</span>;
  
  return (
    <span className={`text-xs font-bold ml-2 px-2 py-0.5 rounded-full border ${isPositive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
      {isPositive ? '+' : ''}{safeValue}% {isPositive ? '↑' : '↓'}
    </span>
  );
};

const EmptyChartState = ({ message = "Not enough data yet" }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10 rounded-lg">
    <div className="text-center px-4 py-2 bg-white shadow-sm border border-gray-100 rounded-full text-sm font-semibold text-gray-500">
      {message}
    </div>
  </div>
);

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
    'Bread': '#F59E0B',
    'Cake': '#EC4899',
    'Pastry': '#3B82F6',
    'Cookies': '#10B981',
    'Other': '#8B5CF6',
    'Bun': '#F59E0B',
    'Default': '#9CA3AF'
  };

  const hasPaymentData = data.paymentSplit.online > 0 || data.paymentSplit.cod > 0;
  const hasCategoryData = data.categoryBreakdown.some(c => c.revenue > 0);

  return (
    <div className="space-y-6">
      {/* Time Range Pills */}
      <div className="flex gap-2">
        {['daily', 'weekly', 'monthly', 'annually'].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all duration-200 border ${
              range === r 
                ? 'bg-indigo-600 text-white shadow-sm border-indigo-600' 
                : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-slate-200 shadow-sm'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: data.summary.totalRevenue, prefix: '₹', growth: data.summary.revenueGrowth, icon: '💰' },
          { title: 'Total Orders', value: data.summary.totalOrders, prefix: '', growth: data.summary.ordersGrowth, icon: '📦' },
          { title: 'Avg Order Value', value: data.summary.avgOrderValue, prefix: '₹', icon: '📈' },
          { title: 'Top Item', textValue: data.summary.topItem.name, subValue: `${data.summary.topItem.unitsSold} sold`, icon: '🏆' }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
              <span className="text-xl opacity-90">{card.icon}</span>
            </div>
            
            <div className="mt-1 flex items-baseline">
              {card.textValue ? (
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-800 truncate max-w-[200px]" title={card.textValue}>
                    {card.textValue}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 font-medium">{card.subValue}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">
                    {card.prefix}<AnimatedNumber value={card.value} />
                  </span>
                  {card.growth !== undefined && <GrowthBadge value={card.growth} />}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 relative">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            Revenue Trend
          </h3>
          <div className="h-72">
            {data.revenueTimeSeries.every(d => d.revenue === 0) && <EmptyChartState />}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTimeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val >= 100000 ? (val/100000).toFixed(1) + 'L' : val.toLocaleString()}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '12px 16px', fontWeight: 'bold'}}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" isAnimationActive={true} activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            By Category
          </h3>
          <div className="h-72 relative flex justify-center items-center">
            {!hasCategoryData && <EmptyChartState />}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  isAnimationActive={true}
                >
                  {data.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.category] || PIE_COLORS['Default']} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Total Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[80px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
              <span className="text-sm font-black text-slate-800">₹{Math.round(data.summary.totalRevenue).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Payment Doughnut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Payment Methods</h3>
          <div className="h-48 relative">
            {!hasPaymentData && <EmptyChartState />}
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
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  isAnimationActive={true}
                >
                  <Cell fill="#10B981" stroke="transparent" />
                  <Cell fill="#6366F1" stroke="transparent" />
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery vs Pickup */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Delivery vs Pickup</h3>
          <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {data.deliverySplit.delivery === 0 && data.deliverySplit.pickup === 0 ? (
              <div className="w-full h-full bg-slate-100"></div>
            ) : (
              <>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.deliverySplit.delivery / (data.deliverySplit.delivery + data.deliverySplit.pickup)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-indigo-500 relative"
                  title={`Delivery: ${data.deliverySplit.delivery}`}
                >
                  {data.deliverySplit.delivery > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                      {Math.round((data.deliverySplit.delivery / (data.deliverySplit.delivery + data.deliverySplit.pickup)) * 100)}%
                    </span>
                  )}
                </motion.div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.deliverySplit.pickup / (data.deliverySplit.delivery + data.deliverySplit.pickup)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-slate-300 relative"
                  title={`Pickup: ${data.deliverySplit.pickup}`}
                >
                  {data.deliverySplit.pickup > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                      {Math.round((data.deliverySplit.pickup / (data.deliverySplit.delivery + data.deliverySplit.pickup)) * 100)}%
                    </span>
                  )}
                </motion.div>
              </>
            )}
          </div>
          <div className="flex justify-between mt-4 text-xs font-bold">
            <span className="text-indigo-600 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> 
              Delivery ({data.deliverySplit.delivery})
            </span>
            <span className="text-slate-600 flex items-center gap-1.5">
              Pickup ({data.deliverySplit.pickup}) 
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            </span>
          </div>
        </div>

        {/* New vs Returning */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Customer Types</h3>
          <div className="flex justify-center items-center gap-8">
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              </div>
              <p className="text-2xl font-black text-slate-800">
                <AnimatedNumber value={data.newCustomers} />
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">New</p>
            </div>
            
            <div className="h-12 w-px bg-slate-200"></div>
            
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <p className="text-2xl font-black text-slate-800">
                <AnimatedNumber value={data.returningCustomers} />
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Returning</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RevenueTab;
