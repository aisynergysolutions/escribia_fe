import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '../common/StatusBadge';
import OnboardingStatusModal from '../OnboardingStatusModal';
import { Client } from '../../types';
import { Link } from 'react-router-dom';
import { formatCardDate } from '../../utils/dateUtils';

interface ClientCardProps {
  client: Client;
  onDeleteClient?: (clientId: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = React.memo(({ client, onDeleteClient }) => {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (client.status === 'onboarding') {
      e.preventDefault();
      setShowOnboardingModal(true);
    }
  };

  const handleDeleteClient = () => {
    if (onDeleteClient) {
      onDeleteClient(client.id);
    }
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (client.status === 'onboarding') {
      return (
        <div className="block h-full cursor-pointer" onClick={handleCardClick}>
          {children}
        </div>
      );
    }

    return (
      <Link to={`/clients/${client.id}`} className="block h-full">
        {children}
      </Link>
    );
  };

  return (
    <>
      <CardWrapper>
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
      </CardWrapper>

      <OnboardingStatusModal
        open={showOnboardingModal}
        onOpenChange={setShowOnboardingModal}
        clientName={client.clientName}
        onboardingLink={client.onboarding_link}
        clientId={client.id}
      />
    </>
  );
});

ClientCard.displayName = 'ClientCard';

export default ClientCard;
