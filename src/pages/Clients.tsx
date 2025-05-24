
import React, { useState, useMemo } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClientCard from '../components/ui/ClientCard';
import AddClientModal from '../components/AddClientModal';
import { mockClients } from '../types';
import { Client } from '../types';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddClient = (newClient: Client) => {
    console.log('Adding new client:', newClient);
    setClients(prev => [...prev, newClient]);
  };

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {
      return clients;
    }

    const query = searchQuery.toLowerCase();
    return clients.filter(client => 
      client.clientName.toLowerCase().includes(query) ||
      client.industry.toLowerCase().includes(query) ||
      client.contactName.toLowerCase().includes(query) ||
      client.contactEmail.toLowerCase().includes(query) ||
      client.status.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search clients by name, industry, contact, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {filteredClients.length === 0 && searchQuery && (
        <div className="text-center text-gray-500 py-8">
          No clients found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default Clients;
