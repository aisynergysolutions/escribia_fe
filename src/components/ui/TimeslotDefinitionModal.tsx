
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X, User, Users } from 'lucide-react';
import { useProfiles } from '@/context/ProfilesContext';
import { TimeslotsDataMap, TimeslotProfile } from '@/context/EventsContext';

interface TimeslotDefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (timeslotsData: TimeslotsDataMap) => void;
  initialTimeslotsData?: TimeslotsDataMap;
  clientId: string;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const TimeslotDefinitionModal: React.FC<TimeslotDefinitionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTimeslotsData = {},
  clientId
}) => {
  const { profiles, fetchProfiles, setActiveClientId } = useProfiles();
  const [timeslotsData, setTimeslotsData] = useState<TimeslotsDataMap>(initialTimeslotsData);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newTimeslot, setNewTimeslot] = useState('');

  // Fetch profiles when modal opens
  useEffect(() => {
    if (isOpen && clientId) {
      setActiveClientId(clientId); // Set the active client ID first
      fetchProfiles(clientId);
    }
  }, [isOpen, clientId, fetchProfiles, setActiveClientId]);

  // Initialize with default data if empty
  useEffect(() => {
    if (Object.keys(initialTimeslotsData).length === 0) {
      setTimeslotsData({
        'Monday': { '09:00': [], '13:00': [] },
        'Tuesday': { '09:00': [], '13:00': [] }
      });
      setSelectedDay('Monday'); // Set Monday as selected when initializing with default data
    } else {
      setTimeslotsData(initialTimeslotsData);
    }
  }, [initialTimeslotsData]);

  // Set the first day with timeslots as selected by default, or null if none
  useEffect(() => {
    if (!selectedDay) {
      const daysWithTimeslots = Object.keys(timeslotsData).filter(day =>
        timeslotsData[day] && Object.keys(timeslotsData[day]).length > 0
      );
      if (daysWithTimeslots.length > 0) {
        // Sort by DAYS_OF_WEEK order and pick the first
        const sortedDays = DAYS_OF_WEEK.filter(day => daysWithTimeslots.includes(day));
        setSelectedDay(sortedDays[0]);
      }
      // Don't set a default day if no timeslots are configured
    }
  }, [timeslotsData, selectedDay]);

  const getActiveDays = () => {
    const activeDays = Object.keys(timeslotsData).filter(day =>
      timeslotsData[day] && Object.keys(timeslotsData[day]).length > 0
    );
    // Sort according to DAYS_OF_WEEK order
    return DAYS_OF_WEEK.filter(day => activeDays.includes(day));
  };
  const getTimeslotsForDay = (day: string) => Object.keys(timeslotsData[day] || {});

  const addDay = (day: string) => {
    if (!timeslotsData[day]) {
      setTimeslotsData(prev => ({
        ...prev,
        [day]: { '09:00': [] }
      }));
    }
  };

  const removeDay = (day: string) => {
    const newData = { ...timeslotsData };
    delete newData[day];
    setTimeslotsData(newData);
    if (selectedDay === day) {
      // Select the first available day with timeslots, or null if none
      const remainingDaysWithTimeslots = Object.keys(newData).filter(d =>
        newData[d] && Object.keys(newData[d]).length > 0
      );
      if (remainingDaysWithTimeslots.length > 0) {
        // Sort by DAYS_OF_WEEK order and pick the first
        const sortedDays = DAYS_OF_WEEK.filter(d => remainingDaysWithTimeslots.includes(d));
        setSelectedDay(sortedDays[0]);
      } else {
        // If no days with timeslots remain, clear selection
        setSelectedDay(null);
      }
    }
  };

  const addTimeslotToDay = (day: string) => {
    if (newTimeslot) {
      setTimeslotsData(prev => {
        // Ensure the day exists in the data
        const currentDayData = prev[day] || {};
        
        // Check if the timeslot already exists
        if (currentDayData[newTimeslot]) {
          return prev; // Don't add if it already exists
        }
        
        return {
          ...prev,
          [day]: {
            ...currentDayData,
            [newTimeslot]: []
          }
        };
      });
      setNewTimeslot('');
    }
  };

  const removeTimeslotFromDay = (day: string, time: string) => {
    const newData = { ...timeslotsData };
    
    // Ensure the day exists before trying to delete from it
    if (newData[day]) {
      delete newData[day][time];
      
      // If this was the last timeslot for the day, remove the day entirely
      if (Object.keys(newData[day]).length === 0) {
        delete newData[day];
      }
    }
    
    setTimeslotsData(newData);
  };

  const toggleProfileForTimeslot = (day: string, time: string, profile: TimeslotProfile) => {
    // Ensure the day and time exist before accessing
    if (!timeslotsData[day] || !timeslotsData[day][time]) {
      return; // Exit early if the structure doesn't exist
    }
    
    const currentProfiles = timeslotsData[day][time];
    const isAssigned = currentProfiles.some(p => p.profileId === profile.profileId);

    if (isAssigned) {
      // Remove profile
      setTimeslotsData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [time]: currentProfiles.filter(p => p.profileId !== profile.profileId)
        }
      }));
    } else {
      // Add profile
      setTimeslotsData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [time]: [...currentProfiles, profile]
        }
      }));
    }
  };

  const cleanTimeslotsData = (data: TimeslotsDataMap): TimeslotsDataMap => {
    const cleanedData: TimeslotsDataMap = {};
    
    Object.keys(data).forEach(day => {
      const dayTimeslots = data[day];
      if (dayTimeslots && Object.keys(dayTimeslots).length > 0) {
        cleanedData[day] = dayTimeslots;
      }
    });
    
    return cleanedData;
  };

  const handleSave = () => {
    // Clean the data to remove any empty days and validate
    const cleanedData = cleanTimeslotsData(timeslotsData);
    if (isValidData(cleanedData)) {
      onSave(cleanedData);
      onClose();
    }
  };

  const isValid = () => {
    return isValidData(timeslotsData);
  };

  const isValidData = (data: TimeslotsDataMap) => {
    // Check if at least one day has at least one timeslot
    return Object.keys(data).some(day =>
      data[day] && Object.keys(data[day]).length > 0
    );
  };

  const convertProfileToTimeslotProfile = (profile: any): TimeslotProfile => ({
    profileId: profile.id,
    profileName: profile.profileName,
    profilePicture: profile.linkedin?.profileImage || profile.linkedin?.linkedinPicture || '/placeholder.svg'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Posting Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          {/* Main Configuration Layout */}
          <div>
            {/* <h3 className="text-sm font-medium mb-3">Configure Posting Schedule</h3> */}
            <p className="text-xs text-gray-500 mb-4">Select a day to configure its timeslots. Days with timeslots will appear active.</p>

            <div className="flex gap-4">
              {/* All Days Selector - Left Column */}
              <div className="flex-shrink-0" style={{ minWidth: '150px', maxWidth: '180px' }}>
                <h4 className="text-sm font-medium mb-2">Days of the Week</h4>
                <div className="space-y-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const hasTimeslots = timeslotsData[day] && Object.keys(timeslotsData[day]).length > 0;
                    const isSelected = selectedDay === day;

                    return (
                      <Button
                        key={day}
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full justify-start text-sm px-3 py-2 whitespace-nowrap ${!hasTimeslots
                            ? 'opacity-50 text-gray-400 border-gray-200'
                            : ''
                          }`}
                        onClick={() => {
                          setSelectedDay(day);
                          // If the day has no timeslots, add a default one
                          if (!hasTimeslots) {
                            addDay(day);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{day}</span>
                          {hasTimeslots && (
                            <span className="text-xs bg-green-100 text-green-600 px-1 rounded">
                              {Object.keys(timeslotsData[day]).length}
                            </span>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Timeslot Configuration - Takes remaining space */}
              {selectedDay && (
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Timeslots for {selectedDay}</h4>
                    {timeslotsData[selectedDay] && Object.keys(timeslotsData[selectedDay]).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-600 hover:text-red-700"
                        onClick={() => removeDay(selectedDay)}
                      >
                        Clear All Timeslots for {selectedDay}
                      </Button>
                    )}
                  </div>

                  {/* Add New Timeslot */}
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={newTimeslot}
                      onChange={(e) => setNewTimeslot(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addTimeslotToDay(selectedDay)}
                      disabled={!newTimeslot || !!(timeslotsData[selectedDay] && timeslotsData[selectedDay][newTimeslot])}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Existing Timeslots */}
                  <div className="space-y-3">
                    {getTimeslotsForDay(selectedDay).sort().map((time) => {
                      const assignedProfiles = timeslotsData[selectedDay][time];
                      const isGeneric = assignedProfiles.length === 0;

                      return (
                        <div key={time} className="border rounded-lg p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{time}</span>
                              {isGeneric ? (
                                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  <Users className="h-3 w-3" />
                                  All Profiles
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                  <User className="h-3 w-3" />
                                  {assignedProfiles.length} Profile{assignedProfiles.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeTimeslotFromDay(selectedDay, time)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Profile Assignment */}
                          <div className="space-y-2">

                            {profiles.length > 0 ? (
                              <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                                {profiles.map((profile) => {
                                  const timeslotProfile = convertProfileToTimeslotProfile(profile);
                                  const isAssigned = assignedProfiles.some(p => p.profileId === profile.id);

                                  return (
                                    <div key={profile.id} className="flex items-center space-x-2 p-1">
                                      <Checkbox
                                        id={`${selectedDay}-${time}-${profile.id}`}
                                        checked={isAssigned}
                                        onCheckedChange={() =>
                                          toggleProfileForTimeslot(selectedDay, time, timeslotProfile)
                                        }
                                      />
                                      <label
                                        htmlFor={`${selectedDay}-${time}-${profile.id}`}
                                        className="text-xs flex items-center gap-2 cursor-pointer flex-1"
                                      >
                                        <img
                                          src={timeslotProfile.profilePicture}
                                          alt={profile.profileName}
                                          className="w-5 h-5 rounded-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                                          }}
                                        />
                                        {profile.profileName}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500">No profiles available</p>
                            )}

                            <p className="text-xs text-gray-500">
                              {isGeneric
                                ? "This timeslot is available for all profiles"
                                : `Only selected profiles can post at this time`
                              }
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {getTimeslotsForDay(selectedDay).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No timeslots configured for {selectedDay}</p>
                        <p className="text-xs">Add a timeslot above to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!selectedDay && (
                <div className="flex-1 flex items-center justify-center py-12 text-gray-500">
                  <div className="text-center">
                    <p className="text-sm">Select a day to configure timeslots</p>
                    <p className="text-xs">Click on any day from the left to start</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid()}>
              Save Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeslotDefinitionModal;
