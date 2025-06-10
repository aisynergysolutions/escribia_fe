
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduleCardProps {
  postDate: string;
  postTime: string;
  timezone: string;
  onPostDateChange: (date: string) => void;
  onPostTimeChange: (time: string) => void;
  onTimezoneChange: (timezone: string) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  postDate,
  postTime,
  timezone,
  onPostDateChange,
  onPostTimeChange,
  onTimezoneChange
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Post Schedule</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Posting Date & Time</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Input 
              type="date" 
              value={postDate} 
              onChange={e => onPostDateChange(e.target.value)} 
            />
            <Input 
              type="time" 
              value={postTime} 
              onChange={e => onPostTimeChange(e.target.value)} 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
                <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                <SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
                <SelectItem value="UTC+2">UTC+2 (EET)</SelectItem>
                <SelectItem value="UTC+8">UTC+8 (CST)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default ScheduleCard;
