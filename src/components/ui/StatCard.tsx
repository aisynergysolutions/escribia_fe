
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  description, 
  className 
}) => {
  const isPositive = change && change.startsWith('+');
  const isNegative = change && change.startsWith('-');

  return (
    <Card className={`bg-white border border-slate-200 hover:shadow-sm transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">{title}</span>
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          
          {change && (
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : 
                isNegative ? 'text-red-600' : 'text-slate-600'
              }`}>
                {change}
              </span>
              <span className="text-sm text-slate-500">vs last month</span>
            </div>
          )}
          
          {description && !change && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
