import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, PenLine, Globe, Cake, Palette } from 'lucide-react';
import { useStore } from '../lib/store';
import Lumi from '../components/Lumi';

const themes = [
  { id: 'basic', label: 'Basic', swatch: '#FFB27A' },
  { id: 'uv', label: 'UV', swatch: 'linear-gradient(135deg, #7C3AED, #4C1D95)' },
  { id: 'random', label: 'Random', swatch: 'conic-gradient(from 180deg, #FF4D6A, #FFB547, #34D399, #3B82F6, #A78BFA, #FF4D6A)' },
] as const;
type ThemeId = typeof themes[number]['id'];

const ageRanges = ['5-7', '8-10', '11-12', '13-14', '15-16', '17-19', '20+'];
const countries = [
  { code: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}' },
  { code: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}' },
  { code: 'Other', flag: '\u{1F30D}' },
];
const languages = [
  { code: 'en', name: 'English', flag: '\u{1F30D}' },
  { code: 'bn', name: '\u09AC\u09BE\u0982\u09B2\u09BE', flag: '\u{1F1E7}\u{1F1E9}' },
  { code: 'ko', name: '\uD55C\uAD6D\uC5B4', flag: '\u{1F1F0}\u{1F1F7}' },
];

export default function Onboarding() {
  const { setOnboarded, setLanguage, toggleDarkMode, darkMode, setUserName } = useStore();
  const [selectedLang, setSelectedLang] = useState('en');
  const [ageRange, setAgeRange] = useState('');
  const [country, setCountry] = useState('');
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<ThemeId>('basic');

  const missingFields = [
    !name.trim() && 'nickname',
    !ageRange && 'age',
    !country && 'country',
  ].filter(Boolean) as string[];
  const canContinue = missingFields.length === 0;

  const handleSelectTheme = (id: ThemeId) => {
    setTheme(id);
    const wantsDark = id === 'uv' || (id === 'random' && Math.random() < 0.5);
    if (wantsDark !== darkMode) toggleDarkMode();
  };

  const handleFinish = () => {
    if (!canContinue) return;
    setLanguage(selectedLang);
    setUserName(name.trim());
    setOnboarded();
  };

  return (
    <div
      className="app-shell relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 15% 0%, rgba(255, 178, 122, 0.55), transparent 50%),' +
          'radial-gradient(ellipse at 85% 100%, rgba(255, 77, 106, 0.35), transparent 55%),' +
          '#FAF7F2',
      }}
    >
      {/* Ambient blobs */}
      <motion.div
        className="aurora-blob"
        style={{ width: 380, height: 380, top: '-8%', left: '-14%', background: 'radial-gradient(circle, #FFB27A 0%, transparent 70%)', opacity: 0.6 }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="aurora-blob"
        style={{ width: 340, height: 340, bottom: '-10%', right: '-12%', background: 'radial-gradient(circle, #FF4D6A 0%, transparent 70%)', opacity: 0.3 }}
        animate={{ x: [0, -24, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="noise-overlay" />

      {/* Header */}
      <div
        className="relative flex items-center gap-2 px-6 pt-4"
        style={{ paddingTop: 'calc(20px + env(safe-area-inset-top))', zIndex: 2 }}
      >
        <div className="relative w-10 h-10 rounded-[14px] hero-glow shadow-medium flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.65), transparent 45%)' }} />
          <Sparkles className="relative z-10 text-white" size={20} strokeWidth={2.25} fill="white" />
        </div>
        <div>
          <p className="font-display font-bold text-ink-900 tracking-tight leading-none" style={{ fontSize: 18 }}>
            Lighthouse
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-600 mt-0.5">
            A few quick details
          </p>
        </div>
      </div>

      {/* Scroll content */}
      <div className="relative screen-scroll" style={{ paddingBottom: 140, zIndex: 2 }}>
        <div className="px-6 pt-6">
          <h1 className="font-display font-bold text-display-xl text-ink-900 tracking-tight" style={{ lineHeight: 1.05 }}>
            Let's get you{' '}
            <span className="text-gradient-ember">set up</span>
          </h1>
          <p className="mt-2 text-body text-ink-600 leading-relaxed">
            Just the basics — your answers stay private on this device.
          </p>
        </div>

        {/* Glass form card */}
        <div className="px-6 mt-6">
          <motion.div
            className="relative overflow-hidden rounded-hero glass-strong p-5 space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.55), transparent 70%)', filter: 'blur(28px)' }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.3), transparent 70%)', filter: 'blur(28px)' }}
            />

            {/* Language */}
            <Field icon={Globe} label="Language">
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    className={`flex-1 py-2.5 rounded-capsule text-caption font-bold flex items-center justify-center gap-1.5 ${
                      selectedLang === lang.code
                        ? 'hero-glow text-white shadow-soft'
                        : 'glass text-ink-700'
                    }`}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedLang(lang.code)}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </motion.button>
                ))}
              </div>
            </Field>

            {/* Age */}
            <Field icon={Cake} label="Age range" required>
              <div className="flex flex-wrap gap-2">
                {ageRanges.map((range) => (
                  <motion.button
                    key={range}
                    className={`py-2.5 px-3.5 rounded-capsule font-display font-bold text-caption ${
                      ageRange === range
                        ? 'hero-glow text-white shadow-soft'
                        : 'glass text-ink-700'
                    }`}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setAgeRange(range)}
                  >
                    {range}
                  </motion.button>
                ))}
              </div>
            </Field>

            {/* Country */}
            <Field icon={Globe} label="Country" required>
              <div className="flex gap-2 flex-wrap">
                {countries.map((c) => (
                  <motion.button
                    key={c.code}
                    className={`flex items-center gap-2 py-2.5 px-3.5 rounded-capsule font-display font-bold text-caption ${
                      country === c.code
                        ? 'hero-glow text-white shadow-soft'
                        : 'glass text-ink-700'
                    }`}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCountry(c.code)}
                  >
                    <span>{c.flag}</span>
                    {c.code}
                  </motion.button>
                ))}
              </div>
            </Field>

            {/* Nickname */}
            <Field icon={PenLine} label="Nickname" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full py-3 px-4 rounded-capsule glass text-body text-ink-900 placeholder:text-ink-300 focus-ring"
              />
              <p className="mt-1.5 text-[11px] text-ink-600">Stays private on your device</p>
            </Field>

            {/* Theme */}
            <Field icon={Palette} label="Theme">
              <div className="flex gap-2">
                {themes.map((th) => (
                  <motion.button
                    key={th.id}
                    className={`flex-1 py-2.5 rounded-capsule text-caption font-bold flex items-center justify-center gap-1.5 ${
                      theme === th.id
                        ? 'hero-glow text-white shadow-soft'
                        : 'glass text-ink-700'
                    }`}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectTheme(th.id)}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                        theme === th.id ? 'border-2 border-white' : ''
                      }`}
                      style={theme === th.id ? undefined : { background: th.swatch }}
                    >
                      {theme === th.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span>{th.label}</span>
                  </motion.button>
                ))}
              </div>
            </Field>
          </motion.div>
        </div>

        {/* Lumi mascot + reassurance bubble */}
        <div className="px-6 mt-6 flex items-end gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full hero-glow blur-lg opacity-50 scale-90" />
            <Lumi pose={canContinue ? 'cheering' : 'thinking'} size={68} className="relative" />
          </div>
          <AnimatePresence mode="wait">
            {canContinue ? (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative glass-strong rounded-card px-4 py-3 flex-1"
              >
                <p className="font-display font-bold text-caption text-ink-900">
                  You're all set! {'\u{1F389}'}
                </p>
                <p className="text-[11px] text-ink-600 leading-relaxed mt-0.5">
                  Your little spark is ready to grow. Healthy habits, brighter days.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative glass rounded-card px-4 py-3 flex-1"
              >
                <p className="text-caption text-ink-600 leading-relaxed">
                  A couple more taps and your little spark will be ready to grow.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="px-8 mt-5 text-[11px] text-ink-600 text-center leading-relaxed">
          Nothing here is shared. You can change anything later from Settings.
        </p>
      </div>

      {/* Sticky CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4"
        style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))', zIndex: 3 }}
      >
        <motion.button
          className={`w-full py-4 rounded-capsule font-display font-bold text-title flex items-center justify-center gap-2 shadow-medium ${
            canContinue
              ? 'hero-glow text-white shine'
              : 'bg-ink-100 text-ink-300 pointer-events-none'
          }`}
          whileTap={canContinue ? { scale: 0.97 } : undefined}
          onClick={handleFinish}
        >
          {canContinue ? "Let's go" : `Fill in ${missingFields.join(', ')}`}
          {canContinue && <ArrowRight size={20} strokeWidth={2.5} />}
        </motion.button>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon: React.ElementType;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-lighthouse-600" strokeWidth={2.5} />
        <label className="text-micro uppercase tracking-[0.14em] font-bold text-ink-600">
          {label}
          {required && <span className="text-coral-500 ml-1">*</span>}
        </label>
      </div>
      {children}
    </div>
  );
}
