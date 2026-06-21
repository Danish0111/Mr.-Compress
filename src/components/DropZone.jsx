import { useCallback, useState } from 'react';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export default function DropZone({ onFile }) {
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    onFile(file);
  }, [onFile]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const onInputChange = (e) => processFile(e.target.files[0]);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group
        ${dragging
          ? 'border-violet-500 bg-violet-500/10 drag-active'
          : 'border-white/15 bg-white/[0.02] hover:border-violet-500/50 hover:bg-violet-500/5'
        }`}
      style={{ minHeight: '280px' }}
    >
      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={onInputChange}
      />

      <div className="flex flex-col items-center justify-center h-full py-16 px-8 pointer-events-none select-none">
        {/* Icon */}
        <div className={`mb-6 transition-transform duration-300 ${dragging ? 'scale-110' : 'group-hover:scale-105 float-anim'}`}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center">
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24">
              <path d="M4 16l4-4 3 3 4-5 5 6H4z" fill="rgba(139,92,246,0.4)" />
              <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3V15" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold text-white mb-2">
          {dragging ? 'Drop it here!' : 'Drop your image here'}
        </h3>
        <p className="text-slate-400 text-sm mb-4">or click anywhere to browse</p>

        {/* Supported formats */}
        <div className="flex gap-2">
          {['JPG', 'PNG', 'WebP'].map((fmt) => (
            <span
              key={fmt}
              className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 border border-violet-500/30 text-violet-300"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
