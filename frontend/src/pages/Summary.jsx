import { useState, useEffect } from 'react';
import { birthdayApi } from '../services/api';
import {
    Users,
    CalendarDays,
    PartyPopper,
    Clock,
    BarChart3,
    Cake
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

const Summary = () => {
    const [stats, setStats] = useState({ total: 0, thisMonth: 0, today: 0 });
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummaryData();
    }, []);

    const fetchSummaryData = async () => {
        try {
            const [allRes, analyticsRes] = await Promise.all([
                birthdayApi.getAll(),
                birthdayApi.getAnalytics(),
            ]);

            const all = allRes.data.data || [];
            const analyticsData = analyticsRes.data.data;

            setAnalytics(analyticsData);

            // Calculate stats
            const today = new Date();
            const thisMonth = all.filter(b => {
                const bday = new Date(b.upcomingBirthday);
                return bday.getMonth() === today.getMonth();
            });
            const todayBirthdays = all.filter(b => {
                const bday = new Date(b.upcomingBirthday);
                return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
            });

            setStats({
                total: all.length,
                thisMonth: thisMonth.length,
                today: todayBirthdays.length,
            });
        } catch (error) {
            toast.error('Failed to load summary data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const monthlyData = analytics?.monthlyDistribution
        ? Object.entries(analytics.monthlyDistribution).map(([name, value]) => ({ name, value }))
        : [];

    const categoryData = analytics?.categoryDistribution
        ? Object.entries(analytics.categoryDistribution)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }))
        : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Birthday Summary</h1>
                <p className="text-dark-300 mt-1">A detailed overview of your birthday collection</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card animate-slide-up">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-500/20 rounded-xl">
                            <Users className="text-primary-400" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.total}</p>
                            <p className="text-dark-300 text-sm">Total Birthdays</p>
                        </div>
                    </div>
                </div>

                <div className="card animate-slide-up animate-delay-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent-500/20 rounded-xl">
                            <CalendarDays className="text-accent-400" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.thisMonth}</p>
                            <p className="text-dark-300 text-sm">This Month</p>
                        </div>
                    </div>
                </div>

                <div className="card animate-slide-up animate-delay-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <PartyPopper className="text-green-400" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.today}</p>
                            <p className="text-dark-300 text-sm">Today</p>
                        </div>
                    </div>
                </div>

                <div className="card animate-slide-up animate-delay-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                            <Clock className="text-yellow-400" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{analytics?.upcomingIn7Days || 0}</p>
                            <p className="text-dark-300 text-sm">Next 7 Days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Distribution Chart */}
                <div className="card animate-slide-up animate-delay-400">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <BarChart3 className="text-primary-400" size={20} />
                        </div>
                        <h2 className="text-lg font-display font-semibold text-white">Birthdays by Month</h2>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#373a40" />
                                <XAxis dataKey="name" stroke="#909296" fontSize={12} />
                                <YAxis stroke="#909296" fontSize={12} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#25262b',
                                        border: '1px solid #373a40',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#c1c2c5' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution Chart */}
                <div className="card animate-slide-up animate-delay-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-accent-500/20 rounded-lg">
                            <Cake className="text-accent-400" size={20} />
                        </div>
                        <h2 className="text-lg font-display font-semibold text-white">Birthdays by Category</h2>
                    </div>
                    <div className="h-64">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#25262b',
                                            border: '1px solid #373a40',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ color: '#c1c2c5' }}
                                        formatter={(value) => <span style={{ color: '#c1c2c5' }}>{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-dark-400">
                                No category data available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Summary;
