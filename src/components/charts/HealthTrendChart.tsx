import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { HealthMetric } from '../../types';
import { formatDate } from '../../utils/formatters';

interface HealthTrendChartProps {
  data: HealthMetric[];
  type: 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'temperature';
  height?: number;
  showLegend?: boolean;
}

const configMap = {
  blood_pressure: {
    label: '血压 (mmHg)',
    colors: { top: '#FF6B6B', bottom: '#5C7AEA' } as { top: string; bottom: string },
    normalMax: 160,
    normalMin: 60,
  },
  blood_sugar: {
    label: '血糖 (mmol/L)',
    colors: { top: '#4ECDC4' } as { top: string; bottom?: string },
    normalMax: 10,
    normalMin: 3.5,
  },
  heart_rate: {
    label: '心率 (次/分)',
    colors: { top: '#FFE66D' } as { top: string; bottom?: string },
    normalMax: 120,
    normalMin: 50,
  },
  temperature: {
    label: '体温 (°C)',
    colors: { top: '#5C7AEA' } as { top: string; bottom?: string },
    normalMax: 37.5,
    normalMin: 35.5,
  },
};

export default function HealthTrendChart({ data, type, height = 260, showLegend = true }: HealthTrendChartProps) {
  const config = configMap[type];

  const chartData = data
    .filter((m) => m.type === type)
    .slice(-28)
    .map((m) => ({
      time: formatDate(m.timestamp, 'time'),
      date: formatDate(m.timestamp, 'month'),
      ...(type === 'blood_pressure'
        ? { 收缩压: m.value, 舒张压: m.value2 || 0 }
        : { value: m.value }),
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-card p-3 border border-slate-100">
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {type === 'blood_pressure' ? ' mmHg' : type === 'blood_sugar' ? ' mmol/L' : type === 'heart_rate' ? ' 次/分' : ' °C'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            {type === 'blood_pressure' ? (
              <>
                <linearGradient id="colorSystolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.colors.top} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.colors.top} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDiastolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.colors.bottom} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.colors.bottom} stopOpacity={0} />
                </linearGradient>
              </>
            ) : (
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.colors.top} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.colors.top} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
            domain={[config.normalMin * 0.8, config.normalMax * 1.1]}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
          {type === 'blood_pressure' ? (
            <>
              <Area
                type="monotone"
                dataKey="收缩压"
                stroke={config.colors.top}
                strokeWidth={2}
                fill="url(#colorSystolic)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="舒张压"
                stroke={config.colors.bottom}
                strokeWidth={2}
                fill="url(#colorDiastolic)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </>
          ) : (
            <Area
              type="monotone"
              dataKey="value"
              name={config.label.split(' ')[0]}
              stroke={config.colors.top}
              strokeWidth={2}
              fill="url(#colorValue)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
