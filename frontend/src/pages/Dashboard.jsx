import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { birthdayApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Cake, 
  CalendarDays, 
  Bell, 
  Plus, 
  ChevronRight,
  PartyPopper,
  Clock,
  Users,
  Download,
  Upload,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import WishSuggestionsModal from '../components/WishSuggestionsModal';
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

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, today: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [wishBirthday, setWishBirthday] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [upcomingRes, allRes, analyticsRes] = await Promise.all([
        birthdayApi.getUpcoming(30),
        birthdayApi.getAll(),
        birthdayApi.getAnalytics(),
      ]);

      const upcoming = upcomingRes.data.data || [];
      const all = allRes.data.data || [];
      const analyticsData = analyticsRes.data.data;

      setUpcomingBirthdays(upcoming.slice(0, 5));
      setAnalytics(analyticsData);

      // Calculate stats
      const today = new Date();
      const thisMonth = all.filter(b => {
        const bday = new Date(b.upcomingBirthday);
        return bday.getMonth() === today.getMonth();
      });
      const todayBirthdays = upcoming.filter(b => b.daysUntilBirthday === 0);

      setStats({
        total: all.length,
        thisMonth: thisMonth.length,
        today: todayBirthdays.length,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportIcal = async () => {
    try {
      const response = await birthdayApi.exportIcal();
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'birthdays.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Calendar exported successfully!');
    } catch (error) {
      toast.error('Failed to export calendar');
      console.error(error);
    }
  };

  const getDaysLabel = (days) => {
    if (days === 0) return { text: 'Today!', className: 'text-accent-400 bg-accent-500/20' };
    if (days === 1) return { text: 'Tomorrow', className: 'text-primary-400 bg-primary-500/20' };
    return { text: `${days} days`, className: 'text-dark-200 bg-dark-600' };
  };

  // Prepare chart data
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-dark-300 mt-1">Here's what's happening with your birthdays</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary">
            <Upload size={18} />
            Import
          </button>
          <button onClick={handleExportIcal} className="btn-secondary">
            <Download size={18} />
            Export
          </button>
          <Link to="/birthdays/add" className="btn-primary">
            <Plus size={20} />
            Add Birthday
          </Link>
        </div>
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

      {/* Upcoming Birthdays */}
      <div className="card animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Clock className="text-primary-400" size={20} />
            </div>
            <h2 className="text-xl font-display font-semibold text-white">Upcoming Birthdays</h2>
          </div>
          <Link 
            to="/birthdays" 
            className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            View all
            <ChevronRight size={16} />
          </Link>
        </div>

        {upcomingBirthdays.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-dark-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Cake className="text-dark-300" size={32} />
            </div>
            <h3 className="text-lg font-medium text-dark-100 mb-2">No upcoming birthdays</h3>
            <p className="text-dark-400 mb-4">Start by adding your friends' birthdays</p>
            <Link to="/birthdays/add" className="btn-primary">
              <Plus size={18} />
              Add Birthday
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBirthdays.map((birthday, index) => {
              const daysInfo = getDaysLabel(birthday.daysUntilBirthday);
              return (
                <div
                  key={birthday.id}
                  className="flex items-center justify-between p-4 bg-dark-600/50 rounded-xl hover:bg-dark-600 transition-colors"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                      style={{ 
                        background: birthday.categoryColor 
                          ? `linear-gradient(135deg, ${birthday.categoryColor}, ${birthday.categoryColor}99)`
                          : 'linear-gradient(135deg, #6366f1, #ec4899)'
                      }}
                    >
                      {birthday.friendName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{birthday.friendName}</h3>
                        {birthday.categoryName && (
                          <span 
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${birthday.categoryColor}20`,
                              color: birthday.categoryColor
                            }}
                          >
                            {birthday.categoryName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-dark-300">
                        {format(new Date(birthday.upcomingBirthday), 'MMMM d')} • Turning {birthday.age + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWishBirthday(birthday)}
                      className="p-2 rounded-lg text-dark-300 hover:text-accent-400 hover:bg-accent-500/10 transition-colors"
                      title="Get wish suggestions"
                    >
                      <Sparkles size={18} />
                    </button>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${daysInfo.className}`}>
                      {daysInfo.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/birthdays/add" className="card-hover flex items-center gap-4 group">
          <div className="p-3 bg-primary-500/20 rounded-xl group-hover:bg-primary-500/30 transition-colors">
            <Plus className="text-primary-400" size={24} />
          </div>
          <div>
            <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors">
              Add New Birthday
            </h3>
            <p className="text-sm text-dark-300">Track another friend's special day</p>
          </div>
          <ChevronRight className="ml-auto text-dark-400 group-hover:text-primary-400 transition-colors" size={20} />
        </Link>

        <Link to="/settings" className="card-hover flex items-center gap-4 group">
          <div className="p-3 bg-accent-500/20 rounded-xl group-hover:bg-accent-500/30 transition-colors">
            <Bell className="text-accent-400" size={24} />
          </div>
          <div>
            <h3 className="font-medium text-white group-hover:text-accent-400 transition-colors">
              Notification Settings
            </h3>
            <p className="text-sm text-dark-300">Configure your email reminders</p>
          </div>
          <ChevronRight className="ml-auto text-dark-400 group-hover:text-accent-400 transition-colors" size={20} />
        </Link>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} onSuccess={fetchDashboardData} />
      )}

      {/* Wish Suggestions Modal */}
      {wishBirthday && (
        <WishSuggestionsModal
          birthday={wishBirthday}
          onClose={() => setWishBirthday(null)}
        />
      )}
    </div>
  );
};

// Import Modal Component
const ImportModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a CSV file');
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setImporting(true);
    try {
      const response = await birthdayApi.importCsv(file);
      setResult(response.data.data);
      if (response.data.data.importedCount > 0) {
        toast.success(`Imported ${response.data.data.importedCount} birthdays!`);
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to import file');
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-700 rounded-2xl p-6 max-w-lg w-full animate-scale-in">
        <h3 className="text-xl font-semibold text-white mb-2">Import Birthdays from CSV</h3>
        <p className="text-dark-300 mb-6">
          Upload a CSV file with columns: Name, Date, Email (optional), Notes (optional), Category (optional)
        </p>

        {!result ? (
          <>
            <div className="border-2 border-dashed border-dark-500 rounded-xl p-8 text-center mb-6">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="mx-auto text-dark-400 mb-3" size={40} />
                <p className="text-dark-200 font-medium">
                  {file ? file.name : 'Click to select CSV file'}
                </p>
                <p className="text-dark-400 text-sm mt-1">or drag and drop</p>
              </label>
            </div>

            <div className="bg-dark-600/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-dark-300 mb-2">Example CSV format:</p>
              <code className="text-xs text-primary-400 block overflow-x-auto">
                Name,Date,Email,Notes,Category<br/>
                John Doe,1990-05-15,john@example.com,Gift: Books,Family<br/>
                Jane Smith,1985-12-25,,Best friend,Friends
              </code>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="btn-primary"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{result.importedCount}</div>
                <div className="text-green-300">birthdays imported successfully</div>
              </div>
              
              {result.errors?.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 font-medium mb-2">{result.errorCount} errors:</p>
                  <ul className="text-sm text-red-300 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={onClose} className="btn-primary">
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
