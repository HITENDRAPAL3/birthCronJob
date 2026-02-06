import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { birthdayApi, categoryApi } from '../services/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Cake,
  Calendar,
  Mail,
  Filter,
  Tag,
  Download,
  Upload,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import WishSuggestionsModal from '../components/WishSuggestionsModal';

const Birthdays = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredBirthdays, setFilteredBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [wishBirthday, setWishBirthday] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBirthdays();
  }, [birthdays, searchQuery, filter, selectedCategory]);

  const fetchData = async () => {
    try {
      const [birthdayRes, categoryRes] = await Promise.all([
        birthdayApi.getAll(),
        categoryApi.getAll(),
      ]);
      setBirthdays(birthdayRes.data.data || []);
      setCategories(categoryRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load birthdays');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterBirthdays = () => {
    let filtered = [...birthdays];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.friendName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(b => b.categoryId === selectedCategory);
    }

    // Time filter
    if (filter === 'upcoming') {
      filtered = filtered.filter(b => b.daysUntilBirthday <= 30);
    }

    // Sort by upcoming birthday
    filtered.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

    setFilteredBirthdays(filtered);
  };

  const handleDelete = async (id) => {
    try {
      await birthdayApi.delete(id);
      setBirthdays(prev => prev.filter(b => b.id !== id));
      toast.success('Birthday deleted successfully');
    } catch (error) {
      toast.error('Failed to delete birthday');
      console.error(error);
    }
    setShowDeleteModal(null);
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
    }
  };

  const getDaysLabel = (days) => {
    if (days === 0) return { text: 'Today!', className: 'text-accent-400 bg-accent-500/20' };
    if (days === 1) return { text: 'Tomorrow', className: 'text-primary-400 bg-primary-500/20' };
    if (days <= 7) return { text: `${days} days`, className: 'text-green-400 bg-green-500/20' };
    if (days <= 30) return { text: `${days} days`, className: 'text-yellow-400 bg-yellow-500/20' };
    return { text: `${days} days`, className: 'text-dark-300 bg-dark-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Birthdays</h1>
          <p className="text-dark-300 mt-1">Manage all your saved birthdays</p>
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

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="input pl-12"
          />
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Tag size={16} />
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={selectedCategory === cat.id ? {} : { borderColor: cat.color }}
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* Birthday List */}
      {filteredBirthdays.length === 0 ? (
        <div className="card text-center py-16">
          <div className="p-4 bg-dark-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Cake className="text-dark-300" size={40} />
          </div>
          <h3 className="text-xl font-medium text-dark-100 mb-2">
            {searchQuery || selectedCategory ? 'No birthdays found' : 'No birthdays yet'}
          </h3>
          <p className="text-dark-400 mb-6 max-w-md mx-auto">
            {searchQuery || selectedCategory
              ? 'Try a different search term or category' 
              : 'Start by adding your friends\' and family\'s birthdays to never miss their special day!'}
          </p>
          {!searchQuery && !selectedCategory && (
            <Link to="/birthdays/add" className="btn-primary">
              <Plus size={18} />
              Add Your First Birthday
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBirthdays.map((birthday, index) => {
            const daysInfo = getDaysLabel(birthday.daysUntilBirthday);
            return (
              <div
                key={birthday.id}
                className="card-hover animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                      style={{
                        background: birthday.categoryColor
                          ? `linear-gradient(135deg, ${birthday.categoryColor}, ${birthday.categoryColor}99)`
                          : 'linear-gradient(135deg, #6366f1, #ec4899)'
                      }}
                    >
                      {birthday.friendName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white text-lg">
                          {birthday.friendName}
                        </h3>
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
                      <div className="flex flex-wrap items-center gap-3 text-sm text-dark-300">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(birthday.birthDate), 'MMMM d, yyyy')}
                        </span>
                        <span className="text-dark-500">•</span>
                        <span>Age: {birthday.age}</span>
                        {birthday.friendEmail && (
                          <>
                            <span className="text-dark-500 hidden sm:inline">•</span>
                            <span className="hidden sm:flex items-center gap-1">
                              <Mail size={14} />
                              {birthday.friendEmail}
                            </span>
                          </>
                        )}
                      </div>
                      {birthday.notes && (
                        <p className="text-sm text-dark-400 mt-1 truncate max-w-md">
                          {birthday.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${daysInfo.className} hidden sm:block`}>
                      {daysInfo.text}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setWishBirthday(birthday)}
                        className="p-2 rounded-lg text-dark-300 hover:text-accent-400 hover:bg-accent-500/10 transition-colors"
                        title="Get wish suggestions"
                      >
                        <Sparkles size={18} />
                      </button>
                      <Link
                        to={`/birthdays/edit/${birthday.id}`}
                        className="p-2 rounded-lg text-dark-300 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(birthday.id)}
                        className="p-2 rounded-lg text-dark-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className={`sm:hidden mt-3 pt-3 border-t border-dark-500`}>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${daysInfo.className}`}>
                    {daysInfo.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-700 rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Birthday?</h3>
            <p className="text-dark-300 mb-6">
              Are you sure you want to delete this birthday? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} onSuccess={fetchData} />
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
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
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
                id="csv-upload-birthdays"
              />
              <label htmlFor="csv-upload-birthdays" className="cursor-pointer">
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

export default Birthdays;
