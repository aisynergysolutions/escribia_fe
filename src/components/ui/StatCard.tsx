
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  className = "" 
}) => {
  return (
    <Card className={`bg-white rounded-[14px] shadow-[0_2px_6px_rgba(0,0,0,0.06)] border-0 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-neutral-900">
                {value}
              </span>
              {change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  trend === 'up' ? 'text-mint-600' : 'text-orange-500'
                }`}>
                  {trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {change}
                </div>
              )}
            </div>
          </div>
          {icon && (
            <div className="text-primary-600 opacity-80">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
