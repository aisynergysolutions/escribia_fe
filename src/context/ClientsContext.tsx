import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, getDocs, setDoc, doc, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export type ClientCard = {
    id: string;
    name: string;
    oneLiner: string;
    status: string;
    updatedAt: number;
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
    deleteClient: (id: string) => Promise<void>;
    getClientDetails: (clientId: string) => Promise<ClientDetails | null>;
    refreshClientDetails: (clientId: string) => Promise<ClientDetails | null>;
    clearClientDetails: () => void;
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
    deleteClient: async () => { },
    getClientDetails: async () => null,
    refreshClientDetails: async () => null,
    clearClientDetails: () => { },
    clientDetails: null,
    clientDetailsLoading: false,
    clientDetailsError: null,
});

export const useClients = () => useContext(ClientsContext);

export const ClientsProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [clients, setClients] = useState<ClientCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
    const [clientDetailsLoading, setClientDetailsLoading] = useState(false);
    const [clientDetailsError, setClientDetailsError] = useState<string | null>(null);
    // Track which client we've loaded to avoid unnecessary refetches
    const [loadedClientId, setLoadedClientId] = useState<string | null>(null);

    // Get the current agency ID from the authenticated user
    const agencyId = currentUser?.uid;

    const fetchClients = async () => {
        if (!agencyId) {
            console.warn('[ClientsContext] No agency ID available, skipping fetch');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('[ClientsContext] Fetching clients for agency:', agencyId);
            const clientsCol = collection(db, 'agencies', agencyId, 'clients');
            const snapshot = await getDocs(clientsCol);
            const clientsList: ClientCard[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.clientName || '',
                    oneLiner: data.oneLiner || '',
                    status: data.status || '',
                    updatedAt: typeof data.updatedAt === 'number'
                        ? data.updatedAt
                        : (data.updatedAt?.seconds ? data.updatedAt.seconds : 0),
                    onboarding_link: data.onboarding_link || '',
                };
            });

            console.log('[ClientsContext] Fetched clients:', clientsList.length);
            setClients(clientsList);
        } catch (err: any) {
            console.error('[ClientsContext] Error fetching clients:', err);
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
        if (!agencyId) {
            console.error('[ClientsContext] No agency ID available for adding client');
            setError('No agency ID available');
            return;
        }

        try {
            const clientDocRef = doc(db, 'agencies', agencyId, 'clients', id);

            console.log('[ClientsContext] Adding client for agency:', agencyId);
            await setDoc(clientDocRef, {
                onboarding_link,
                status: 'onboarding',
                updatedAt: serverTimestamp(),
                clientName,
                agencyId: agencyId,
                createdAt: serverTimestamp(),
            });

            // Re-fetch clients to update UI
            await fetchClients();
        } catch (err: any) {
            console.error('[ClientsContext] Error adding client:', err);
            setError(err.message || 'Failed to add client');
        }
    };

    const deleteClient = async (id: string) => {
        if (!agencyId) {
            console.error('[ClientsContext] No agency ID available for deleting client');
            setError('No agency ID available');
            return;
        }

        try {
            const clientDocRef = doc(db, 'agencies', agencyId, 'clients', id);

            console.log('[ClientsContext] Deleting client for agency:', agencyId);
            await deleteDoc(clientDocRef);

            // Remove the client from local state without refetching
            setClients(prev => prev.filter(client => client.id !== id));

            // Clear client details if it's the same client
            if (clientDetails && clientDetails.id === id) {
                setClientDetails(null);
                setLoadedClientId(null);
            }
        } catch (err: any) {
            console.error('[ClientsContext] Error deleting client:', err);
            setError(err.message || 'Failed to delete client');
        }
    };

    const getClientDetails = async (clientId: string): Promise<ClientDetails | null> => {
        if (!agencyId) {
            console.error('[ClientsContext] No agency ID available for getting client details');
            setClientDetailsError('No agency ID available');
            return null;
        }

        // If we already have this client's details loaded, return them immediately
        if (clientDetails && loadedClientId === clientId) {
            console.log('[ClientsContext] Returning cached client details for:', clientId);
            return clientDetails;
        }

        // Only show loading state if we don't have any client details or it's a different client
        const shouldShowLoading = !clientDetails || loadedClientId !== clientId;

        if (shouldShowLoading) {
            setClientDetailsLoading(true);
        }
        setClientDetailsError(null);

        try {
            const clientDocPath = `agencies/${agencyId}/clients/${clientId}`;
            console.log('[ClientsContext] Fetching client details from Firestore path:', clientDocPath);

            const clientDocRef = doc(db, 'agencies', agencyId, 'clients', clientId);
            const clientSnap = await getDoc(clientDocRef);

            if (!clientSnap.exists()) {
                console.log('[ClientsContext] No client found at:', clientDocPath);
                setClientDetails(null);
                setLoadedClientId(null);
                setClientDetailsLoading(false);
                return null;
            }

            const data = clientSnap.data();
            console.log('[ClientsContext] Firestore client document data:', data);

            const details: ClientDetails = {
                id: clientId,
                agencyId: data.agencyId || agencyId,
                profileImageUrl: data.profileImageUrl,
                clientName: data.clientName || '',
                createdAt: data.createdAt || '',
                updatedAt: data.updatedAt || '',
                onboarding_link: data.onboarding_link,
                oneLiner: data.oneLiner,
                status: data.status || '',
                hard_facts: data.hard_facts || {},
            };

            console.log('[ClientsContext] Fetched client details for agency:', agencyId);
            setClientDetails(details);
            setLoadedClientId(clientId);
            setClientDetailsLoading(false);
            return details;
        } catch (err: any) {
            setClientDetailsError(err.message || 'Failed to fetch client details');
            setClientDetails(null);
            setLoadedClientId(null);
            setClientDetailsLoading(false);
            console.error('[ClientsContext] Error fetching client details:', err);
            return null;
        }
    };

    // Force refresh client details (ignores cache)
    const refreshClientDetails = async (clientId: string): Promise<ClientDetails | null> => {
        if (!agencyId) {
            console.error('[ClientsContext] No agency ID available for refreshing client details');
            setClientDetailsError('No agency ID available');
            return null;
        }

        console.log('[ClientsContext] Force refreshing client details for:', clientId);

        // Clear current cache and force reload
        setLoadedClientId(null);
        setClientDetails(null);
        setClientDetailsLoading(true);
        setClientDetailsError(null);

        try {
            const clientDocPath = `agencies/${agencyId}/clients/${clientId}`;
            const clientDocRef = doc(db, 'agencies', agencyId, 'clients', clientId);
            const clientSnap = await getDoc(clientDocRef);

            if (!clientSnap.exists()) {
                console.log('[ClientsContext] No client found at:', clientDocPath);
                setClientDetails(null);
                setLoadedClientId(null);
                setClientDetailsLoading(false);
                return null;
            }

            const data = clientSnap.data();
            const details: ClientDetails = {
                id: clientId,
                agencyId: data.agencyId || agencyId,
                profileImageUrl: data.profileImageUrl,
                clientName: data.clientName || '',
                createdAt: data.createdAt || '',
                updatedAt: data.updatedAt || '',
                onboarding_link: data.onboarding_link,
                oneLiner: data.oneLiner,
                status: data.status || '',
                hard_facts: data.hard_facts || {},
            };

            console.log('[ClientsContext] Force refreshed client details for agency:', agencyId);
            setClientDetails(details);
            setLoadedClientId(clientId);
            setClientDetailsLoading(false);
            return details;
        } catch (err: any) {
            setClientDetailsError(err.message || 'Failed to refresh client details');
            setClientDetails(null);
            setLoadedClientId(null);
            setClientDetailsLoading(false);
            console.error('[ClientsContext] Error refreshing client details:', err);
            return null;
        }
    };

    // Clear client details cache (useful when navigating away from client pages)
    const clearClientDetails = () => {
        console.log('[ClientsContext] Clearing client details cache');
        setClientDetails(null);
        setLoadedClientId(null);
        setClientDetailsError(null);
        setClientDetailsLoading(false);
    };

    // Fetch clients when agency ID becomes available
    useEffect(() => {
        if (agencyId && currentUser?.emailVerified) {
            console.log('[ClientsContext] Agency ID available, fetching clients');
            fetchClients();
        } else {
            console.log('[ClientsContext] No agency ID or user not verified, clearing clients');
            setClients([]);
            setError(null);
        }
    }, [agencyId, currentUser?.emailVerified]);

    return (
        <ClientsContext.Provider value={{
            clients,
            loading,
            error,
            fetchClients,
            addClient,
            deleteClient,
            getClientDetails,
            refreshClientDetails,
            clearClientDetails,
            clientDetails,
            clientDetailsLoading,
            clientDetailsError,
        }}>
            {children}
        </ClientsContext.Provider>
    );
};