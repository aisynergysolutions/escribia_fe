
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
    } else {
      setTimeslotsData(initialTimeslotsData);
    }
  }, [initialTimeslotsData]);

  // Set the first available day as selected by default
  useEffect(() => {
    const activeDays = getActiveDays();
    if (activeDays.length > 0 && !selectedDay) {
      setSelectedDay(activeDays[0]);
    }
  }, [timeslotsData, selectedDay]);

  const getActiveDays = () => {
    const activeDays = Object.keys(timeslotsData);
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
      setSelectedDay(null);
    }
  };

  const addTimeslotToDay = (day: string) => {
    if (newTimeslot && !timeslotsData[day][newTimeslot]) {
      setTimeslotsData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [newTimeslot]: []
        }
      }));
      setNewTimeslot('');
    }
  };

  const removeTimeslotFromDay = (day: string, time: string) => {
    const newData = { ...timeslotsData };
    delete newData[day][time];
    setTimeslotsData(newData);
  };

  const toggleProfileForTimeslot = (day: string, time: string, profile: TimeslotProfile) => {
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

  const clearAllProfilesForTimeslot = (day: string, time: string) => {
    setTimeslotsData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: []
      }
    }));
  };

  const handleSave = () => {
    // Validate: at least one day with at least one timeslot
    const activeDays = getActiveDays();
    const hasValidTimeslots = activeDays.some(day => getTimeslotsForDay(day).length > 0);

    if (activeDays.length > 0 && hasValidTimeslots) {
      onSave(timeslotsData);
      onClose();
    }
  };

  const isValid = () => {
    const activeDays = getActiveDays();
    return activeDays.length > 0 && activeDays.some(day => getTimeslotsForDay(day).length > 0);
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

        <div className="space-y-6">
          {/* Day Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Active Days</h3>
            <p className="text-xs text-gray-500 mb-3">Select the days when you want to post</p>
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isActive = getActiveDays().includes(day);
                return (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={isActive}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addDay(day);
                        } else {
                          removeDay(day);
                        }
                      }}
                    />
                    <label htmlFor={day} className="text-sm">{day}</label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Configuration */}
          {getActiveDays().length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Configure Timeslots for Each Day</h3>
              <div className="flex gap-4">
                {/* Day Selector - Compact width */}
                <div className="flex-shrink-0" style={{ minWidth: '120px', maxWidth: '150px' }}>
                  <h4 className="text-sm font-medium mb-2">Select Day to Configure</h4>
                  <div className="space-y-2">
                    {getActiveDays().map((day) => (
                      <Button
                        key={day}
                        variant={selectedDay === day ? "default" : "outline"}
                        className="w-full justify-start text-sm px-3 py-2 whitespace-nowrap"
                        onClick={() => setSelectedDay(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Timeslot Configuration - Takes remaining space */}
                {selectedDay && (
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Timeslots for {selectedDay}</h4>
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
                        disabled={!newTimeslot || !!timeslotsData[selectedDay][newTimeslot]}
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
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-600">Assigned Profiles</span>
                                {!isGeneric && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => clearAllProfilesForTimeslot(selectedDay, time)}
                                  >
                                    Clear All
                                  </Button>
                                )}
                              </div>

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
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
