
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface EditableFieldProps {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  type?: 'text' | 'textarea' | 'select' | 'badges';
  options?: string[];
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder,
  error,
  readOnly = false
}) => {
  const handleBadgeRemove = (indexToRemove: number) => {
    if (Array.isArray(value)) {
      onChange(value.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleBadgeAdd = (newValue: string) => {
    if (Array.isArray(value) && newValue.trim() && !value.includes(newValue.trim())) {
      onChange([...value, newValue.trim()]);
    }
  };

  const renderInput = () => {
    if (readOnly) {
      return (
        <div className="py-2 px-3 bg-gray-50 rounded-md text-gray-600">
          {Array.isArray(value) ? value.join(', ') : value}
        </div>
      );
    }

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            value={Array.isArray(value) ? value.join('\n') : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );
      
      case 'select':
        return (
          <Select value={Array.isArray(value) ? value[0] : value} onValueChange={onChange}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'badges':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(value) && value.map((item, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {item}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 w-4 h-4"
                    onClick={() => handleBadgeRemove(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Add new item and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBadgeAdd(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className={error ? 'border-red-500' : ''}
            />
          </div>
        );
      
      default:
        return (
          <Input
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      {renderInput()}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default EditableField;
