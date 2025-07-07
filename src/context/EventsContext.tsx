import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type TimeslotData = {
  predefinedTimeSlots: string[];
  activeDays: string[];
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
  fetchTimeslotData: async () => {},
  updateTimeslots: async () => {},
});

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [timeslotData, setTimeslotData] = useState<TimeslotData | null>(null);
  const [loadingTimeslotData, setLoadingTimeslotData] = useState(false);

  const fetchTimeslotData = useCallback(async (clientId: string) => {
    setLoadingTimeslotData(true);
    try {
      const timeslotDocRef = doc(db, 'agencies', 'agency1', 'clients', clientId, 'postEvents', 'timeslots');
      const timeslotSnap = await getDoc(timeslotDocRef);

      if (timeslotSnap.exists()) {
        const data = timeslotSnap.data();
        console.log('[EventsContext] Timeslots fetched:', data); // Debugging log
        setTimeslotData({
          predefinedTimeSlots: data.predefinedTimeSlots || [],
          activeDays: data.activeDays || [],
        });
      } else {
        console.log('[EventsContext] No timeslots found'); // Debugging log
        setTimeslotData(null); // No timeslot data found
      }
    } catch (error) {
      console.error('[EventsContext] Error fetching timeslot data:', error);
      setTimeslotData(null);
    }
    setLoadingTimeslotData(false);
  }, []); // Use an empty dependency array to ensure the function reference is stable

  const updateTimeslots = useCallback(async (clientId: string, timeslots: string[], days: string[]) => {
    try {
      const timeslotDocRef = doc(db, 'agencies', 'agency1', 'clients', clientId, 'postEvents', 'timeslots');
      await setDoc(timeslotDocRef, {
        predefinedTimeSlots: timeslots,
        activeDays: days,
      });
      setTimeslotData({ predefinedTimeSlots: timeslots, activeDays: days }); // Update local state
    } catch (error) {
      console.error('[EventsContext] Error updating timeslots:', error);
    }
  }, []); // Use an empty dependency array to ensure the function reference is stable

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