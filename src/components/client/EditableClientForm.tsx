
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { Client } from '../../types/interfaces';

interface EditableClientFormProps {
  client: Client;
  onSave: (updatedClient: Partial<Client>) => void;
  onCancel: () => void;
}

const EditableClientForm: React.FC<EditableClientFormProps> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    clientName: client.clientName,
    status: client.status,
    writingStyle: client.writingStyle || '',
    brandBriefSummary: client.brandBriefSummary || '',
  });

  const handleSave = () => {
    onSave(formData);
  };

  const formatDate = (seconds: number) => {
    if (!seconds) return 'N/A';
    return new Date(seconds * 1000).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Client Information</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName" className="text-sm font-medium text-gray-500">
              Client Name
            </Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="status" className="text-sm font-medium text-gray-500">
              Status
            </Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Client['status'] }))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created At</h3>
            <div className="mt-1 flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formatDate(client.createdAt.seconds)}</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Update</h3>
            <div className="mt-1 flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{formatDate(client.updatedAt.seconds)}</span>
            </div>
          </div>
          <div>
            <Label htmlFor="writingStyle" className="text-sm font-medium text-gray-500">
              Writing Style
            </Label>
            <Input
              id="writingStyle"
              value={formData.writingStyle}
              onChange={(e) => setFormData(prev => ({ ...prev, writingStyle: e.target.value }))}
              placeholder="Enter writing style"
              className="mt-1"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="brandBriefSummary" className="text-sm font-medium text-gray-500">
              Brand Brief Summary
            </Label>
            <Textarea
              id="brandBriefSummary"
              value={formData.brandBriefSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, brandBriefSummary: e.target.value }))}
              placeholder="Enter brand brief summary"
              className="mt-1 h-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableClientForm;
