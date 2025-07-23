import { useEffect } from 'react';
import { useClients } from '@/context/ClientsContext';

/**
 * Hook to get client details with smart caching
 * 
 * Features:
 * - Only triggers loading state for first-time loads or different clients
 * - Returns cached data immediately if available for the same client
 * - Prevents "blinking" loading states when navigating between client sections
 * 
 * @param clientId - The client ID to fetch details for
 * @returns Object with clientDetails, isLoading, and error states
 */
export const useClientDetails = (clientId: string | undefined) => {
  const { getClientDetails, clientDetails, clientDetailsLoading, clientDetailsError } = useClients();

  useEffect(() => {
    if (clientId) {
      // Only fetch if we don't already have this client's details
      if (!clientDetails || clientDetails.id !== clientId) {
        console.log('[useClientDetails] Fetching client details for:', clientId);
        getClientDetails(clientId);
      } else {
        console.log('[useClientDetails] Using cached client details for:', clientId);
      }
    }
  }, [clientId, clientDetails?.id, getClientDetails]);

  // Only show loading if we're actually loading AND don't have the right client data
  const isLoading = clientDetailsLoading && (!clientDetails || clientDetails.id !== clientId);

  return {
    clientDetails: clientDetails?.id === clientId ? clientDetails : null,
    isLoading,
    error: clientDetailsError,
  };
};
