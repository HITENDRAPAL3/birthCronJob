import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { birthdayApi, categoryApi } from '../services/api';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Mail, 
  FileText,
  Save,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddBirthday = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    friendName: '',
    birthDate: '',
    friendEmail: '',
    notes: '',
    categoryId: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await birthdayApi.create({
        ...formData,
        categoryId: formData.categoryId || null,
        isActive: true,
      });
      toast.success('Birthday added successfully! 🎉');
      navigate('/birthdays');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add birthday';
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-display font-bold text-white">Add Birthday</h1>
        <p className="text-dark-300 mt-1">Add a new friend's birthday to your list</p>
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
          <p className="text-sm text-dark-400 mt-2">
            We'll never send emails directly to your friend. This is for your reference only.
          </p>
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

        <div className="flex gap-4 pt-4 animate-slide-up animate-delay-400">
          <Link to="/birthdays" className="btn-secondary flex-1">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
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
                Save Birthday
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBirthday;
