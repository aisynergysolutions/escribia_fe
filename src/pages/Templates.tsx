
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TemplateCard from '../components/ui/TemplateCard';
import { mockTemplates } from '../types';

const Templates = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Templates</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
};

export default Templates;
