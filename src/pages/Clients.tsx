
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientCard from '../components/ui/ClientCard';
import AddClientModal from '../components/AddClientModal';
import { mockClients } from '../types';
import { Client } from '../types';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);

  const handleAddClient = (newClient: Client) => {
    console.log('Adding new client:', newClient);
    setClients(prev => [...prev, newClient]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients</h1>
        <AddClientModal onAddClient={handleAddClient}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        </AddClientModal>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
};

export default Clients;
