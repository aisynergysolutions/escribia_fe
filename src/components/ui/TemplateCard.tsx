
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TemplateCard as TemplateCardType } from '@/context/TemplatesContext';

interface TemplateCardProps {
  template: TemplateCardType;
}

const getFunnelStageColor = (stage: string) => {
  switch (stage) {
    case 'TOFU':
      return 'bg-green-100 text-green-800';
    case 'MOFU':
      return 'bg-blue-100 text-blue-800';
    case 'BOFU':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/templates/${template.id}`);
  };

  return (
    <Card
      className="rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{template.templateName}</CardTitle>
          <Badge className={getFunnelStageColor(template.funnelStage)}>
            {template.funnelStage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          {template.objective}
        </p>
        <p className="text-xs text-gray-500 mb-2">
          {template.contentType} • {template.scope}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2 text-xs text-gray-500">
        Used {template.usageCount} times
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
