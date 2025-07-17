import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export type TimeslotData = {
  predefinedTimeSlots: string[];
  activeDays: string[];
  isInitialized: boolean; // Add flag to track if we've attempted to load data
};

type EventsContextType = {
  timeslotData: TimeslotData | null;
  loadingTimeslotData: boolean;
  fetchTimeslotData: (clientId: string) => Promise<void>;
  updateTimeslots: (clientId: string, timeslots: string[], days: string[]) => Promise<void>;
};

const EventsContext = createContext<EventsContextType>({
  timeslotData: null,
  loadingTimeslotData: false,
  fetchTimeslotData: async () => { },
  updateTimeslots: async () => { },
});

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [timeslotData, setTimeslotData] = useState<TimeslotData | null>(null);
  const [loadingTimeslotData, setLoadingTimeslotData] = useState(false);

  // Get the current agency ID from the authenticated user
  const agencyId = currentUser?.uid;

  const fetchTimeslotData = useCallback(async (clientId: string) => {
    if (!agencyId) {
      console.warn('[EventsContext] No agency ID available, skipping fetch');
      return;
    }

    setLoadingTimeslotData(true);
    try {
      console.log('[EventsContext] Fetching timeslot data for agency:', agencyId, 'client:', clientId);
      const timeslotDocRef = doc(db, 'agencies', agencyId, 'clients', clientId, 'postEvents', 'timeslots');
      const timeslotSnap = await getDoc(timeslotDocRef);

      if (timeslotSnap.exists()) {
        const data = timeslotSnap.data();
        console.log('[EventsContext] Timeslots fetched:', data); // Debugging log
        setTimeslotData({
          predefinedTimeSlots: data.predefinedTimeSlots || [],
          activeDays: data.activeDays || [],
          isInitialized: true,
        });
      } else {
        console.log('[EventsContext] No timeslots found'); // Debugging log
        setTimeslotData({
          predefinedTimeSlots: [],
          activeDays: [],
          isInitialized: true,
        }); // No timeslot data found, but mark as initialized
      }
    } catch (error) {
      console.error('[EventsContext] Error fetching timeslot data:', error);
      setTimeslotData({
        predefinedTimeSlots: [],
        activeDays: [],
        isInitialized: true,
      });
    }
    setLoadingTimeslotData(false);
  }, [agencyId]); // Include agencyId in dependency array

  const updateTimeslots = useCallback(async (clientId: string, timeslots: string[], days: string[]) => {
    if (!agencyId) {
      console.error('[EventsContext] No agency ID available for updating timeslots');
      return;
    }

    try {
      console.log('[EventsContext] Updating timeslots for agency:', agencyId, 'client:', clientId);
      const timeslotDocRef = doc(db, 'agencies', agencyId, 'clients', clientId, 'postEvents', 'timeslots');
      await setDoc(timeslotDocRef, {
        predefinedTimeSlots: timeslots,
        activeDays: days,
      });
      setTimeslotData({ predefinedTimeSlots: timeslots, activeDays: days, isInitialized: true }); // Update local state
    } catch (error) {
      console.error('[EventsContext] Error updating timeslots:', error);
    }
  }, [agencyId]); // Include agencyId in dependency array

  return (
    <EventsContext.Provider
      value={{
        timeslotData,
        loadingTimeslotData,
        fetchTimeslotData,
        updateTimeslots,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};