import { useState } from 'react';

export default function ImagePreview({ original, compressed, originalSize, compressedSize }) {
  const [view, setView] = useState('split'); // 'split' | 'original' | 'compressed'

  const savings = originalSize && compressedSize
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return Math.round(bytes / 1024) + ' KB';
  };

  return (
    <div className="space-y-4 fade-in-up">
      {/* View toggle */}
      <div className="flex items-center justify-center gap-2">
        {[
          { id: 'original', label: 'Original' },
          { id: 'split', label: 'Split' },
          { id: 'compressed', label: 'Compressed' },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
              ${view === v.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Preview area */}
      <div className={`grid gap-4 ${view === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Original */}
        {(view === 'original' || view === 'split') && (
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 relative">
            <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-xs font-medium text-slate-300 border border-white/10">
              Original · {formatSize(originalSize)}
            </div>
            <img
              src={original}
              alt="Original"
              className="w-full object-contain img-preview"
              style={{ maxHeight: '320px' }}
            />
          </div>
        )}

        {/* Compressed */}
        {(view === 'compressed' || view === 'split') && compressed && (
          <div className="rounded-xl overflow-hidden border border-violet-500/30 bg-black/30 relative">
            <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-xs font-medium text-violet-300 border border-violet-500/30">
              Compressed · {formatSize(compressedSize)}
            </div>
            {savings > 0 && (
              <div className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm text-xs font-bold text-emerald-400 border border-emerald-500/40 badge-pop">
                -{savings}%
              </div>
            )}
            <img
              src={compressed}
              alt="Compressed"
              className="w-full object-contain img-preview"
              style={{ maxHeight: '320px' }}
            />
          </div>
        )}

        {/* Placeholder if compressed not ready */}
        {(view === 'compressed' || view === 'split') && !compressed && (
          <div className="rounded-xl border border-dashed border-white/10 flex items-center justify-center" style={{ minHeight: '200px' }}>
            <p className="text-slate-500 text-sm">Compressed preview will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
