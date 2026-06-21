export default function StatsBar({ originalSize, compressedSize, processing }) {
  const formatSize = (bytes) => {
    if (bytes == null || bytes === 0) return '—';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return Math.round(bytes / 1024) + ' KB';
  };

  const savings = originalSize && compressedSize
    ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
    : null;

  const stats = [
    {
      label: 'Original Size',
      value: formatSize(originalSize),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
        </svg>
      ),
      color: 'text-slate-300',
      accent: 'from-slate-600/20 to-slate-700/10 border-slate-600/30',
    },
    {
      label: 'Compressed Size',
      value: processing ? '...' : formatSize(compressedSize),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      ),
      color: 'text-violet-300',
      accent: 'from-violet-600/20 to-violet-700/10 border-violet-600/30',
    },
    {
      label: 'Space Saved',
      value: processing ? '...' : (savings !== null ? `${savings}%` : '—'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
      ),
      color: savings > 0 ? 'text-emerald-400' : 'text-slate-400',
      accent: savings > 0 ? 'from-emerald-600/20 to-emerald-700/10 border-emerald-600/30' : 'from-slate-600/20 to-slate-700/10 border-slate-600/30',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`stat-card rounded-xl p-4 bg-gradient-to-br ${s.accent} flex flex-col gap-2`}
        >
          <div className={`${s.color} opacity-70`}>{s.icon}</div>
          <div>
            <p className="text-slate-500 text-xs mb-1">{s.label}</p>
            <p className={`${s.color} text-lg font-bold font-mono`}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
