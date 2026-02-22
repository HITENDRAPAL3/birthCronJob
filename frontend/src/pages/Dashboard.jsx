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
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import WishSuggestionsModal from '../components/WishSuggestionsModal';
import celebrationGif from '../assets/giphy.gif';
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
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [wishBirthday, setWishBirthday] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const upcomingRes = await birthdayApi.getUpcoming(30);
      const upcoming = upcomingRes.data.data || [];
      setUpcomingBirthdays(upcoming.slice(0, 10)); // Show more since we have space
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
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-dark-300 mt-1">See what's happening with your birthdays</p>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Birthdays */}
        <div className="lg:col-span-2 card animate-slide-up h-full">
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

        {/* Big Add Birthday Button Card */}
        <div className="lg:col-span-1 animate-slide-up animate-delay-200">
          <Link
            to="/birthdays/add"
            className="group relative flex flex-col items-center justify-center h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* GIF Background */}
            <img
              src={celebrationGif}
              alt="Celebration"
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
            />
            {/* Improved Overlay for visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent group-hover:bg-dark-900/60 transition-colors" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center p-8">
              <div className="p-5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Plus size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white mb-3 drop-shadow-lg">
                Add New <br /> Birthday
              </h2>
            </div>

            {/* Hover Sparkle Effect */}
            <div className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles size={24} className="animate-pulse" />
            </div>
          </Link>
        </div>
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
                Name,Date,Email,Notes,Category<br />
                John Doe,1990-05-15,john@example.com,Gift: Books,Family<br />
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
