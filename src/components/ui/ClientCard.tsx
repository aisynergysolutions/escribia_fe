
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from '../../types';
import { Link } from 'react-router-dom';

interface ClientCardProps {
  client: Client;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'onboarding':
      return 'bg-blue-100 text-blue-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return '';
  }
};

const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
  return new Date(timestamp.seconds * 1000).toLocaleDateString();
};

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  return (
    <Link to={`/clients/${client.id}`}>
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">{client.clientName}</CardTitle>
            <Badge className={`${getStatusColor(client.status)}`}>
              {client.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {client.brandBriefSummary || 'No summary available'}
          </p>
          <div className="text-xs text-gray-500">
            Last updated: {formatDate(client.updatedAt)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ClientCard;
