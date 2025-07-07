import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, getDocs, setDoc, doc, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ClientCard = {
    id: string;
    name: string;
    oneLiner: string;
    status: string;
    lastUpdated: number;
    onboarding_link?: string;
};

export type ClientDetails = {
  id: string;
  agencyId: string;
  profileImageUrl?: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  onboarding_link?: string;
  oneLiner?: string;
  status: string;
  hard_facts?: {
    competitors?: string[];
    contentGoals?: {
      brandAwareness?: number;
      leadGeneration?: number;
      talentAttraction?: number;
      thoughtLeadership?: number;
    };
    foundationDate?: string;
    linkedinURL?: string;
    locationHQ?: string;
    mainOfferings?: string;
    mission?: string;
    siteURL?: string;
    size?: string;
    targetAudience?: string;
  };

};

type ClientsContextType = {
    clients: ClientCard[];
    loading: boolean;
    error: string | null;
    fetchClients: () => Promise<void>;
    addClient: (client: {
        id: string;
        clientName: string;
        onboarding_link: string;
    }) => Promise<void>;
    deleteClient: (id: string) => Promise<void>; // <-- Add this
    getClientDetails: (clientId: string) => Promise<ClientDetails | null>;
    clientDetails: ClientDetails | null;
    clientDetailsLoading: boolean;
    clientDetailsError: string | null;
};

const ClientsContext = createContext<ClientsContextType>({
    clients: [],
    loading: false,
    error: null,
    fetchClients: async () => { },
    addClient: async () => { },
    deleteClient: async () => { }, // <-- Add this
    getClientDetails: async () => null,
    clientDetails: null,
    clientDetailsLoading: false,
    clientDetailsError: null,
});

export const useClients = () => useContext(ClientsContext);

export const ClientsProvider = ({ children }: { children: ReactNode }) => {
    const [clients, setClients] = useState<ClientCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
    const [clientDetailsLoading, setClientDetailsLoading] = useState(false);
    const [clientDetailsError, setClientDetailsError] = useState<string | null>(null);

    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            const clientsCol = collection(db, 'agencies', 'agency1', 'clients');
            const snapshot = await getDocs(clientsCol);
            const clientsList: ClientCard[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.clientName || '',
                    oneLiner: data.oneLiner || '',
                    status: data.status || '',
                    lastUpdated: typeof data.lastUpdated === 'number'
                        ? data.lastUpdated
                        : (data.lastUpdated?.seconds ? data.lastUpdated.seconds : 0),
                    onboarding_link: data.onboarding_link || '',
                };
            });
            setClients(clientsList);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch clients');
            setClients([]);
        }
        setLoading(false);
    };

    const addClient = async ({
        id,
        clientName,
        onboarding_link,
    }: {
        id: string;
        clientName: string;
        onboarding_link: string;
    }) => {
        try {
            const clientDocRef = doc(db, 'agencies', 'agency1', 'clients', id);
            await setDoc(clientDocRef, {
                onboarding_link,
                status: 'onboarding',
                lastUpdated: serverTimestamp(),
                clientName,
            });
            // Optionally, re-fetch clients to update UI
            await fetchClients();
        } catch (err) {
            console.error('[ClientsContext] Error adding client:', err);
        }
    };

    const deleteClient = async (id: string) => {
        try {
            const clientDocRef = doc(db, 'agencies', 'agency1', 'clients', id);
            await deleteDoc(clientDocRef);
            // Remove the client from local state without refetching
            setClients(prev => prev.filter(client => client.id !== id));
        } catch (err) {
            console.error('[ClientsContext] Error deleting client:', err);
        }
    };

    const getClientDetails = async (clientId: string): Promise<ClientDetails | null> => {
        setClientDetailsLoading(true);
        setClientDetailsError(null);
        try {
            const clientDocPath = `agencies/agency1/clients/${clientId}`;
            console.log('[ClientsContext] Fetching client details from Firestore path:', clientDocPath);
            const clientDocRef = doc(db, 'agencies', 'agency1', 'clients', clientId);
            const clientSnap = await getDoc(clientDocRef);
            if (!clientSnap.exists()) {
                console.log('[ClientsContext] No client found at:', clientDocPath);
                setClientDetails(null);
                setClientDetailsLoading(false);
                return null;
            }
            const data = clientSnap.data();
            console.log('[ClientsContext] Firestore client document data:', data);
            const details: ClientDetails = {
                id: clientId,
                agencyId: data.agencyId || 'agency1',
                clientName: data.clientName || '',
                createdAt: data.createdAt || '',
                updatedAt: data.updatedAt || '',
                onboarding_link: data.onboarding_link,
                oneLiner: data.oneLiner,
                status: data.status || '',
                hard_facts: data.hard_facts || {},
            };
            setClientDetails(details);
            setClientDetailsLoading(false);
            return details;
        } catch (err: any) {
            setClientDetailsError(err.message || 'Failed to fetch client details');
            setClientDetails(null);
            setClientDetailsLoading(false);
            console.error('[ClientsContext] Error fetching client details:', err);
            return null;
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <ClientsContext.Provider value={{
          clients,
          loading,
          error,
          fetchClients,
          addClient,
          deleteClient,
          getClientDetails,
          clientDetails,
          clientDetailsLoading,
          clientDetailsError,
        }}>
            {children}
        </ClientsContext.Provider>
    );
};