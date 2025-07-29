
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Loader2 } from 'lucide-react';
import { Poll } from '@/context/PostDetailsContext';

interface CreatePollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePoll: (pollData: Poll) => void;
  editingPoll?: Poll | null;
  isCreating?: boolean;
  isUpdating?: boolean;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({
  open,
  onOpenChange,
  onCreatePoll,
  editingPoll,
  isCreating = false,
  isUpdating = false
}) => {
  const [question, setQuestion] = useState(editingPoll?.question || '');
  const [options, setOptions] = useState(editingPoll?.options || ['', '']);
  const [duration, setDuration] = useState(editingPoll?.duration || '1 week');

  // Calculate loading state
  const isLoading = isCreating || isUpdating;

  React.useEffect(() => {
    if (editingPoll) {
      setQuestion(editingPoll.question);
      setOptions(editingPoll.options);
      setDuration(editingPoll.duration);
    }
  }, [editingPoll]);

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
    const pollData: Poll = {
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
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setDuration('1 week');
  };

  const isValidPoll = question.trim() !== '' && options.filter(option => option.trim() !== '').length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md  p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{editingPoll ? 'Edit poll' : 'Create a poll'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-120px)] px-6">
          <div className="space-y-4 pb-6">
            <div>
              <Label htmlFor="question">Your question*</Label>
              <Textarea
                id="question"
                placeholder="How do you commute to work?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="mt-1"
                maxLength={140}
                disabled={isCreating || isUpdating}
                style={{ outline: 'none', boxShadow: 'none' }}

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
                  <div className="flex items-center gap-0 mt-1">
                    <Input
                      id={`option-${index}`}
                      placeholder={index === 0 ? "Public transportation" : index === 1 ? "Drive myself" : `Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      maxLength={30}
                      disabled={isCreating || isUpdating}
                      style={{ outline: 'none', boxShadow: 'none' }}
                    />
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="h-8 w-8 p-0"
                        disabled={isCreating || isUpdating}
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
                  disabled={isCreating || isUpdating}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add option
                </Button>
              )}
            </div>

            <div>
              <Label>Poll duration</Label>
              <Select value={duration} onValueChange={setDuration} disabled={isCreating || isUpdating}>
                <SelectTrigger className="mt-1" style={{ outline: 'none', boxShadow: 'none' }}
                >
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
          </div>
        </ScrollArea>

        <div className="flex justify-between gap-3 p-6 pt-0">
          <Button variant="outline" onClick={handleBack} className="flex-1" disabled={isCreating || isUpdating}>
            Back
          </Button>
          <Button
            onClick={handleDone}
            disabled={!isValidPoll || isCreating || isUpdating}
            className="flex-1"
          >
            {isCreating ? 'Creating...' : isUpdating ? 'Updating...' : 'Done'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollModal;
