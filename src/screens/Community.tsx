import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import {
  Heart, MapPin, Calendar, Send,
  Plus, Minus, Loader2, ShieldCheck,
  Search, SlidersHorizontal, Crosshair,
} from 'lucide-react';
import { t } from '../lib/i18n';
import {
  communityWins, accountabilityPartner, volunteerEvents, healthClusters,
} from '../lib/mockData';
import { api, type HealthReportRow } from '../lib/supabase';
import BottomSheet from '../components/BottomSheet';
import GroupsPanel from '../components/GroupsPanel';

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const tabs = [
  { key: 'board' as const, label: 'Board' },
  { key: 'groups' as const, label: 'Groups' },
  { key: 'map' as const, label: 'Map' },
];

export default function Community() {
  const [subTab, setSubTab] = useState<'board' | 'groups' | 'map'>('board');
  const [showShareSheet, setShowShareSheet] = useState(false);

  return (
    <div className="screen-scroll">
      <div className="aurora-mesh" />
      <div className="noise-overlay" />

      <div className="relative px-6 pt-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-ink-600/70 dark:text-ink-300/70 mb-1">
            Together, quietly
          </p>
          <h1 className="font-display font-bold text-display-l text-ink-900 dark:text-ink-100 tracking-tight">
            {t('nav.community')}
          </h1>
        </div>

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
      {subTab === 'groups' && <GroupsPanel />}
      {subTab === 'map' && <MapView />}

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

const symptomColors: Record<string, string> = {
  Doomscrolling: '#FF4D6A',
  FOMO: '#F5A623',
  'Screen Fatigue': '#4A90E2',
  'Sleep Loss': '#8E7CC3',
  Other: '#63C5B2',
};

type AlertLevel = 'normal' | 'slight' | 'watch' | 'warning';
type MapFilterKey = 'all' | AlertLevel;

const alertLevels: {
  key: AlertLevel;
  label: string;
  shortLabel: string;
  color: string;
  emoji: string;
  min: number;
}[] = [
  { key: 'normal', label: 'Normal', shortLabel: 'Normal', color: '#22C55E', emoji: '🟢', min: 0 },
  { key: 'slight', label: 'Slight Increase', shortLabel: 'Slight', color: '#EAB308', emoji: '🟡', min: 0.5 },
  { key: 'watch', label: 'Watch', shortLabel: 'Watch', color: '#F97316', emoji: '🟠', min: 0.65 },
  { key: 'warning', label: 'Early Warning', shortLabel: 'Warning', color: '#EF4444', emoji: '🔴', min: 0.8 },
];

function alertLevelFromIntensity(intensity: number): AlertLevel {
  if (intensity >= 0.8) return 'warning';
  if (intensity >= 0.65) return 'watch';
  if (intensity >= 0.5) return 'slight';
  return 'normal';
}

function alertMeta(level: AlertLevel) {
  return alertLevels.find((a) => a.key === level) ?? alertLevels[0];
}

const mapFilters: { key: MapFilterKey; label: string; color: string; emoji?: string }[] = [
  { key: 'all', label: 'All', color: '#FF7A45' },
  ...alertLevels.map((a) => ({
    key: a.key as MapFilterKey,
    label: a.label,
    color: a.color,
    emoji: a.emoji,
  })),
];

// Simple filled-circle glyph inside the pin head
const alertPinGlyph =
  '<circle cx="12" cy="12" r="6.5" fill="#FFFFFF" stroke="none"/>';

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

const radiusOptions = [
  { km: 0, label: 'Anywhere' },
  { km: 2, label: 'Within 2 km' },
  { km: 5, label: 'Within 5 km' },
  { km: 10, label: 'Within 10 km' },
];

// No geolocation in this build — the demo data is centred on Seoul. Kept a
// little off the Jung-gu cluster so the "You" dot never hides under a pin.
const youLocation = { lat: 37.5588, lng: 126.9702, name: 'Jung-gu, Seoul' };

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function withinKm(lat: number, lng: number, km: number): boolean {
  return km === 0 || distanceKm(youLocation.lat, youLocation.lng, lat, lng) <= km;
}

function compactNumber(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function makePinIcon(color: string, glyph: string): L.DivIcon {
  return L.divIcon({
    className: 'map-pin',
    html:
      '<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">' +
      `<path d="M15 1.5C7.8 1.5 2 7.3 2 14.5c0 8.9 11.4 20.4 12.3 21.3.4.4 1 .4 1.4 0C16.6 34.9 28 23.4 28 14.5 28 7.3 22.2 1.5 15 1.5z" fill="${color}" stroke="#FFFFFF" stroke-width="2.4"/>` +
      '<g transform="translate(6.6 6.1) scale(0.7)" fill="none" stroke="#FFFFFF" stroke-width="2.2" ' +
      `stroke-linecap="round" stroke-linejoin="round">${glyph}</g>` +
      '</svg>',
    iconSize: [30, 40],
    iconAnchor: [15, 39],
    popupAnchor: [0, -34],
  });
}

function MapView() {
  const [reports, setReports] = useState<HealthReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckInSheet, setShowCheckInSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filter, setFilter] = useState<MapFilterKey>('all');
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(0);
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

  const search = query.trim().toLowerCase();

  const checkIns = useMemo(() => {
    const baseline = healthClusters.map((c) => ({
      id: c.id,
      symptom: c.symptom,
      city: c.city,
      lat: c.lat,
      lng: c.lng,
      count: c.count,
      intensity: c.intensity,
      alert: alertLevelFromIntensity(c.intensity),
      note: '',
      created_at: '',
      live: false,
    }));
    const live = reports.map((r) => {
      const intensity = 0.55;
      return {
        id: r.id,
        symptom: r.symptom,
        city: r.city,
        lat: r.lat,
        lng: r.lng,
        count: 1,
        intensity,
        alert: alertLevelFromIntensity(intensity),
        note: r.note,
        created_at: r.created_at,
        live: true,
      };
    });
    return [...baseline, ...live].filter(
      (c) =>
        withinKm(c.lat, c.lng, radiusKm) &&
        (!search ||
          c.city.toLowerCase().includes(search) ||
          c.symptom.toLowerCase().includes(search) ||
          alertMeta(c.alert).label.toLowerCase().includes(search)),
    );
  }, [reports, radiusKm, search]);

  const visibleCheckIns = useMemo(
    () => (filter === 'all' ? checkIns : checkIns.filter((c) => c.alert === filter)),
    [filter, checkIns],
  );

  const summaryTiles = alertLevels.map((level) => {
    const rows = checkIns.filter((c) => c.alert === level.key);
    return {
      key: level.key as MapFilterKey,
      label: level.shortLabel,
      value: compactNumber(rows.reduce((sum, c) => sum + c.count, 0)),
      color: level.color,
      emoji: level.emoji,
    };
  });

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [youLocation.lat, youLocation.lng],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
    }).addTo(map);

    L.marker([youLocation.lat, youLocation.lng], {
      icon: L.divIcon({
        className: 'map-you',
        html:
          '<span class="map-you-label">You</span>' +
          '<span class="map-you-halo"></span>' +
          '<span class="map-you-dot"></span>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
      interactive: false,
      zIndexOffset: -200,
    }).addTo(map);

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

    visibleCheckIns.forEach((c) => {
      const meta = alertMeta(c.alert);
      const marker = L.marker([c.lat, c.lng], { icon: makePinIcon(meta.color, alertPinGlyph) });

      const when = c.created_at
        ? new Date(c.created_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Aggregate';
      const suffix = c.live
        ? `<div style="font-size:10px;opacity:.7;margin-top:4px">Live check-in &middot; ${when}</div>` +
          (c.note ? `<div style="font-size:11px;margin-top:4px">${escapeHtml(c.note)}</div>` : '')
        : `<div style="font-size:11px;margin-top:4px">${c.count} check-ins this week</div>`;

      marker.bindPopup(
        `<div style="font-family:'Plus Jakarta Sans',sans-serif">` +
          `<div style="font-weight:700;color:${meta.color};font-size:12px;text-transform:uppercase;letter-spacing:.08em">${meta.emoji} ${meta.label}</div>` +
          `<div style="font-weight:700;font-size:14px;margin-top:2px">${escapeHtml(c.city)}</div>` +
          `<div style="font-size:11px;margin-top:4px;opacity:.8">${escapeHtml(c.symptom)}</div>` +
          suffix +
          `</div>`,
      );
      marker.addTo(layerRef.current!);
    });
  }, [visibleCheckIns]);

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
      mapRef.current?.flyTo([payload.lat, payload.lng], 13, { duration: 1.2 });
    }
    setShowCheckInSheet(false);
  };

  const handleRecenter = () => {
    mapRef.current?.flyTo([youLocation.lat, youLocation.lng], 13, { duration: 0.8 });
  };

  const liveCount = reports.length;

  return (
    <div className="mt-4">
      {/* Alert-level chips */}
      <div className="px-6 flex gap-2 overflow-x-auto scrollbar-none mb-3">
        {mapFilters.map((f) => {
          const active = filter === f.key;
          return (
            <motion.button
              key={f.key}
              className={`whitespace-nowrap py-1.5 rounded-capsule text-caption font-bold flex items-center gap-1.5 ${
                f.emoji ? 'pl-2 pr-3.5' : 'px-4'
              } ${active ? 'hero-glow text-white shadow-soft' : 'glass text-ink-700 dark:text-ink-200'}`}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(f.key)}
            >
              {f.emoji && <span className="text-[13px] leading-none">{f.emoji}</span>}
              {f.label}
            </motion.button>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="px-6 mb-3">
        <div className="flex items-center gap-2 pl-3.5 pr-1.5 rounded-capsule glass focus-within:ring-2 focus-within:ring-lighthouse-500/40">
          <Search size={15} className="text-ink-300 shrink-0" strokeWidth={2.5} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={'Search neighborhoods\u2026'}
            className="flex-1 min-w-0 bg-transparent py-3 text-caption text-ink-900 dark:text-ink-100 placeholder:text-ink-300 focus:outline-none"
          />
          <span className="w-px h-5 bg-ink-900/10 dark:bg-white/10 shrink-0" />
          <motion.button
            className="relative w-9 h-9 rounded-full flex items-center justify-center focus-ring shrink-0"
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowFilterSheet(true)}
            aria-label="Map filters"
          >
            <SlidersHorizontal size={16} className="text-ink-600 dark:text-ink-300" strokeWidth={2.4} />
            {radiusKm !== 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral-500" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Alert colour key */}
      <div className="px-6 mb-3 flex flex-wrap gap-x-3 gap-y-1">
        {alertLevels.map((level) => (
          <span
            key={level.key}
            className="flex items-center gap-1.5 text-[10px] font-bold text-ink-600 dark:text-ink-300"
          >
            <span className="w-2 h-2 rounded-full" style={{ background: level.color }} />
            {level.label}
          </span>
        ))}
      </div>

      {/* Map */}
      <div className="mx-6 relative rounded-hero overflow-hidden shadow-soft" style={{ height: 340 }}>
        <div ref={mapContainerRef} className="absolute inset-0" style={{ zIndex: 1 }} />

        {/* Live counter badge */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-capsule glass-strong flex items-center gap-1.5 shadow-soft" style={{ zIndex: 2 }}>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-mint-500"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[11px] font-bold text-ink-900">
            {loading ? 'Syncing\u2026' : `${liveCount} live check-in${liveCount === 1 ? '' : 's'}`}
          </span>
        </div>

        {/* Map controls */}
        <div className="absolute right-3 bottom-6 flex flex-col items-center gap-2" style={{ zIndex: 2 }}>
          <motion.button
            className="w-10 h-10 rounded-full glass-strong flex items-center justify-center shadow-soft focus-ring"
            whileTap={{ scale: 0.92 }}
            onClick={handleRecenter}
            aria-label="Centre the map on you"
          >
            <Crosshair size={17} className="text-ink-900 dark:text-ink-100" strokeWidth={2.4} />
          </motion.button>
          <div className="rounded-capsule glass-strong shadow-soft overflow-hidden flex flex-col">
            <motion.button
              className="w-10 h-9 flex items-center justify-center focus-ring"
              whileTap={{ scale: 0.92 }}
              onClick={() => mapRef.current?.zoomIn()}
              aria-label="Zoom in"
            >
              <Plus size={16} className="text-ink-900 dark:text-ink-100" strokeWidth={2.8} />
            </motion.button>
            <span className="h-px bg-ink-900/10 dark:bg-white/10" />
            <motion.button
              className="w-10 h-9 flex items-center justify-center focus-ring"
              whileTap={{ scale: 0.92 }}
              onClick={() => mapRef.current?.zoomOut()}
              aria-label="Zoom out"
            >
              <Minus size={16} className="text-ink-900 dark:text-ink-100" strokeWidth={2.8} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Community summary */}
      <div className="mx-6 mt-4 relative overflow-hidden p-4 rounded-hero glass-strong">
        <div
          className="absolute -top-16 -right-16 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.5), transparent 70%)', filter: 'blur(26px)' }}
        />
        <div className="relative flex items-baseline justify-between gap-2">
          <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100 tracking-tight">
            Community summary
          </h3>
          <span className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold">
            Today
          </span>
        </div>

        <div className="relative mt-3 grid grid-cols-4 gap-1.5">
          {summaryTiles.map((tile) => {
            const active = filter === tile.key;
            return (
              <motion.button
                key={tile.key}
                className={`px-1 py-2 rounded-card text-center ${active ? 'glass-tint-warm' : 'glass'}`}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilter(active ? 'all' : tile.key)}
              >
                <span
                  className="mx-auto w-7 h-7 rounded-[10px] flex items-center justify-center shadow-soft text-[13px]"
                  style={{ background: `linear-gradient(135deg, ${tile.color}, ${tile.color}cc)` }}
                >
                  {tile.emoji}
                </span>
                <p className="mt-1.5 font-display font-bold text-body text-ink-900 dark:text-ink-100 leading-none">
                  {tile.value}
                </p>
                <p className="mt-1 text-[9px] font-bold text-ink-600 dark:text-ink-300 leading-tight">
                  {tile.label}
                </p>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          className="relative mt-3 w-full p-3.5 rounded-card hero-glow text-white shadow-medium shine flex items-center gap-3 text-left"
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCheckInSheet(true)}
        >
          <span className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center shrink-0">
            <Plus size={18} strokeWidth={3} />
          </span>
          <span className="min-w-0">
            <span className="block font-display font-bold text-body leading-tight">
              Community check-in
            </span>
            <span className="block text-[11px] text-white/85 leading-snug">
              Share how your day is going — anonymously
            </span>
          </span>
        </motion.button>
      </div>

      <p className="px-6 mt-3 text-[11px] text-ink-600 dark:text-ink-300 text-center flex items-center justify-center gap-1">
        <ShieldCheck size={11} strokeWidth={2.5} />
        {t('community.privacy')}
      </p>

      <BottomSheet
        isOpen={showCheckInSheet}
        onClose={() => setShowCheckInSheet(false)}
        title="Community check-in"
      >
        <ReportForm onSubmit={handleSubmit} />
      </BottomSheet>

      <BottomSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        title="Map filters"
      >
        <div className="space-y-4">
          <div>
            <p className="text-micro uppercase tracking-[0.14em] text-ink-600 dark:text-ink-300 font-bold mb-2">
              Distance from you
            </p>
            <div className="flex flex-wrap gap-2">
              {radiusOptions.map((o) => (
                <motion.button
                  key={o.km}
                  className={`px-3.5 py-2 rounded-capsule text-caption font-bold ${
                    radiusKm === o.km ? 'hero-glow text-white shadow-soft' : 'glass text-ink-700 dark:text-ink-200'
                  }`}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setRadiusKm(o.km)}
                >
                  {o.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-capsule bg-mint-500/10 text-mint-700 dark:text-mint-300 text-caption font-bold w-fit">
            <MapPin size={13} />
            Centred on {youLocation.name}
          </div>

          <motion.button
            className="w-full py-3.5 rounded-capsule hero-glow text-white font-display font-bold text-title shadow-medium"
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilterSheet(false)}
          >
            Show {visibleCheckIns.length} pin{visibleCheckIns.length === 1 ? '' : 's'}
          </motion.button>
        </div>
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
