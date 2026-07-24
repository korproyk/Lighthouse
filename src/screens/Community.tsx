import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { Heart, MapPin, Calendar, Send, GraduationCap, Clock, Users, ChefHat, Hammer, Home as HomeIcon, Coins, Trees, Wrench, HeartHandshake, Play, Plus, Loader2, ShieldCheck } from 'lucide-react';
import { t } from '../lib/i18n';
import { communityWins, accountabilityPartner, volunteerEvents, healthClusters, learningSkills, type LearningSkill } from '../lib/mockData';
import { api, type HealthReportRow } from '../lib/supabase';
import Lumi from '../components/Lumi';
import BottomSheet from '../components/BottomSheet';

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const symptoms = ['All', 'Doomscrolling', 'FOMO', 'Screen Fatigue', 'Sleep Loss'];

const tabs = [
  { key: 'board' as const, label: 'Board' },
  { key: 'learn' as const, label: 'Learn' },
  { key: 'map' as const, label: 'Map' },
];

export default function Community() {
  const [subTab, setSubTab] = useState<'board' | 'learn' | 'map'>('board');
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState('All');

  const filteredClusters = selectedSymptom === 'All'
    ? healthClusters
    : healthClusters.filter((c) => c.symptom === selectedSymptom);

  return (
    <div className="screen-scroll">
      <div className="aurora-mesh" />
      <div className="noise-overlay" />

      <div className="relative px-6 pt-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
        <p className="text-micro uppercase tracking-[0.18em] text-ink-600/70 dark:text-ink-300/70 mb-1">
          Together, quietly
        </p>
        <h1 className="font-display font-bold text-display-l text-ink-900 dark:text-ink-100 tracking-tight">
          {t('nav.community')}
        </h1>

        {/* Sub-tabs — glass capsule */}
        <div className="mt-4 p-1 rounded-capsule glass flex gap-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              className={`flex-1 py-2 rounded-capsule text-caption font-bold capitalize transition-colors ${
                subTab === tab.key
                  ? 'hero-glow text-white shadow-soft'
                  : 'text-ink-600 dark:text-ink-300'
              }`}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSubTab(tab.key)}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {subTab === 'board' && <BoardView onShare={() => setShowShareSheet(true)} />}
      {subTab === 'learn' && <LearnView />}
      {subTab === 'map' && (
        <MapView
          clusters={filteredClusters}
          selectedSymptom={selectedSymptom}
          onSymptomChange={setSelectedSymptom}
        />
      )}

      <BottomSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        title="Share a win"
      >
        <div className="space-y-4">
          <textarea
            className="w-full p-4 rounded-card bg-ink-100 dark:bg-night-700 text-body text-ink-900 dark:text-ink-100 placeholder:text-ink-300 resize-none focus-ring h-32"
            placeholder="What went well today?"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-capsule bg-mint-500/10 text-mint-700 dark:text-mint-300 text-caption font-semibold">
              {'\u{1F512}'} Anonymous
            </div>
          </div>
          <motion.button
            className="w-full py-4 rounded-capsule hero-glow text-white font-display font-bold shadow-medium"
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowShareSheet(false)}
          >
            Share {'\u2728'}
          </motion.button>
        </div>
      </BottomSheet>
    </div>
  );
}

function BoardView({ onShare }: { onShare: () => void }) {
  return (
    <div className="px-6 mt-4 space-y-4">
      {/* Accountability Partner */}
      <motion.div
        className="relative p-4 rounded-hero glass-strong overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="absolute -top-14 -right-14 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.55), transparent 70%)', filter: 'blur(26px)' }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.35), transparent 70%)', filter: 'blur(26px)' }}
        />
        <p className="relative text-micro uppercase text-lighthouse-600 dark:text-lighthouse-300 tracking-[0.16em] mb-3 font-bold">
          {t('community.partner')}
        </p>
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-full hero-glow flex items-center justify-center text-white font-bold shadow-medium">
            {accountabilityPartner.name[0]}
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100">
              {accountabilityPartner.name} {accountabilityPartner.flag}
            </p>
            <p className="text-caption text-ink-600 dark:text-ink-300">{accountabilityPartner.lastSeen}</p>
          </div>
          <motion.button
            className="px-4 py-2 rounded-capsule hero-glow text-white text-caption font-bold flex items-center gap-1.5 shadow-soft"
            whileTap={{ scale: 0.97 }}
          >
            <Send size={13} />
            Wave
          </motion.button>
        </div>
      </motion.div>

      {/* Share FAB */}
      <motion.button
        className="w-full py-3 rounded-capsule hero-glow text-white font-display font-bold text-caption shadow-medium shine"
        whileTap={{ scale: 0.97 }}
        onClick={onShare}
      >
        + {t('community.share_win')}
      </motion.button>

      {/* Wins Wall masonry */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight">
            Recent wins
          </h3>
          <span className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold">
            Anonymous
          </span>
        </div>
        <div className="columns-2 gap-3 space-y-3">
          {communityWins.map((win, i) => (
            <motion.div
              key={win.id}
              className="relative break-inside-avoid rounded-card glass-strong overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${win.color}55, transparent 70%)`,
                  filter: 'blur(22px)',
                }}
              />
              <div className="relative h-1" style={{ background: `linear-gradient(90deg, ${win.color}, transparent)` }} />
              <div className="relative p-3.5">
                <p className="text-caption text-ink-900 dark:text-ink-100 leading-relaxed selectable">
                  {win.text}
                </p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/20 dark:border-white/10">
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-600 dark:text-ink-300 font-semibold">
                    <span>{win.flag}</span>
                    <span>{timeAgo(win.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-coral-500 font-bold">
                    <Heart size={11} fill="currentColor" />
                    {win.reactions}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Volunteer Events */}
      <div className="mt-4">
        <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100 mb-3">
          Upcoming Events
        </h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
          {volunteerEvents.map((event) => (
            <motion.div
              key={event.id}
              className="relative flex-shrink-0 w-[240px] p-4 rounded-card glass-strong overflow-hidden"
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.45), transparent 70%)', filter: 'blur(20px)' }}
              />
              <h4 className="relative font-display font-bold text-body text-ink-900 dark:text-ink-100">
                {event.title}
              </h4>
              <div className="flex items-center gap-1.5 mt-2 text-caption text-ink-600 dark:text-ink-300">
                <MapPin size={13} />
                {event.location}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-caption text-ink-600 dark:text-ink-300">
                <Calendar size={13} />
                {new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </div>
              <p className="mt-2 text-[11px] text-mint-500 font-bold">
                {event.attendees} going
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const categoryIcons: Record<LearningSkill['category'], React.ElementType> = {
  cooking: ChefHat,
  craft: Hammer,
  home: HomeIcon,
  money: Coins,
  outdoors: Trees,
  repair: Wrench,
  wellness: HeartHandshake,
};

const categoryFilters: { key: LearningSkill['category'] | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cooking', label: 'Cooking' },
  { key: 'home', label: 'Home' },
  { key: 'repair', label: 'Repair' },
  { key: 'money', label: 'Money' },
  { key: 'outdoors', label: 'Outdoors' },
  { key: 'wellness', label: 'Wellness' },
];

function LearnView() {
  const [filter, setFilter] = useState<LearningSkill['category'] | 'all'>('all');
  const [selected, setSelected] = useState<LearningSkill | null>(null);

  const skills = filter === 'all' ? learningSkills : learningSkills.filter((s) => s.category === filter);

  return (
    <div className="px-6 mt-4 space-y-4">
      {/* Hero intro */}
      <motion.div
        className="relative overflow-hidden rounded-hero glass-strong p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.55), transparent 70%)', filter: 'blur(28px)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.3), transparent 70%)', filter: 'blur(28px)' }}
        />
        <div className="relative flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-[16px] hero-glow flex items-center justify-center shadow-soft">
            <GraduationCap size={22} className="text-white" strokeWidth={2.25} />
          </div>
          <div className="flex-1">
            <p className="text-micro uppercase tracking-[0.16em] text-ink-600 dark:text-ink-300 font-bold">
              Learning Center
            </p>
            <h2 className="mt-0.5 font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight">
              Learn real things from real people
            </h2>
            <p className="mt-1 text-caption text-ink-600 dark:text-ink-300 leading-relaxed">
              Cooking, fixing, growing, budgeting. Practical skills shared by aunties, uncles, coaches, and friends.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-6 px-6 pb-1">
        {categoryFilters.map((c) => (
          <motion.button
            key={c.key}
            className={`whitespace-nowrap px-3.5 py-2 rounded-capsule text-caption font-bold ${
              filter === c.key ? 'hero-glow text-white shadow-soft' : 'glass text-ink-700 dark:text-ink-200'
            }`}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter(c.key)}
          >
            {c.label}
          </motion.button>
        ))}
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-2 gap-3">
        {skills.map((skill, i) => {
          const Icon = categoryIcons[skill.category];
          return (
            <motion.button
              key={skill.id}
              className="relative overflow-hidden rounded-card glass-strong text-left"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(skill)}
            >
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${skill.color}66, transparent 70%)`, filter: 'blur(22px)' }}
              />
              <div
                className="relative h-1"
                style={{ background: `linear-gradient(90deg, ${skill.color}, transparent)` }}
              />
              <div className="relative p-3.5">
                <div
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-soft"
                  style={{ background: `linear-gradient(135deg, ${skill.color}, ${skill.color}cc)` }}
                >
                  <Icon size={18} className="text-white" strokeWidth={2.25} />
                </div>
                <h4 className="mt-2.5 font-display font-bold text-caption text-ink-900 dark:text-ink-100 leading-tight">
                  {skill.title}
                </h4>
                <p className="mt-1 text-[11px] text-ink-600 dark:text-ink-300">
                  {skill.teacherFlag} {skill.teacher}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold text-ink-600 dark:text-ink-300">
                  <span className="flex items-center gap-0.5">
                    <Clock size={10} strokeWidth={2.5} />
                    {skill.duration}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Users size={10} strokeWidth={2.5} />
                    {skill.learners}
                  </span>
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-ink-100/70 dark:bg-night-700/70 capitalize">
                    {skill.ageMin}+
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <BottomSheet
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
      >
        {selected && (
          <div className="space-y-4">
            <div
              className="relative overflow-hidden p-4 rounded-card"
              style={{ background: `linear-gradient(135deg, ${selected.color}22, ${selected.color}11)` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center shadow-soft"
                  style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)` }}
                >
                  {(() => {
                    const Icon = categoryIcons[selected.category];
                    return <Icon size={22} className="text-white" strokeWidth={2.25} />;
                  })()}
                </div>
                <div>
                  <p className="text-micro uppercase tracking-[0.14em] text-ink-600 font-bold">
                    Taught by
                  </p>
                  <p className="font-display font-bold text-body text-ink-900">
                    {selected.teacherFlag} {selected.teacher}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-body text-ink-900 dark:text-ink-100 leading-relaxed">
              {selected.description}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Time', value: selected.duration, Icon: Clock },
                { label: 'Ages', value: `${selected.ageMin}+`, Icon: Users },
                { label: 'Level', value: selected.difficulty, Icon: GraduationCap },
              ].map((s) => {
                const Icon = s.Icon;
                return (
                  <div key={s.label} className="p-2.5 rounded-card glass text-center">
                    <Icon size={14} className="mx-auto text-lighthouse-600" strokeWidth={2.5} />
                    <p className="mt-1 text-[9px] uppercase tracking-[0.1em] font-bold text-ink-600 dark:text-ink-300">
                      {s.label}
                    </p>
                    <p className="font-display font-bold text-caption text-ink-900 dark:text-ink-100 capitalize">
                      {s.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <motion.button
              className="w-full py-4 rounded-capsule hero-glow text-white font-display font-bold text-title flex items-center justify-center gap-2 shadow-medium shine"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(null)}
            >
              <Play size={18} fill="white" />
              Start learning
            </motion.button>

            <p className="text-[11px] text-ink-600 dark:text-ink-300 text-center">
              Ask an adult to watch the first time if there are hot pans, sharp tools, or tall places.
            </p>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

const symptomColors: Record<string, string> = {
  Doomscrolling: '#FF4D6A',
  FOMO: '#F5A623',
  'Screen Fatigue': '#4A90E2',
  'Sleep Loss': '#8E7CC3',
  Other: '#63C5B2',
};

const seoulNeighborhoods = [
  { name: 'Jongno-gu, Seoul', lat: 37.5735, lng: 126.9788 },
  { name: 'Gangnam-gu, Seoul', lat: 37.5172, lng: 127.0473 },
  { name: 'Mapo-gu, Seoul', lat: 37.5558, lng: 126.9369 },
  { name: 'Yongsan-gu, Seoul', lat: 37.5384, lng: 126.9654 },
  { name: 'Seongdong-gu, Seoul', lat: 37.5443, lng: 127.0557 },
  { name: 'Seocho-gu, Seoul', lat: 37.4979, lng: 127.0276 },
  { name: 'Songpa-gu, Seoul', lat: 37.5145, lng: 127.1059 },
  { name: 'Nowon-gu, Seoul', lat: 37.6542, lng: 127.0568 },
  { name: 'Eunpyeong-gu, Seoul', lat: 37.6026, lng: 126.9291 },
  { name: 'Dongdaemun-gu, Seoul', lat: 37.5744, lng: 127.0396 },
];

function MapView({
  clusters,
  selectedSymptom,
  onSymptomChange,
}: {
  clusters: typeof healthClusters;
  selectedSymptom: string;
  onSymptomChange: (s: string) => void;
}) {
  const [reports, setReports] = useState<HealthReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    (async () => {
      const data = await api.healthReports.list();
      setReports(data);
      setLoading(false);
    })();
  }, []);

  const combined = useMemo(() => {
    const baseline = clusters.map((c) => ({
      id: c.id,
      symptom: c.symptom,
      city: c.city,
      lat: c.lat,
      lng: c.lng,
      count: c.count,
      intensity: c.intensity,
      note: '',
      created_at: '',
      live: false,
    }));
    const live = reports.map((r) => ({
      id: r.id,
      symptom: r.symptom,
      city: r.city,
      lat: r.lat,
      lng: r.lng,
      count: 1,
      intensity: 0.3,
      note: r.note,
      created_at: r.created_at,
      live: true,
    }));
    return [...baseline, ...live].filter(
      (c) => selectedSymptom === 'All' || c.symptom === selectedSymptom,
    );
  }, [clusters, reports, selectedSymptom]);

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [37.5665, 126.978],
      zoom: 10,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Render markers when data changes
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();

    combined.forEach((c) => {
      const color = symptomColors[c.symptom] ?? symptomColors.Other;
      const radius = c.live ? 14 : 12 + c.intensity * 22;

      const marker = L.circleMarker([c.lat, c.lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: c.live ? 0.65 : 0.35,
        weight: c.live ? 2 : 1.5,
      });

      const when = c.created_at
        ? new Date(c.created_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Aggregate';
      const suffix = c.live
        ? `<div style="font-size:10px;opacity:.7;margin-top:4px">Live report &middot; ${when}</div>` +
          (c.note ? `<div style="font-size:11px;margin-top:4px">${escapeHtml(c.note)}</div>` : '')
        : `<div style="font-size:11px;margin-top:4px">${c.count} reports this week</div>`;

      marker.bindPopup(
        `<div style="font-family:'Plus Jakarta Sans',sans-serif">` +
          `<div style="font-weight:700;color:${color};font-size:12px;text-transform:uppercase;letter-spacing:.08em">${c.symptom}</div>` +
          `<div style="font-weight:700;font-size:14px;margin-top:2px">${escapeHtml(c.city)}</div>` +
          suffix +
          `</div>`,
      );
      marker.addTo(layerRef.current!);
    });
  }, [combined]);

  const handleSubmit = async (payload: { symptom: string; note: string; locationName: string; lat: number; lng: number }) => {
    const { data, error } = await api.healthReports.insert({
      symptom: payload.symptom,
      note: payload.note,
      city: payload.locationName,
      lat: payload.lat,
      lng: payload.lng,
    });

    if (!error && data) {
      setReports((prev) => [data, ...prev]);
      mapRef.current?.flyTo([payload.lat, payload.lng], 12, { duration: 1.2 });
    }
    setShowReportSheet(false);
  };

  const liveCount = reports.length;

  return (
    <div className="mt-4">
      {/* Symptom chips */}
      <div className="px-6 flex gap-2 overflow-x-auto scrollbar-none mb-3">
        {symptoms.map((s) => (
          <motion.button
            key={s}
            className={`whitespace-nowrap px-3.5 py-2 rounded-capsule text-caption font-bold ${
              selectedSymptom === s
                ? 'hero-glow text-white shadow-soft'
                : 'glass text-ink-700 dark:text-ink-200'
            }`}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSymptomChange(s)}
          >
            {s}
          </motion.button>
        ))}
      </div>

      {/* Map */}
      <div className="mx-6 relative rounded-hero overflow-hidden shadow-soft" style={{ height: 380 }}>
        <div ref={mapContainerRef} className="absolute inset-0" style={{ zIndex: 1 }} />

        {/* Live counter badge */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-capsule glass-strong flex items-center gap-1.5 shadow-soft" style={{ zIndex: 2 }}>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-mint-500"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[11px] font-bold text-ink-900">
            {loading ? 'Syncing\u2026' : `${liveCount} live report${liveCount === 1 ? '' : 's'}`}
          </span>
        </div>

      </div>

      {/* Report button */}
      <div className="px-6 mt-3">
        <motion.button
          className="w-full py-3.5 rounded-capsule hero-glow text-white font-display font-bold text-title shadow-medium shine flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowReportSheet(true)}
        >
          <Plus size={16} strokeWidth={3} />
          Report a struggle
        </motion.button>
      </div>

      {/* Legend */}
      <div className="mx-6 mt-3 p-3 rounded-card glass-strong">
        <p className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold mb-2">
          Legend
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {Object.entries(symptomColors).map(([sym, color]) => (
            <div key={sym} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[11px] font-bold text-ink-900 dark:text-ink-100">{sym}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="px-6 mt-3 text-[11px] text-ink-600 dark:text-ink-300 text-center flex items-center justify-center gap-1">
        <ShieldCheck size={11} strokeWidth={2.5} />
        {t('community.privacy')}
      </p>

      <BottomSheet
        isOpen={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        title="Report a struggle"
      >
        <ReportForm onSubmit={handleSubmit} />
      </BottomSheet>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ReportForm({
  onSubmit,
}: {
  onSubmit: (p: { symptom: string; note: string; locationName: string; lat: number; lng: number }) => Promise<void>;
}) {
  const [symptom, setSymptom] = useState('Doomscrolling');
  const [note, setNote] = useState('');
  const [locationIdx, setLocationIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handle = async () => {
    setSubmitting(true);
    const loc = seoulNeighborhoods[locationIdx];
    const jitter = () => (Math.random() - 0.5) * 0.02;
    await onSubmit({
      symptom,
      note: note.trim(),
      locationName: loc.name,
      lat: loc.lat + jitter(),
      lng: loc.lng + jitter(),
    });
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold mb-2">
          What's going on?
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(symptomColors).map((s) => (
            <motion.button
              key={s}
              className={`px-3.5 py-2 rounded-capsule text-caption font-bold ${
                symptom === s ? 'hero-glow text-white shadow-soft' : 'glass text-ink-700 dark:text-ink-200'
              }`}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSymptom(s)}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold mb-2">
          Neighborhood
        </p>
        <select
          className="w-full p-3 rounded-card glass text-body text-ink-900 dark:text-ink-100 focus-ring"
          value={locationIdx}
          onChange={(e) => setLocationIdx(Number(e.target.value))}
        >
          {seoulNeighborhoods.map((n, i) => (
            <option key={n.name} value={i}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold mb-2">
          Optional note
        </p>
        <textarea
          className="w-full p-3 rounded-card glass text-body text-ink-900 dark:text-ink-100 placeholder:text-ink-300 resize-none focus-ring h-20"
          placeholder="How are you feeling? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-capsule bg-mint-500/10 text-mint-700 dark:text-mint-300 text-caption font-bold w-fit">
        <ShieldCheck size={13} />
        Anonymous by default
      </div>

      <motion.button
        className="w-full py-4 rounded-capsule hero-glow text-white font-display font-bold text-title flex items-center justify-center gap-2 shadow-medium disabled:opacity-60"
        whileTap={{ scale: 0.97 }}
        onClick={handle}
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sharing…
          </>
        ) : (
          <>
            <Send size={16} />
            Share update
          </>
        )}
      </motion.button>
    </div>
  );
}
