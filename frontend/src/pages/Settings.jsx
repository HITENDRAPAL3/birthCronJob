import { useState, useEffect } from 'react';
import { settingsApi, categoryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  Clock, 
  FileText,
  Save,
  Info,
  Plus,
  Trash2,
  Tag,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const AVAILABLE_DAYS = [0, 1, 2, 3, 5, 7, 14, 21, 30];

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [settings, setSettings] = useState({
    notificationDays: [7, 3, 1],
    emailEnabled: true,
    emailTemplate: '',
    notificationTime: '08:00',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        settingsApi.get(),
        categoryApi.getAll(),
      ]);
      setSettings(settingsRes.data.data);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const toggleNotificationDay = (day) => {
    setSettings(prev => {
      const days = prev.notificationDays || [];
      if (days.includes(day)) {
        return { ...prev, notificationDays: days.filter(d => d !== day) };
      } else {
        return { ...prev, notificationDays: [...days, day].sort((a, b) => b - a) };
      }
    });
  };

  const getTimeLabel = (timeStr) => {
    if (!timeStr) return '8:00 AM';
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
      return '8:00 AM';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsApi.update(settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await categoryApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
        <p className="text-dark-300 mt-1">Configure your notification preferences and categories</p>
      </div>

      <div className="space-y-6">
        {/* Categories Section */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-500/20 rounded-lg">
                <Tag className="text-accent-400" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-white">Categories</h2>
            </div>
            <button
              onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
              className="btn-secondary text-sm"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="p-3 rounded-lg bg-dark-600/50 border border-dark-500 group relative"
              >
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: cat.color }}
                />
                <p className="text-sm text-center text-dark-100 font-medium">{cat.name}</p>
                <p className="text-xs text-center text-dark-400">{cat.birthdayCount} birthdays</p>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}
                    className="p-1 rounded bg-dark-500 text-dark-200 hover:text-white"
                  >
                    <FileText size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 rounded bg-dark-500 text-dark-200 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Notifications Toggle */}
          <div className="card animate-slide-up animate-delay-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <Bell className="text-primary-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email Notifications</h3>
                  <p className="text-sm text-dark-300">
                    Receive birthday reminders via email
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, emailEnabled: !prev.emailEnabled }))}
                className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                  settings.emailEnabled ? 'bg-primary-500' : 'bg-dark-500'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.emailEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notification Settings (only show if enabled) */}
          {settings.emailEnabled && (
            <>
              {/* Multiple Notification Days */}
              <div className="card animate-slide-up animate-delay-200">
                <label className="label flex items-center gap-2">
                  <Clock size={18} className="text-primary-400" />
                  Notification Days
                </label>
                <p className="text-sm text-dark-400 mb-4">
                  Select which days before a birthday you want to receive reminders.
                </p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_DAYS.map(day => {
                    const isSelected = settings.notificationDays?.includes(day);
                    const label = day === 0 ? 'Same day' : day === 1 ? '1 day' : `${day} days`;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleNotificationDay(day)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                            : 'border-dark-500 text-dark-300 hover:border-dark-400'
                        }`}
                      >
                        {isSelected && <Check size={16} />}
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-dark-400 mt-3">
                  {settings.notificationDays?.length > 0 
                    ? `You'll receive notifications ${settings.notificationDays.sort((a,b) => b-a).map(d => d === 0 ? 'on the day' : d === 1 ? '1 day before' : `${d} days before`).join(', ')}.`
                    : 'No notification days selected.'}
                </p>
              </div>

              {/* Notification Time */}
              <div className="card animate-slide-up animate-delay-300">
                <label className="label flex items-center gap-2">
                  <Clock size={18} className="text-primary-400" />
                  Notification Time
                </label>
                <p className="text-sm text-dark-400 mb-4">
                  Choose what time of day you'd like to receive your birthday reminders.
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="time"
                    name="notificationTime"
                    value={settings.notificationTime || '08:00'}
                    onChange={handleChange}
                    className="input w-40 text-center"
                  />
                  <span className="text-dark-300 text-sm">
                    {getTimeLabel(settings.notificationTime)}
                  </span>
                </div>
                <p className="text-xs text-dark-500 mt-2">
                  Notifications are sent at the start of the selected hour.
                </p>
              </div>

              {/* Email Template */}
              <div className="card animate-slide-up animate-delay-400">
                <label className="label flex items-center gap-2">
                  <FileText size={18} className="text-primary-400" />
                  Email Template
                </label>
                <p className="text-sm text-dark-400 mb-4">
                  Customize the message in your reminder emails. Use placeholders:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-dark-600 rounded text-xs text-primary-400 font-mono">
                    {'{friendName}'}
                  </span>
                  <span className="px-2 py-1 bg-dark-600 rounded text-xs text-primary-400 font-mono">
                    {'{birthDate}'}
                  </span>
                  <span className="px-2 py-1 bg-dark-600 rounded text-xs text-primary-400 font-mono">
                    {'{age}'}
                  </span>
                  <span className="px-2 py-1 bg-dark-600 rounded text-xs text-primary-400 font-mono">
                    {'{daysUntil}'}
                  </span>
                </div>
                <textarea
                  name="emailTemplate"
                  value={settings.emailTemplate}
                  onChange={handleChange}
                  className="input min-h-[120px] resize-none font-mono text-sm"
                  placeholder="Hey! Just a reminder that {friendName}'s birthday is coming up on {birthDate}. They will be turning {age} years old!"
                />
              </div>

              {/* Info Box */}
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 flex gap-3 animate-slide-up animate-delay-500">
                <Info className="text-primary-400 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm">
                  <p className="text-primary-300 font-medium mb-1">Notification Schedule</p>
                  <p className="text-dark-300">
                    Birthday reminders will be sent daily at {getTimeLabel(settings.notificationTime)}. Make sure your email ({user?.email}) is correct to receive notifications.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3.5 animate-slide-up animate-delay-600"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save size={20} />
                Save Settings
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setShowCategoryModal(false)}
          onSave={(cat) => {
            if (editingCategory) {
              setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
            } else {
              setCategories(prev => [...prev, cat]);
            }
            setShowCategoryModal(false);
          }}
        />
      )}
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
    color: category?.color || '#6366f1',
    icon: category?.icon || 'folder',
  });

  const COLORS = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
    '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let response;
      if (category) {
        response = await categoryApi.update(category.id, formData);
      } else {
        response = await categoryApi.create(formData);
      }
      onSave(response.data.data);
      toast.success(category ? 'Category updated!' : 'Category created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-700 rounded-2xl p-6 max-w-md w-full animate-scale-in">
        <h3 className="text-xl font-semibold text-white mb-6">
          {category ? 'Edit Category' : 'New Category'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="Category name"
              required
            />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === color 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-700' 
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
