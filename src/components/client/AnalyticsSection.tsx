
import React from 'react';
import { BarChart } from 'lucide-react';
import { mockClients } from '../../types';

interface AnalyticsSectionProps {
  clientId: string;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="text-center text-gray-500 py-12">
        <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Analytics dashboard for {client?.clientName} will be implemented here.</p>
        <p className="text-sm mt-2">Track engagement, reach, and content performance.</p>
      </div>
    </div>
  );
};

export default AnalyticsSection;
