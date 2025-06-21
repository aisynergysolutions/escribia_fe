
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Linkedin, User, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client } from '../../types/interfaces';

interface MainProfileCardProps {
  client: Client;
  clientId: string;
}

const MainProfileCard: React.FC<MainProfileCardProps> = ({ client, clientId }) => {
  const navigate = useNavigate();
  const linkedinConnected = true; // Mock data
  const linkedinAccountName = client.clientName;

  const handleCardClick = () => {
    navigate(`/clients/${clientId}/profiles/company-1`);
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Main Profile</h2>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Profile Avatar */}
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarImage src={client.profileImage} />
              <AvatarFallback>
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>

            {/* Profile Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">{client.clientName}</h3>
                <Badge variant="outline" className="text-xs">Company Account</Badge>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {client.brandBriefSummary || "Leading technology solutions provider specializing in enterprise software."}
              </p>

              {/* LinkedIn Status */}
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                {linkedinConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Connected as {linkedinAccountName}</span>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      ✓ Connected
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Not connected</span>
                    <Button variant="outline" size="sm">
                      <Linkedin className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainProfileCard;
