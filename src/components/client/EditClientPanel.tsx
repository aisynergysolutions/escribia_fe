
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Linkedin } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Client } from '../../types/interfaces';
import { formatDate } from '../../utils/dateUtils';

const formSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  status: z.enum(['active', 'onboarding', 'paused', 'archived']),
  writingStyle: z.string().optional(),
  brandBriefSummary: z.string().optional(),
  brandProfile: z.object({
    language: z.string(),
    locationFocus: z.string(),
    businessSize: z.string(),
    sellsWhat: z.string(),
    sellsToWhom: z.string(),
    brandPersonality: z.array(z.string()),
    brandTone: z.string(),
    emotionsToEvoke: z.array(z.string()),
    emojiUsage: z.string(),
    desiredPostLength: z.string(),
    coreValues: z.string(),
    brandStory: z.string(),
    uniqueSellingProposition: z.string(),
    hotTakesOrOpinions: z.string(),
    missionStatement: z.string(),
    inspirationSources: z.string(),
    recentCompanyEvents: z.string(),
    linkedinProfileUrl: z.string().url().optional(),
    customInstructionsAI: z.string().optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface EditClientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSave: (data: FormData) => void;
}

const EditClientPanel: React.FC<EditClientPanelProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
}) => {
  const [linkedinConnected, setLinkedinConnected] = React.useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: client.clientName,
      status: client.status,
      writingStyle: client.writingStyle || '',
      brandBriefSummary: client.brandBriefSummary || '',
      brandProfile: {
        ...client.brandProfile,
        brandPersonality: client.brandProfile.brandPersonality || [],
        emotionsToEvoke: client.brandProfile.emotionsToEvoke || [],
      },
    },
  });

  const handleSave = (data: FormData) => {
    onSave(data);
    onClose();
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[60%] max-w-none overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            Edit Client Settings
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            {/* Client Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Client Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select 
                          {...field} 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="onboarding">Onboarding</option>
                          <option value="paused">Paused</option>
                          <option value="archived">Archived</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label className="text-sm font-medium text-gray-500">Created At</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm text-gray-600">
                    {formatDate(client.createdAt)}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Update</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm text-gray-600">
                    {formatDate(client.updatedAt)}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="writingStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Writing Style</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Not specified" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="brandBriefSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Brief Summary</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="No summary available" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Brand Profile Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Brand Profile</h3>
              
              {/* Business Basics */}
              <div>
                <h4 className="font-semibold text-base mb-3">Business Basics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brandProfile.language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.locationFocus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Focus</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.businessSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Size</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.sellsWhat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sells What</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.sellsToWhom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sells to Whom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.linkedinProfileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile URL</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Brand Voice & Personality */}
              <div>
                <h4 className="font-semibold text-base mb-3">Brand Voice & Personality</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brandProfile.brandTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Tone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.emojiUsage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emoji Use</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.desiredPostLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Post Length</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Brand Story & Values */}
              <div>
                <h4 className="font-semibold text-base mb-3">Brand Story & Values</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brandProfile.coreValues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Core Values</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.brandStory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Story</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.missionStatement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.uniqueSellingProposition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unique Selling Proposition</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.hotTakesOrOpinions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hot Takes/Opinions</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.inspirationSources"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inspiration Sources</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandProfile.recentCompanyEvents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recent Company Events</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Integrations Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Integrations</h3>
              
              <FormField
                control={form.control}
                name="brandProfile.customInstructionsAI"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom AI Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="No custom instructions provided for this client."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label className="text-sm font-medium">LinkedIn Integration</Label>
                <div className="mt-2 flex items-center gap-4 p-3 bg-secondary rounded-lg">
                  <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                  {linkedinConnected ? (
                    <>
                      <span className="font-medium">Connected as Acme Corp</span>
                      <span className="text-sm text-muted-foreground">Expires on June 15, 2025</span>
                      <Button
                        type="button"
                        variant="link"
                        className="ml-auto p-0 h-auto text-sm"
                        onClick={() => setLinkedinConnected(false)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setLinkedinConnected(true)}
                    >
                      <Linkedin className="mr-2 h-4 w-4" />
                      Connect LinkedIn
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <SheetFooter className="flex items-center gap-3 pt-6 border-t mt-6">
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditClientPanel;
