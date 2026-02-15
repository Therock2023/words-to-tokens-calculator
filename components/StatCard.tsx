
import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
};

export default StatCard;
