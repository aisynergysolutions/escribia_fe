import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
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
};

const ClientsContext = createContext<ClientsContextType>({
    clients: [],
    loading: false,
    error: null,
    fetchClients: async () => { },
    addClient: async () => { },
});

export const useClients = () => useContext(ClientsContext);

export const ClientsProvider = ({ children }: { children: ReactNode }) => {
    const [clients, setClients] = useState<ClientCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const allowedStatuses = ['onboarding', 'active', 'paused', 'archived'] as const;
    type StatusType = typeof allowedStatuses[number];

    const fetchClients = async () => {
        // console.log('[ClientsContext] Starting fetchClients...');
        setLoading(true);
        setError(null);
        try {
            const clientsCol = collection(db, 'agencies', 'agency_1', 'clients');
            const snapshot = await getDocs(clientsCol);
            // console.log('[ClientsContext] Snapshot size:', snapshot.size);
            if (snapshot.empty) {
                console.warn('[ClientsContext] No client documents found in Firestore.');
            }
            // console.log('[ClientsContext] Fetched client docs:', snapshot.docs.map(d => d.id));
            const clientsList: ClientCard[] = snapshot.docs.map(doc => {
                const data = doc.data();
                // console.log('[ClientsContext] Client doc data:', data);
                return {
                    id: doc.id,
                    name: data.businessName || '',
                    oneLiner: data.oneLiner || '',
                    status: allowedStatuses.includes(data.status) ? data.status as StatusType : 'active',
                    lastUpdated: typeof data.lastUpdated === 'number'
                        ? data.lastUpdated
                        : (data.lastUpdated?.seconds ? data.lastUpdated.seconds : 0),
                    onboarding_link: data.onboarding_link || '',
                };
            });
            setClients(clientsList);
            // console.log('[ClientsContext] Clients list after mapping:', clientsList);
        } catch (err: any) {
            console.error('[ClientsContext] Error fetching clients:', err);
            setError(err.message || 'Failed to fetch clients');
            setClients([]);
        }
        setLoading(false);
        // console.log('[ClientsContext] fetchClients finished.');
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

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <ClientsContext.Provider value={{ clients, loading, error, fetchClients, addClient }}>
            {children}
        </ClientsContext.Provider>
    );
};