
import React, { useState } from 'react';
import { User, Linkedin, Edit3, Save, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { SubClient } from '../../types/interfaces';

interface SubClientCardProps {
  subClient: SubClient;
  onUpdate: (subClient: SubClient) => void;
  onDelete: (subClientId: string) => void;
  isCompany?: boolean;
}

const SubClientCard: React.FC<SubClientCardProps> = ({ 
  subClient, 
  onUpdate, 
  onDelete,
  isCompany = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: subClient.name,
    role: subClient.role,
    writingStyle: subClient.writingStyle || '',
    customInstructions: subClient.customInstructions || ''
  });
  const [linkedinConnected, setLinkedinConnected] = useState(subClient.linkedinConnected);

  const handleSave = () => {
    const updatedSubClient: SubClient = {
      ...subClient,
      ...formData,
      linkedinConnected
    };
    onUpdate(updatedSubClient);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: subClient.name,
      role: subClient.role,
      writingStyle: subClient.writingStyle || '',
      customInstructions: subClient.customInstructions || ''
    });
    setLinkedinConnected(subClient.linkedinConnected);
    setIsEditing(false);
  };

  const handleLinkedinToggle = () => {
    setLinkedinConnected(!linkedinConnected);
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={subClient.profileImage} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              {!isEditing ? (
                <>
                  <h3 className="font-medium">{subClient.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {subClient.role}
                  </Badge>
                </>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Name"
                    className="h-8"
                  />
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Role (e.g., CEO, CTO)"
                    className="h-8"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                {!isCompany && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDelete(subClient.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* LinkedIn Integration */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">LinkedIn Integration</h4>
          <div
            className={cn(
              "w-full rounded-lg bg-secondary py-3 px-4 flex transition-colors hover:bg-secondary/80",
              !linkedinConnected ? "justify-center items-center" : "items-center"
            )}
          >
            {!linkedinConnected ? (
              <Button
                onClick={handleLinkedinToggle}
                type="button"
                variant="default"
                size="sm"
              >
                <Linkedin className="mr-2 h-4 w-4" />
                Connect LinkedIn
              </Button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                  <span className="font-medium">
                    Connected as {subClient.linkedinAccountName || subClient.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Expires on {subClient.linkedinExpiryDate || 'June 15, 2025'}
                  </span>
                </div>
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={handleLinkedinToggle}
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Writing Style */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Writing Style</h4>
          {!isEditing ? (
            <p className="text-sm">{subClient.writingStyle || "Not specified"}</p>
          ) : (
            <Input
              value={formData.writingStyle}
              onChange={(e) => setFormData(prev => ({ ...prev, writingStyle: e.target.value }))}
              placeholder="e.g., Professional and authoritative"
            />
          )}
        </div>

        {/* Custom Instructions */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Custom AI Instructions</h4>
          {!isEditing ? (
            <p className="text-sm">{subClient.customInstructions || "No custom instructions"}</p>
          ) : (
            <Textarea
              value={formData.customInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, customInstructions: e.target.value }))}
              placeholder="Enter custom AI instructions for this person..."
              rows={3}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubClientCard;
