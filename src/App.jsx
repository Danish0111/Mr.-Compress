import { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import DropZone from './components/DropZone';
import ImagePreview from './components/ImagePreview';
import StatsBar from './components/StatsBar';
import {
  compressByQuality,
  compressByTargetSize,
  getMimeType,
  getExtension,
} from './utils/compressImage';

const OUTPUT_FORMATS = [
  { label: 'JPG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
  { label: 'WebP', value: 'image/webp' },
];

export default function App() {
  // Image state
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);

  // Compression state
  const [mode, setMode] = useState('quality'); // 'quality' | 'target'
  const [quality, setQuality] = useState(75);
  const [targetKB, setTargetKB] = useState(200);
  const [outputFormat, setOutputFormat] = useState('image/jpeg');

  // Result state
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [autoDetectedFmt, setAutoDetectedFmt] = useState(null);

  // Debounce timer
  const debounceRef = useRef(null);

  // Handle new file
  const handleFile = useCallback((file) => {
    setOriginalFile(file);
    setOriginalSize(file.size);
    setOriginalUrl(URL.createObjectURL(file));
    setCompressedUrl(null);
    setCompressedBlob(null);
    setCompressedSize(null);
    setError(null);
    // Auto-detect format
    const detected = getMimeType(file);
    setAutoDetectedFmt(detected);
    setOutputFormat(detected);
  }, []);

  // Run compression
  const runCompression = useCallback(async (file, mode, quality, targetKB, outputFormat) => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      let result;
      if (mode === 'quality') {
        result = await compressByQuality(file, quality / 100, outputFormat);
      } else {
        result = await compressByTargetSize(file, targetKB * 1024, outputFormat);
      }
      setCompressedUrl(result.dataUrl);
      setCompressedBlob(result.blob);
      setCompressedSize(result.size);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }, []);

  // Debounce compression when settings change
  useEffect(() => {
    if (!originalFile) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runCompression(originalFile, mode, quality, targetKB, outputFormat);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [originalFile, mode, quality, targetKB, outputFormat, runCompression]);

  // Download
  const handleDownload = () => {
    if (!compressedUrl || !compressedBlob) return;
    const ext = getExtension(outputFormat);
    const baseName = (originalFile?.name || 'image').replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = `${baseName}_compressed.${ext}`;
    a.click();
  };

  // Reset
  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(null);
    setOriginalUrl(null);
    setOriginalSize(null);
    setCompressedUrl(null);
    setCompressedBlob(null);
    setCompressedSize(null);
    setError(null);
  };

  const savings = originalSize && compressedSize
    ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-x-hidden">
      {/* Background glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <header className="text-center mb-10">
          {/* Mascot */}
          <div className="flex justify-center mb-5">
            <div className="relative float-anim">
              <div className="absolute inset-0 rounded-3xl bg-violet-500/20 blur-2xl scale-110" />
              <img
                src="/mr-compress.jpg"
                alt="Mr. Compress mascot"
                className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl shadow-2xl shadow-violet-500/40 border-2 border-violet-500/30"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-5 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Smart Image Compressor · Browser-only · 100% Private
          </div>

          <h1
            className="text-6xl md:text-7xl font-extrabold mb-3 tracking-tight leading-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 24px rgba(167, 139, 250, 0.7))',
                display: 'inline-block',
              }}
            >
              Mr. Compress
            </span>
          </h1>
          <p className="text-slate-500 text-base font-medium mb-4 tracking-wide uppercase">
            Smart Image Compressor
          </p>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Compress JPG, PNG & WebP images instantly — right in your browser.
            Choose quality or hit a precise file size target.
          </p>

          {/* Author */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/30">
              MD
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm leading-none">Md Danish</p>
              <a href="mailto:danish150106@gmail.com" className="text-violet-400 text-xs hover:text-violet-300 transition-colors">
                danish150106@gmail.com
              </a>
            </div>
          </div>
        </header>

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* LEFT: drop zone / preview */}
          <div className="space-y-5">
            {!originalFile ? (
              <DropZone onFile={handleFile} />
            ) : (
              <div className="space-y-5 fade-in-up">
                {/* Preview */}
                <ImagePreview
                  original={originalUrl}
                  compressed={compressedUrl}
                  originalSize={originalSize}
                  compressedSize={compressedSize}
                />

                {/* Stats */}
                <StatsBar
                  originalSize={originalSize}
                  compressedSize={compressedSize}
                  processing={processing}
                />

                {/* Processing indicator */}
                {processing && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm">
                    <svg className="spin-slow shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-9-9"/>
                    </svg>
                    Compressing…
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    ⚠ {error}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    id="btn-download"
                    onClick={handleDownload}
                    disabled={!compressedBlob || processing}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Download {savings > 0 ? `(−${savings}%)` : ''}
                  </button>
                  <button
                    id="btn-reset"
                    onClick={handleReset}
                    className="px-5 py-3.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all text-sm font-medium"
                  >
                    New Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: controls panel */}
          <div className="glass-card rounded-2xl p-6 space-y-6 sticky top-6">

            {/* Output Format */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {OUTPUT_FORMATS.map((f) => (
                  <button
                    key={f.value}
                    id={`fmt-${f.label.toLowerCase()}`}
                    onClick={() => setOutputFormat(f.value)}
                    className={`mode-btn py-2 rounded-lg text-sm font-semibold transition-all
                      ${outputFormat === f.value ? 'active text-violet-300' : 'text-slate-400'}`}
                  >
                    {f.label}
                    {autoDetectedFmt === f.value && (
                      <span className="block text-[9px] text-violet-400/70 font-normal">detected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06]" />

            {/* Compression Mode */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                Compression Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'quality', label: 'Quality', icon: '🎨' },
                  { id: 'target', label: 'Target Size', icon: '🎯' },
                ].map((m) => (
                  <button
                    key={m.id}
                    id={`mode-${m.id}`}
                    onClick={() => setMode(m.id)}
                    className={`mode-btn py-3 px-3 rounded-lg text-sm font-semibold transition-all flex flex-col items-center gap-1
                      ${mode === m.id ? 'active text-violet-300' : 'text-slate-400'}`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider */}
            {mode === 'quality' && (
              <div className="fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Quality
                  </label>
                  <span className="text-violet-300 font-bold text-lg font-mono">{quality}%</span>
                </div>
                <input
                  id="quality-slider"
                  type="range"
                  min="5"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Smaller</span>
                  <span>Better Quality</span>
                </div>

                {/* Quality presets */}
                <div className="grid grid-cols-4 gap-1.5 mt-3">
                  {[
                    { label: 'Low', val: 30 },
                    { label: 'Med', val: 60 },
                    { label: 'High', val: 80 },
                    { label: 'Max', val: 95 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setQuality(p.val)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${quality === p.val
                          ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                          : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:text-slate-300 hover:bg-white/[0.06]'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Target Size Input */}
            {mode === 'target' && (
              <div className="fade-in-up">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-3">
                  Target File Size
                </label>
                <div className="relative">
                  <input
                    id="target-kb"
                    type="number"
                    min="10"
                    max="10000"
                    value={targetKB}
                    onChange={(e) => setTargetKB(Number(e.target.value))}
                    onBlur={(e) => setTargetKB(Math.min(10000, Math.max(10, Number(e.target.value) || 10)))}
                    className="kb-input"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">
                    KB
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-3">
                  {[50, 100, 200, 500].map((kb) => (
                    <button
                      key={kb}
                      onClick={() => setTargetKB(kb)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${targetKB === kb
                          ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                          : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:text-slate-300 hover:bg-white/[0.06]'
                        }`}
                    >
                      {kb}KB
                    </button>
                  ))}
                </div>
                <p className="text-slate-600 text-xs mt-2">
                  Note: PNG uses lossless compression — target size may not be achieved.
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-white/[0.06]" />

            {/* Tips */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Tips</p>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>• Use <span className="text-violet-400">WebP</span> for smallest size</li>
                <li>• <span className="text-violet-400">60–80%</span> quality is usually ideal</li>
                <li>• PNG is lossless — use JPG/WebP for photos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="mt-14 pb-8 flex flex-col items-center gap-5">
          {/* Built for Digital Heroes button */}
          <a
            id="btn-digital-heroes"
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-hero inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white font-bold text-sm shadow-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Built for Digital Heroes
          </a>

          <p className="text-slate-600 text-xs text-center">
            All compression happens locally in your browser — your images never leave your device.
          </p>
          <p className="text-slate-700 text-xs">
            Made with ♥ by <span className="text-violet-500">Md Danish</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
