
import React, { useState, useMemo, useCallback } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TemplateCard from '../components/ui/TemplateCard';
import CreateTemplateModal from '../components/CreateTemplateModal';
import { mockTemplates } from '../types';
import { useToast } from '@/hooks/use-toast';

const Templates = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const handleCreateTemplate = useCallback((templateData: any) => {
    console.log('Creating template:', templateData);
    toast({
      title: "Template Created",
      description: `Template "${templateData.templateName}" has been created successfully.`,
    });
  }, [toast]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = mockTemplates.filter(template =>
      template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.templateContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.templateName.localeCompare(b.templateName));
        break;
      case 'usage':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'funnel':
        filtered.sort((a, b) => a.funnelStage.localeCompare(b.funnelStage));
        break;
      case 'recent':
        filtered.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        break;
    }

    return filtered;
  }, [searchTerm, sortBy]);

  const memoizedTemplateCards = useMemo(() => {
    return filteredAndSortedTemplates.map((template) => (
      <TemplateCard key={template.id} template={template} />
    ));
  }, [filteredAndSortedTemplates]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Templates</h1>
        <CreateTemplateModal onSave={handleCreateTemplate}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </CreateTemplateModal>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates by name, content, or tags..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="usage">Most Used</SelectItem>
            <SelectItem value="funnel">Funnel Stage</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedTemplates.length} of {mockTemplates.length} templates
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memoizedTemplateCards}
      </div>

      {/* No results message */}
      {filteredAndSortedTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No templates found matching your search.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms or create a new template.</p>
        </div>
      )}
    </div>
  );
};

export default Templates;
