import { useState, useEffect } from 'react';
import { wishApi } from '../services/api';
import { Sparkles, Copy, Check, RefreshCw, X, Heart, Smile, Zap, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const TONES = [
  { value: null, label: 'All', icon: Sparkles, color: 'text-primary-400' },
  { value: 'heartfelt', label: 'Heartfelt', icon: Heart, color: 'text-pink-400' },
  { value: 'funny', label: 'Funny', icon: Smile, color: 'text-yellow-400' },
  { value: 'inspirational', label: 'Inspirational', icon: Zap, color: 'text-purple-400' },
  { value: 'formal', label: 'Formal', icon: Briefcase, color: 'text-blue-400' },
];

const WishSuggestionsModal = ({ birthday, onClose }) => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);

  useEffect(() => {
    generateWishes();
  }, [birthday.id]);

  const generateWishes = async (tone = selectedTone) => {
    setLoading(true);
    try {
      const response = await wishApi.generate(birthday.id, 6, tone);
      setWishes(response.data.data || []);
    } catch (error) {
      toast.error('Failed to generate wishes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToneChange = (tone) => {
    setSelectedTone(tone);
    generateWishes(tone);
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-700 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-xl">
              <Sparkles className="text-accent-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Birthday Wishes for {birthday.friendName}
              </h3>
              <p className="text-sm text-dark-300">
                Turning {birthday.age + 1} • {birthday.categoryName || 'Friend'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <X className="text-dark-300" size={20} />
          </button>
        </div>

        {/* Tone Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {TONES.map(tone => {
            const Icon = tone.icon;
            const isSelected = selectedTone === tone.value;
            return (
              <button
                key={tone.value || 'all'}
                onClick={() => handleToneChange(tone.value)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary-500/20 border-primary-500 text-primary-300 border'
                    : 'bg-dark-600 text-dark-300 hover:bg-dark-500 border border-transparent'
                }`}
              >
                <Icon size={16} className={isSelected ? tone.color : ''} />
                {tone.label}
              </button>
            );
          })}
        </div>

        {/* Wishes List */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-dark-500"></div>
                <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-dark-300">Generating wishes...</p>
            </div>
          ) : wishes.length > 0 ? (
            wishes.map((wish, index) => (
              <div
                key={index}
                onClick={() => copyToClipboard(wish, index)}
                className="p-4 bg-dark-600/50 rounded-xl cursor-pointer hover:bg-dark-600 transition-all group border border-transparent hover:border-dark-400"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className="text-dark-100 leading-relaxed text-[15px]">{wish}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-dark-500/50">
                  <span className="text-xs text-dark-400">Click to copy</span>
                  {copiedIndex === index ? (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <Check size={14} /> Copied!
                    </span>
                  ) : (
                    <span className="text-dark-400 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy size={14} />
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <Sparkles className="mx-auto text-dark-500 mb-3" size={40} />
              <p className="text-dark-400">No wishes generated yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2 border-t border-dark-600">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Close
          </button>
          <button
            onClick={() => generateWishes(selectedTone)}
            disabled={loading}
            className="btn-primary flex-1"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Generating...' : 'Generate More'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishSuggestionsModal;
