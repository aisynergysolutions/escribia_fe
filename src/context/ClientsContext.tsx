import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, getDocs, setDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ClientCard = {
    id: string;
    name: string;
    oneLiner: string;
    status: string;
    lastUpdated: number;
    onboarding_link?: string;
};

type ClientsContextType = {
    clients: ClientCard[];
    loading: boolean;
    error: string | null;
    fetchClients: () => Promise<void>;
    addClient: (client: {
        id: string;
        businessName: string;
        onboarding_link: string;
    }) => Promise<void>;
    deleteClient: (id: string) => Promise<void>; // <-- Add this
};

const ClientsContext = createContext<ClientsContextType>({
    clients: [],
    loading: false,
    error: null,
    fetchClients: async () => { },
    addClient: async () => { },
    deleteClient: async () => { }, // <-- Add this
});

export const useClients = () => useContext(ClientsContext);

export const ClientsProvider = ({ children }: { children: ReactNode }) => {
    const [clients, setClients] = useState<ClientCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            const clientsCol = collection(db, 'agencies', 'agency_1', 'clients');
            const snapshot = await getDocs(clientsCol);
            const clientsList: ClientCard[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.businessName || '',
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
        businessName,
        onboarding_link,
    }: {
        id: string;
        businessName: string;
        onboarding_link: string;
    }) => {
        try {
            const clientDocRef = doc(db, 'agencies', 'agency_1', 'clients', id);
            await setDoc(clientDocRef, {
                onboarding_link,
                status: 'onboarding',
                lastUpdated: serverTimestamp(),
                businessName,
            });
            // Optionally, re-fetch clients to update UI
            await fetchClients();
        } catch (err) {
            console.error('[ClientsContext] Error adding client:', err);
        }
    };

    const deleteClient = async (id: string) => {
        try {
            const clientDocRef = doc(db, 'agencies', 'agency_1', 'clients', id);
            await deleteDoc(clientDocRef);
            // Remove the client from local state without refetching
            setClients(prev => prev.filter(client => client.id !== id));
        } catch (err) {
            console.error('[ClientsContext] Error deleting client:', err);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <ClientsContext.Provider value={{ clients, loading, error, fetchClients, addClient, deleteClient }}>
            {children}
        </ClientsContext.Provider>
    );
};