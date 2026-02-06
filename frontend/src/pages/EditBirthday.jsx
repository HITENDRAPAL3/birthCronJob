import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { birthdayApi, categoryApi } from '../services/api';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Mail, 
  FileText,
  Save,
  ToggleLeft,
  ToggleRight,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditBirthday = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    friendName: '',
    birthDate: '',
    friendEmail: '',
    notes: '',
    categoryId: null,
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [birthdayRes, categoryRes] = await Promise.all([
        birthdayApi.getById(id),
        categoryApi.getAll(),
      ]);
      
      const birthday = birthdayRes.data.data;
      setCategories(categoryRes.data.data || []);
      setFormData({
        friendName: birthday.friendName,
        birthDate: birthday.birthDate,
        friendEmail: birthday.friendEmail || '',
        notes: birthday.notes || '',
        categoryId: birthday.categoryId || null,
        isActive: birthday.isActive,
      });
    } catch (error) {
      toast.error('Failed to load birthday');
      navigate('/birthdays');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await birthdayApi.update(id, formData);
      toast.success('Birthday updated successfully!');
      navigate('/birthdays');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update birthday';
      toast.error(message);
      console.error(error);
    } finally {
      setSaving(false);
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
        <Link
          to="/birthdays"
          className="inline-flex items-center gap-2 text-dark-300 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Birthdays
        </Link>
        <h1 className="text-3xl font-display font-bold text-white">Edit Birthday</h1>
        <p className="text-dark-300 mt-1">Update {formData.friendName}'s birthday details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="animate-slide-up">
          <label className="label">Friend's Name *</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
            <input
              type="text"
              name="friendName"
              value={formData.friendName}
              onChange={handleChange}
              className="input pl-12"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        <div className="animate-slide-up animate-delay-100">
          <label className="label">Birth Date *</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="input pl-12"
              required
            />
          </div>
        </div>

        <div className="animate-slide-up animate-delay-150">
          <label className="label">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, categoryId: null }))}
              className={`p-3 rounded-lg border-2 transition-all ${
                !formData.categoryId
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-dark-500 hover:border-dark-400'
              }`}
            >
              <Tag className="mx-auto mb-1 text-dark-300" size={20} />
              <span className="text-sm text-dark-200">None</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, categoryId: cat.id }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.categoryId === cat.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-500 hover:border-dark-400'
                }`}
              >
                <div 
                  className="w-5 h-5 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm text-dark-200">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="animate-slide-up animate-delay-200">
          <label className="label">Email Address (Optional)</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
            <input
              type="email"
              name="friendEmail"
              value={formData.friendEmail}
              onChange={handleChange}
              className="input pl-12"
              placeholder="friend@example.com"
            />
          </div>
        </div>

        <div className="animate-slide-up animate-delay-300">
          <label className="label">Notes (Optional)</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-dark-400" size={20} />
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input pl-12 min-h-[120px] resize-none"
              placeholder="Gift ideas, celebration plans, or any other notes..."
              maxLength={500}
            />
          </div>
          <p className="text-sm text-dark-400 mt-2 text-right">
            {formData.notes.length}/500 characters
          </p>
        </div>

        <div className="animate-slide-up animate-delay-400">
          <label className="label">Status</label>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 w-full ${
              formData.isActive
                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                : 'border-dark-500 bg-dark-600 text-dark-300'
            }`}
          >
            {formData.isActive ? (
              <ToggleRight size={24} className="text-green-400" />
            ) : (
              <ToggleLeft size={24} />
            )}
            <span className="font-medium">
              {formData.isActive ? 'Active - Will receive notifications' : 'Inactive - No notifications'}
            </span>
          </button>
        </div>

        <div className="flex gap-4 pt-4 animate-slide-up animate-delay-500">
          <Link to="/birthdays" className="btn-secondary flex-1">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1"
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
                Save Changes
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBirthday;
