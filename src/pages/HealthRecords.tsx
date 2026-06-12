import { useState } from 'react';
import {
  Activity,
  FileText,
  AlertCircle,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import HealthTrendChart from '../components/charts/HealthTrendChart';
import {
  formatDate,
  getHealthMetricLabel,
  getHealthMetricColor,
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

  const rangeDays = activeRange === '7d' ? 7 : activeRange === '30d' ? 30 : 90;
  const now = Date.now();
  const rangeMs = rangeDays * 24 * 60 * 60 * 1000;

  const filteredMetrics = healthMetrics.filter(
    (m) => m.type === activeMetric && now - new Date(m.timestamp).getTime() <= rangeMs
  );
  const recentMetrics = filteredMetrics.slice(-10).reverse();
  const abnormalMetrics = healthMetrics.filter(
    (m) => m.status !== 'normal' && now - new Date(m.timestamp).getTime() <= rangeMs
  ).slice(-8).reverse();

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
          <HealthTrendChart data={healthMetrics} type={activeMetric} height={340} showLegend />
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
            {abnormalMetrics.map((metric) => (
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
                  <Activity className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
            {abnormalMetrics.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">暂无异常记录</div>
            )}
          </div>
        </Card>
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
