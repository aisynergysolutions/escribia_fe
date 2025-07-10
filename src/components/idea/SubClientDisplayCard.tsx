
import React from 'react';
import { Building, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SubClientDisplayCardProps {
  subClient: {
    name: string;
    role: string;
    profileImage?: string;
  };
}

const SubClientDisplayCard: React.FC<SubClientDisplayCardProps> = ({ subClient }) => {
const isCompany = subClient.role.toLowerCase().includes('company');
  
  return (
    <Card className="border-l-4 border-l-indigo-500">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={subClient.profileImage} />
            <AvatarFallback className="bg-indigo-100">
              {isCompany ? (
                <Building className="h-6 w-6 text-indigo-600" />
              ) : (
                <User className="h-6 w-6 text-indigo-600" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{subClient.name}</h3>
              <Badge variant="outline" className="text-xs">
                {subClient.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isCompany 
                ? `Post generated for ${subClient.name}`
                : `Post generated for ${subClient.name} as ${subClient.role}`
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubClientDisplayCard;
