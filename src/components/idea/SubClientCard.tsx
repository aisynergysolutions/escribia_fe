
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { SubClient } from '@/types/interfaces';

interface SubClientCardProps {
  subClient: SubClient;
}

const SubClientCard: React.FC<SubClientCardProps> = ({ subClient }) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={subClient.profileImage} alt={subClient.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{subClient.name}</h3>
            <p className="text-sm text-gray-600">{subClient.role}</p>
            <p className="text-xs text-blue-600 mt-1">Creating post for this account</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubClientCard;
