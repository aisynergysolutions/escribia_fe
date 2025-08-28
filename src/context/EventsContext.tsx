import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export type TimeslotProfile = {
  profileId: string;
  profileName: string;
  profilePicture: string;
};

export type TimeslotsDataMap = {
  [day: string]: {
    [time: string]: TimeslotProfile[];
  };
};

export type TimeslotData = {
  predefinedTimeSlots: string[];
  activeDays: string[];
  timeslotsData: TimeslotsDataMap;
  isInitialized: boolean; // Add flag to track if we've attempted to load data
  clientId: string; // Track which client this data belongs to
};

type EventsContextType = {
  timeslotData: TimeslotData | null;
  loadingTimeslotData: boolean;
  fetchTimeslotData: (clientId: string) => Promise<void>;
  updateTimeslots: (clientId: string, timeslotsData: TimeslotsDataMap) => Promise<void>;
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

        // Handle both old and new data formats for backward compatibility
        let timeslotsData: TimeslotsDataMap = {};
        let predefinedTimeSlots: string[] = [];
        let activeDays: string[] = [];

        if (data.timeslotsData) {
          // New format
          timeslotsData = data.timeslotsData;
          // Extract predefined time slots and active days from timeslotsData
          activeDays = Object.keys(timeslotsData);
          const allTimes = new Set<string>();
          Object.values(timeslotsData).forEach(daySlots => {
            Object.keys(daySlots).forEach(time => allTimes.add(time));
          });
          predefinedTimeSlots = Array.from(allTimes).sort();
        } else if (data.predefinedTimeSlots && data.activeDays) {
          // Old format - convert to new format
          predefinedTimeSlots = data.predefinedTimeSlots || [];
          activeDays = data.activeDays || [];

          // Convert old format to new format
          timeslotsData = {};
          activeDays.forEach(day => {
            timeslotsData[day] = {};
            predefinedTimeSlots.forEach(time => {
              timeslotsData[day][time] = []; // Empty array means all profiles
            });
          });
        }

        setTimeslotData({
          predefinedTimeSlots,
          activeDays,
          timeslotsData,
          isInitialized: true,
          clientId,
        });
      } else {
        console.log('[EventsContext] No timeslots found'); // Debugging log
        setTimeslotData({
          predefinedTimeSlots: [],
          activeDays: [],
          timeslotsData: {},
          isInitialized: true,
          clientId,
        }); // No timeslot data found, but mark as initialized
      }
    } catch (error) {
      console.error('[EventsContext] Error fetching timeslot data:', error);
      setTimeslotData({
        predefinedTimeSlots: [],
        activeDays: [],
        timeslotsData: {},
        isInitialized: true,
        clientId,
      });
    }
    setLoadingTimeslotData(false);
  }, [agencyId]); // Include agencyId in dependency array

  const updateTimeslots = useCallback(async (clientId: string, timeslotsData: TimeslotsDataMap) => {
    if (!agencyId) {
      console.error('[EventsContext] No agency ID available for updating timeslots');
      return;
    }

    try {
      console.log('[EventsContext] Updating timeslots for agency:', agencyId, 'client:', clientId);
      const timeslotDocRef = doc(db, 'agencies', agencyId, 'clients', clientId, 'postEvents', 'timeslots');

      // Extract predefined time slots and active days from timeslotsData
      const activeDays = Object.keys(timeslotsData);
      const allTimes = new Set<string>();
      Object.values(timeslotsData).forEach(daySlots => {
        Object.keys(daySlots).forEach(time => allTimes.add(time));
      });
      const predefinedTimeSlots = Array.from(allTimes).sort();

      await setDoc(timeslotDocRef, {
        timeslotsData,
        predefinedTimeSlots, // Keep for backward compatibility
        activeDays, // Keep for backward compatibility
      });

      setTimeslotData({
        predefinedTimeSlots,
        activeDays,
        timeslotsData,
        isInitialized: true,
        clientId,
      }); // Update local state
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