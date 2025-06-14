
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockClients } from '../../types';

interface ResourcesSectionProps {
  clientId: string;
}

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Resources</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </div>
      <div className="text-center text-gray-500 py-12">
        <p>Resource management for {client?.clientName} will be implemented here.</p>
        <p className="text-sm mt-2">Upload brand assets, guidelines, and other resources.</p>
      </div>
    </div>
  );
};

export default ResourcesSection;
