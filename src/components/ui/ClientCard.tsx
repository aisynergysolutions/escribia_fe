
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '../common/StatusBadge';
import { Client } from '../../types';
import { Link } from 'react-router-dom';
import { formatCardDate } from '../../utils/dateUtils';

interface ClientCardProps {
  client: Client;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  return (
    <Link to={`/clients/${client.id}`} className="block h-full">
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-medium truncate flex-1 min-w-0" title={client.clientName}>
              {client.clientName}
            </CardTitle>
            <StatusBadge status={client.status} type="client" className="flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-gray-600 mb-2 line-clamp-2 flex-1">
            {client.brandBriefSummary || 'No summary available'}
          </p>
          <div className="text-xs text-gray-500 mt-auto">
            {formatCardDate(client.updatedAt, 'Last updated')}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ClientCard;
