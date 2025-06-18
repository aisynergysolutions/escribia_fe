
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface CreatePollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePoll: (pollData: PollData) => void;
}

export interface PollData {
  question: string;
  options: string[];
  duration: string;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({
  open,
  onOpenChange,
  onCreatePoll
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState('1 week');

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleDone = () => {
    const pollData: PollData = {
      question,
      options: options.filter(option => option.trim() !== ''),
      duration
    };
    onCreatePoll(pollData);
    onOpenChange(false);
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setDuration('1 week');
  };

  const handleBack = () => {
    onOpenChange(false);
  };

  const isValidPoll = question.trim() !== '' && options.filter(option => option.trim() !== '').length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a poll</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Your question*</Label>
            <Textarea
              id="question"
              placeholder="How do you commute to work?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1"
              maxLength={140}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {question.length}/140
            </div>
          </div>

          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="relative">
                <Label htmlFor={`option-${index}`}>
                  Option {index + 1}*
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id={`option-${index}`}
                    placeholder={index === 0 ? "Public transportation" : index === 1 ? "Drive myself" : `Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    maxLength={30}
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {option.length}/30
                </div>
              </div>
            ))}
            
            {options.length < 4 && (
              <Button
                variant="outline"
                onClick={handleAddOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add option
              </Button>
            )}
          </div>

          <div>
            <Label>Poll duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 day">1 day</SelectItem>
                <SelectItem value="3 days">3 days</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
                <SelectItem value="2 weeks">2 weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600">
            We don't allow requests for political opinions, medical information or other
          </div>

          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handleDone} 
              disabled={!isValidPoll}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollModal;
