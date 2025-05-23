
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientCard from '../components/ui/ClientCard';
import { mockClients } from '../types';

const Clients = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
};

export default Clients;
