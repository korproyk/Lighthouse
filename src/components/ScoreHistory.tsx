import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '../lib/store';
import BottomSheet from './BottomSheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScoreHistory({ isOpen, onClose }: Props) {
  const { checkIns } = useStore();

  const data = checkIns
    .filter((c) => c.completed)
    .map((c) => ({
      date: new Date(c.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      score: c.score,
      sleep: c.sleep,
    }));

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Score History">
      <div className="h-[280px] -ml-2 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB547" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#FF6B7A" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#BFB7AB' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#BFB7AB' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: '#FFF8F0',
                border: '1px solid rgba(31,26,18,0.06)',
                borderRadius: 12,
                fontSize: 13,
                fontFamily: 'Plus Jakarta Sans',
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#FFB547"
              strokeWidth={2.5}
              fill="url(#scoreGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Avg Score', value: Math.round(data.reduce((a, d) => a + d.score, 0) / data.length) },
          { label: 'Best Day', value: Math.max(...data.map((d) => d.score)) },
          { label: 'Avg Sleep', value: `${(data.reduce((a, d) => a + d.sleep, 0) / data.length).toFixed(1)}h` },
        ].map((stat) => (
          <div key={stat.label} className="p-3 rounded-card bg-ink-100 dark:bg-night-700 text-center">
            <p className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
              {stat.value}
            </p>
            <p className="text-[11px] text-ink-300 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
