import { useState } from 'react';
import {
  Activity,
  FileText,
  AlertCircle,
  ChevronRight,
  Calendar,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Lightbulb,
  CheckCircle2,
  Info,
  Eye,
  List,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import HealthTrendChart from '../components/charts/HealthTrendChart';
import {
  formatDate,
  getHealthMetricLabel,
  getHealthMetricColor,
  cn,
} from '../utils/formatters';
import type { HealthMetricType } from '../types';

const timeRanges = [
  { key: '7d', label: '近7天' },
  { key: '30d', label: '近30天' },
  { key: '90d', label: '近90天' },
];

const metricTypes: { key: HealthMetricType; label: string; icon: string }[] = [
  { key: 'blood_pressure', label: '血压', icon: '🩺' },
  { key: 'blood_sugar', label: '血糖', icon: '🩸' },
  { key: 'heart_rate', label: '心率', icon: '❤️' },
  { key: 'temperature', label: '体温', icon: '🌡️' },
];

export default function HealthRecords() {
  const healthMetrics = useAppStore((s) => s.healthMetrics);
  const [activeRange, setActiveRange] = useState('30d');
  const [activeMetric, setActiveMetric] = useState<HealthMetricType>('blood_pressure');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const rangeDays = activeRange === '7d' ? 7 : activeRange === '30d' ? 30 : 90;
  const now = Date.now();
  const rangeMs = rangeDays * 24 * 60 * 60 * 1000;

  const filteredMetrics = healthMetrics.filter(
    (m) => m.type === activeMetric && now - new Date(m.timestamp).getTime() <= rangeMs
  );
  const recentMetrics = filteredMetrics.slice(-10).reverse();
  const abnormalMetrics = healthMetrics.filter(
    (m) => m.status !== 'normal'
      && m.type === activeMetric
      && now - new Date(m.timestamp).getTime() <= rangeMs
  ).slice(-8).reverse();

  const groupedAbnormals = (() => {
    const groups: Record<string, typeof abnormalMetrics> = {};
    for (const m of abnormalMetrics) {
      const dateKey = new Date(m.timestamp).toISOString().slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    }
    return groups;
  })();

  const dateMeasurements = selectedDate
    ? healthMetrics.filter((m) => new Date(m.timestamp).toISOString().slice(0, 10) === selectedDate)
    : [];

  const normalRange = {
    blood_pressure: '90-140 / 60-90 mmHg',
    blood_sugar: '3.9-6.1 mmol/L',
    heart_rate: '60-100 次/分',
    temperature: '36.0-37.3 °C',
  }[activeMetric];

  const avgValue = (() => {
    const recent = filteredMetrics;
    if (recent.length === 0) return '-';
    const sum = recent.reduce((acc, m) => acc + m.value, 0);
    const avg = sum / recent.length;
    if (activeMetric === 'blood_pressure') {
      const sum2 = recent.reduce((acc, m) => acc + (m.value2 || 0), 0);
      return `${avg.toFixed(0)}/${(sum2 / recent.length).toFixed(0)}`;
    }
    return avg.toFixed(activeMetric === 'temperature' ? 1 : 0);
  })();

  const healthSummary = (() => {
    const data = filteredMetrics;
    if (data.length === 0) {
      return {
        level: 'normal',
        levelText: '暂无数据',
        levelDesc: '该时间段内暂无测量记录',
        trend: 'stable' as 'up' | 'down' | 'stable',
        trendText: '—',
        abnormalCount: 0,
        tips: ['建议定期测量，关注身体健康状况'],
        systolicTrend: 'stable' as 'up' | 'down' | 'stable',
        diastolicTrend: 'stable' as 'up' | 'down' | 'stable',
      };
    }

    const abnormalCount = data.filter((m) => m.status !== 'normal').length;
    const abnormalRate = abnormalCount / data.length;

    let level: 'excellent' | 'good' | 'warning' | 'danger' = 'good';
    let levelText = '整体良好';
    let levelDesc = '各项指标基本在正常范围内';

    if (abnormalRate === 0) {
      level = 'excellent';
      levelText = '状态优秀';
      levelDesc = '所有测量结果均在正常范围内';
    } else if (abnormalRate < 0.2) {
      level = 'good';
      levelText = '整体良好';
      levelDesc = '大部分指标正常，偶有波动';
    } else if (abnormalRate < 0.5) {
      level = 'warning';
      levelText = '需要关注';
      levelDesc = '异常次数较多，建议加强监测';
    } else {
      level = 'danger';
      levelText = '警惕风险';
      levelDesc = '异常比例较高，建议及时就医咨询';
    }

    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid);
    const secondHalf = data.slice(mid);

    const avgFirst = firstHalf.reduce((acc, m) => acc + m.value, 0) / (firstHalf.length || 1);
    const avgSecond = secondHalf.reduce((acc, m) => acc + m.value, 0) / (secondHalf.length || 1);
    const diff = avgSecond - avgFirst;
    const diffPercent = avgFirst > 0 ? (diff / avgFirst) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendText = '趋势平稳';
    if (Math.abs(diffPercent) > 5) {
      if (diff > 0) {
        trend = 'up';
        trendText = `呈上升趋势（↑${diffPercent.toFixed(1)}%）`;
      } else {
        trend = 'down';
        trendText = `呈下降趋势（↓${Math.abs(diffPercent).toFixed(1)}%）`;
      }
    }

    let systolicTrend: 'up' | 'down' | 'stable' = 'stable';
    let diastolicTrend: 'up' | 'down' | 'stable' = 'stable';
    if (activeMetric === 'blood_pressure') {
      const sysFirst = firstHalf.reduce((acc, m) => acc + m.value, 0) / (firstHalf.length || 1);
      const sysSecond = secondHalf.reduce((acc, m) => acc + m.value, 0) / (secondHalf.length || 1);
      const sysDiff = sysSecond - sysFirst;
      const sysDiffPercent = sysFirst > 0 ? (sysDiff / sysFirst) * 100 : 0;
      systolicTrend = Math.abs(sysDiffPercent) > 5 ? (sysDiff > 0 ? 'up' : 'down') : 'stable';

      const diaFirst = firstHalf.reduce((acc, m) => acc + (m.value2 || 0), 0) / (firstHalf.length || 1);
      const diaSecond = secondHalf.reduce((acc, m) => acc + (m.value2 || 0), 0) / (secondHalf.length || 1);
      const diaDiff = diaSecond - diaFirst;
      const diaDiffPercent = diaFirst > 0 ? (diaDiff / diaFirst) * 100 : 0;
      diastolicTrend = Math.abs(diaDiffPercent) > 5 ? (diaDiff > 0 ? 'up' : 'down') : 'stable';
    }

    const tips: string[] = [];
    if (activeMetric === 'blood_pressure') {
      const highSystolic = data.filter((m) => m.value > 140).length;
      const highDiastolic = data.filter((m) => (m.value2 || 0) > 90).length;
      if (highSystolic > 0) tips.push(`收缩压有 ${highSystolic} 次偏高，注意减少盐的摄入`);
      if (highDiastolic > 0) tips.push(`舒张压有 ${highDiastolic} 次偏高，注意保持情绪稳定`);
      if (systolicTrend === 'up') tips.push('收缩压呈上升趋势，建议定期监测并就医评估');
      if (diastolicTrend === 'up') tips.push('舒张压呈上升趋势，建议保证充足睡眠');
      if (level === 'excellent') tips.push('血压控制良好，请继续保持健康的生活方式');
      if (tips.length === 0) tips.push('血压整体平稳，继续保持健康作息');
    } else if (activeMetric === 'blood_sugar') {
      if (trend === 'up') tips.push('血糖呈上升趋势，注意控制碳水化合物摄入');
      if (abnormalCount > 0) tips.push(`有 ${abnormalCount} 次血糖异常，建议规律饮食和运动`);
      if (level === 'excellent') tips.push('血糖控制良好，请继续保持');
      if (tips.length === 0) tips.push('血糖整体平稳，继续保持健康饮食');
    } else if (activeMetric === 'heart_rate') {
      if (trend === 'up') tips.push('心率呈上升趋势，注意休息和情绪管理');
      if (abnormalCount > 0) tips.push(`有 ${abnormalCount} 次心率异常，建议避免剧烈运动`);
      if (level === 'excellent') tips.push('心率状态良好，运动能力佳');
      if (tips.length === 0) tips.push('心率整体平稳，状态良好');
    } else if (activeMetric === 'temperature') {
      if (abnormalCount > 0) tips.push(`有 ${abnormalCount} 次体温异常，注意观察身体状况`);
      if (trend === 'up') tips.push('体温呈上升趋势，注意有无感染迹象');
      if (level === 'excellent') tips.push('体温正常，身体状态良好');
      if (tips.length === 0) tips.push('体温正常，继续保持');
    }

    return {
      level,
      levelText,
      levelDesc,
      trend,
      trendText,
      abnormalCount,
      tips,
      systolicTrend,
      diastolicTrend,
    };
  })();

  const reports = [
    { id: 1, date: '2026-06-01', type: '年度体检报告', hospital: '北京协和医院', status: '正常' },
    { id: 2, date: '2026-03-15', type: '心脑血管专项', hospital: '朝阳医院', status: '正常' },
    { id: 3, date: '2025-12-20', type: '常规体检报告', hospital: '社区医院', status: '注意' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-800">健康记录</h2>
          <p className="text-slate-500 mt-1">全面了解身体健康数据与趋势分析</p>
        </div>
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => setActiveRange(range.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeRange === range.key
                  ? 'tab-active'
                  : 'tab-inactive'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricTypes.map((metric) => {
          const latest = healthMetrics.filter((m) => m.type === metric.key).slice(-1)[0];
          const isActive = activeMetric === metric.key;
          return (
            <Card
              key={metric.key}
              hover
              onClick={() => setActiveMetric(metric.key)}
              className={`!p-5 cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-coral-400 shadow-card' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl mb-2">{metric.icon}</div>
                  <p className="text-sm text-slate-500">{metric.label}</p>
                </div>
                {latest && (
                  <p className={`text-2xl font-bold font-serif ${getHealthMetricColor(latest.status)}`}>
                    {metric.key === 'blood_pressure'
                      ? `${latest.value}/${latest.value2}`
                      : latest.value}
                  </p>
                )}
              </div>
              {latest && (
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  {latest.status === 'normal' ? (
                    <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-teal-500" /> 正常</span>
                  ) : latest.status === 'high' ? (
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-coral-500" /> 偏高</span>
                  ) : (
                    <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-sun-500" /> 偏低</span>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-slate-800">
              {getHealthMetricLabel(activeMetric)}趋势图
            </h3>
              <p className="text-sm text-slate-500 mt-1">正常范围：{normalRange}</p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-500">平均值</p>
                <p className="text-xl font-bold font-serif text-slate-800">{avgValue}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">测量次数</p>
                <p className="text-xl font-bold font-serif text-slate-800">
                  {filteredMetrics.length}次
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">异常次数</p>
                <p className="text-xl font-bold font-serif text-coral-500">
                  {filteredMetrics.filter((m) => m.status !== 'normal').length}次
                </p>
              </div>
            </div>
          </div>
          <HealthTrendChart data={filteredMetrics} type={activeMetric} height={340} showLegend />
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center',
                  healthSummary.level === 'excellent' && 'bg-teal-50',
                  healthSummary.level === 'good' && 'bg-sky-50',
                  healthSummary.level === 'warning' && 'bg-sun-50',
                  healthSummary.level === 'danger' && 'bg-coral-50',
                )}>
                  {healthSummary.level === 'excellent' || healthSummary.level === 'good' ? (
                    <CheckCircle2 className={cn(
                      'w-5 h-5',
                      healthSummary.level === 'excellent' && 'text-teal-500',
                      healthSummary.level === 'good' && 'text-sky-500',
                    )} />
                  ) : (
                    <AlertCircle className={cn(
                      'w-5 h-5',
                      healthSummary.level === 'warning' && 'text-sun-500',
                      healthSummary.level === 'danger' && 'text-coral-500',
                    )} />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-slate-800">健康小结</h3>
                  <p className="text-xs text-slate-500">{activeRange === '7d' ? '近7天' : activeRange === '30d' ? '近30天' : '近90天'}数据综合评估</p>
                </div>
              </div>
              <StatusBadge
                label={healthSummary.levelText}
                variant={
                  healthSummary.level === 'excellent' ? 'success' :
                  healthSummary.level === 'good' ? 'info' :
                  healthSummary.level === 'warning' ? 'warning' : 'error'
                }
              />
            </div>

            <p className="text-sm text-slate-600 mb-4">{healthSummary.levelDesc}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-cream-50">
                <p className="text-xs text-slate-500 mb-1">总测量次数</p>
                <p className="text-lg font-bold font-serif text-slate-800">{filteredMetrics.length} 次</p>
              </div>
              <div className="p-3 rounded-xl bg-coral-50">
                <p className="text-xs text-slate-500 mb-1">异常次数</p>
                <p className="text-lg font-bold font-serif text-coral-500">{healthSummary.abnormalCount} 次</p>
              </div>
            </div>

            {activeMetric === 'blood_pressure' ? (
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-coral-400"></span>
                    收缩压趋势
                  </span>
                  <span className={cn(
                    'font-medium flex items-center gap-1',
                    healthSummary.systolicTrend === 'up' && 'text-coral-500',
                    healthSummary.systolicTrend === 'down' && 'text-teal-500',
                    healthSummary.systolicTrend === 'stable' && 'text-slate-500',
                  )}>
                    {healthSummary.systolicTrend === 'up' && <TrendingUp className="w-4 h-4" />}
                    {healthSummary.systolicTrend === 'down' && <TrendingDown className="w-4 h-4" />}
                    {healthSummary.systolicTrend === 'stable' && <Minus className="w-4 h-4" />}
                    {healthSummary.systolicTrend === 'up' ? '偏高' : healthSummary.systolicTrend === 'down' ? '偏低' : '平稳'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                    舒张压趋势
                  </span>
                  <span className={cn(
                    'font-medium flex items-center gap-1',
                    healthSummary.diastolicTrend === 'up' && 'text-coral-500',
                    healthSummary.diastolicTrend === 'down' && 'text-teal-500',
                    healthSummary.diastolicTrend === 'stable' && 'text-slate-500',
                  )}>
                    {healthSummary.diastolicTrend === 'up' && <TrendingUp className="w-4 h-4" />}
                    {healthSummary.diastolicTrend === 'down' && <TrendingDown className="w-4 h-4" />}
                    {healthSummary.diastolicTrend === 'stable' && <Minus className="w-4 h-4" />}
                    {healthSummary.diastolicTrend === 'up' ? '偏高' : healthSummary.diastolicTrend === 'down' ? '偏低' : '平稳'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-cream-50 mb-4">
                <span className="text-sm text-slate-600">整体趋势</span>
                <span className={cn(
                  'font-medium flex items-center gap-1 text-sm',
                  healthSummary.trend === 'up' && 'text-coral-500',
                  healthSummary.trend === 'down' && 'text-teal-500',
                  healthSummary.trend === 'stable' && 'text-slate-500',
                )}>
                  {healthSummary.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                  {healthSummary.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                  {healthSummary.trend === 'stable' && <Minus className="w-4 h-4" />}
                  {healthSummary.trendText}
                </span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-sun-50 border border-sun-100">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-sun-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {healthSummary.tips.map((tip, idx) => (
                    <p key={idx} className="text-xs text-slate-700 leading-relaxed">{tip}</p>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-coral-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-coral-500" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-slate-800">异常记录</h3>
                <p className="text-xs text-slate-500">近期异常指标提醒</p>
              </div>
            </div>
            <span className="text-xs text-coral-500 font-medium">
              {abnormalMetrics.length}条
            </span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {Object.entries(groupedAbnormals).map(([dateKey, metrics]) => {
              const dateObj = new Date(dateKey);
              const month = dateObj.getMonth() + 1;
              const day = dateObj.getDate();
              const count = metrics.length;

              if (count > 1) {
                const detailParts: string[] = [];
                const highSystolic = metrics.filter((m) => m.type === 'blood_pressure' && m.value > 140).length;
                const highDiastolic = metrics.filter((m) => m.type === 'blood_pressure' && (m.value2 || 0) > 90).length;
                const highBp = metrics.filter((m) => m.type === 'blood_pressure' && m.status === 'high').length;
                const lowBp = metrics.filter((m) => m.type === 'blood_pressure' && m.status === 'low').length;
                const highBs = metrics.filter((m) => m.type === 'blood_sugar' && m.status === 'high').length;
                const lowBs = metrics.filter((m) => m.type === 'blood_sugar' && m.status === 'low').length;
                const highHr = metrics.filter((m) => m.type === 'heart_rate' && m.status === 'high').length;
                const lowHr = metrics.filter((m) => m.type === 'heart_rate' && m.status === 'low').length;
                const highTemp = metrics.filter((m) => m.type === 'temperature' && m.status === 'high').length;
                const lowTemp = metrics.filter((m) => m.type === 'temperature' && m.status === 'low').length;

                if (highSystolic > 0) detailParts.push(`收缩压偏高${highSystolic}次`);
                if (highDiastolic > 0) detailParts.push(`舒张压偏高${highDiastolic}次`);
                if (lowBp > 0 && highSystolic === 0 && highDiastolic === 0) detailParts.push(`血压偏低${lowBp}次`);
                if (highBs > 0) detailParts.push(`血糖偏高${highBs}次`);
                if (lowBs > 0) detailParts.push(`血糖偏低${lowBs}次`);
                if (highHr > 0) detailParts.push(`心率偏高${highHr}次`);
                if (lowHr > 0) detailParts.push(`心率偏低${lowHr}次`);
                if (highTemp > 0) detailParts.push(`体温偏高${highTemp}次`);
                if (lowTemp > 0) detailParts.push(`体温偏低${lowTemp}次`);

                if (detailParts.length === 0) {
                  detailParts.push(`${getHealthMetricLabel(metrics[0].type)}${metrics[0].status === 'high' ? '偏高' : '偏低'}${count}次`);
                }

                return (
                  <div
                    key={dateKey}
                    className="p-3 rounded-xl border bg-coral-50 border-coral-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-coral-700 text-sm">
                          {month}月{day}日 共{count}次异常
                        </p>
                        <p className="text-xs text-coral-600 mt-1">
                          （{detailParts.join('、')}）
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedDate(dateKey)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-coral-200 text-coral-600 text-xs font-medium hover:bg-coral-50 transition-colors"
                      >
                        <List className="w-3 h-3" />
                        查看当天
                      </button>
                    </div>
                  </div>
                );
              }

              const metric = metrics[0];
              return (
                <div
                  key={metric.id}
                  className={`p-3 rounded-xl border ${
                    metric.status === 'high'
                      ? 'bg-coral-50 border-coral-100'
                      : 'bg-sun-50 border-sun-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={metric.status === 'high' ? '偏高' : '偏低'}
                        variant={metric.status === 'high' ? 'error' : 'warning'}
                      />
                      <span className="font-medium text-slate-700 text-sm">
                        {getHealthMetricLabel(metric.type)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(metric.timestamp, 'month')} {formatDate(metric.timestamp, 'time')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <p
                      className={`text-xl font-bold font-serif ${getHealthMetricColor(metric.status)}`}
                    >
                      {metric.type === 'blood_pressure'
                        ? `${metric.value}/${metric.value2} ${metric.unit}`
                        : `${metric.value} ${metric.unit}`}
                    </p>
                    <button
                      onClick={() => setSelectedDate(new Date(metric.timestamp).toISOString().slice(0, 10))}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 text-xs font-medium hover:border-coral-200 hover:text-coral-600 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      查看当天全部测量
                    </button>
                  </div>
                </div>
              );
            })}
            {abnormalMetrics.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">暂无异常记录</div>
            )}
          </div>
        </Card>

        {selectedDate && (
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-slate-800">{selectedDate} 测量详情</h3>
                  <p className="text-xs text-slate-500">当天所有测量记录</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {dateMeasurements.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border ${
                    m.status === 'normal'
                      ? 'bg-cream-50 border-cream-100'
                      : m.status === 'high'
                      ? 'bg-coral-50 border-coral-100'
                      : 'bg-sun-50 border-sun-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        m.type === 'blood_pressure' ? 'bg-rose-100 text-rose-700' :
                        m.type === 'blood_sugar' ? 'bg-violet-100 text-violet-700' :
                        m.type === 'heart_rate' ? 'bg-pink-100 text-pink-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {getHealthMetricLabel(m.type)}
                      </span>
                      <StatusBadge
                        label={m.status === 'normal' ? '正常' : m.status === 'high' ? '偏高' : '偏低'}
                        variant={m.status === 'normal' ? 'success' : m.status === 'high' ? 'error' : 'warning'}
                      />
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(m.timestamp, 'time')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className={`text-xl font-bold font-serif ${getHealthMetricColor(m.status)}`}>
                      {m.type === 'blood_pressure'
                        ? `${m.value}/${m.value2} ${m.unit}`
                        : `${m.value} ${m.unit}`}
                    </p>
                  </div>
                </div>
              ))}
              {dateMeasurements.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">当天暂无测量记录</div>
              )}
            </div>
          </Card>
        )}
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-slate-800">体检报告</h3>
              <p className="text-xs text-slate-500">历史体检记录</p>
            </div>
          </div>
          <button className="text-coral-500 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            上传报告 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">日期</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">报告类型</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">体检医院</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">状态</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-slate-50 hover:bg-cream-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                      </div>
                      <span className="text-sm text-slate-700">{report.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-700">{report.type}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{report.hospital}</td>
                  <td className="py-4 px-4">
                    <StatusBadge
                      label={report.status}
                      variant={report.status === '正常' ? 'success' : 'warning'}
                    />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-coral-500 hover:text-coral-600 text-sm font-medium">
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-serif text-lg font-semibold text-slate-800">
              详细记录
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
                最近{recentMetrics.length}条 {getHealthMetricLabel(activeMetric)}测量记录
              </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">时间</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">指标</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">数值</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">状态</th>
              </tr>
            </thead>
            <tbody>
              {recentMetrics.map((metric, idx) => (
                <tr
                  key={metric.id}
                  className={`${idx < recentMetrics.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-cream-50 transition-colors`}
                >
                  <td className="py-3.5 px-4 text-sm text-slate-600">
                    {formatDate(metric.timestamp)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-sm font-medium text-slate-700">
                      {getHealthMetricLabel(metric.type)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-sm font-bold font-serif ${getHealthMetricColor(
                        metric.status
                      )}`}
                    >
                      {metric.type === 'blood_pressure'
                        ? `${metric.value}/${metric.value2} ${metric.unit}`
                        : `${metric.value} ${metric.unit}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      label={
                        metric.status === 'normal'
                          ? '正常'
                          : metric.status === 'high'
                          ? '偏高'
                          : '偏低'
                      }
                      variant={
                        metric.status === 'normal'
                          ? 'success'
                          : metric.status === 'high'
                          ? 'error'
                          : 'warning'
                      }
                      pulse={metric.status !== 'normal'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
