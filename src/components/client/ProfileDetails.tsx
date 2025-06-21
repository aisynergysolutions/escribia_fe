import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Save, X, Linkedin, User, Building2, Calendar, MapPin, ExternalLink, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import StatusBadge from '../common/StatusBadge';
import { SubClient } from '../../types/interfaces';

const ProfileDetails: React.FC = () => {
  const { clientId, profileId } = useParams<{ clientId: string; profileId: string; }>();
  const navigate = useNavigate();
  
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Mock profile data - in real app, this would come from API
  const [profile, setProfile] = useState<SubClient>({
    id: profileId || '',
    name: profileId === 'company-1' ? 'TechCorp Solutions' : profileId === 'ceo-1' ? 'Sarah Johnson' : 'Michael Chen',
    role: profileId === 'company-1' ? 'Company Account' : profileId === 'ceo-1' ? 'CEO' : 'CTO',
    profileImage: '',
    writingStyle: profileId === 'company-1' ? 'Professional and informative corporate voice' : profileId === 'ceo-1' ? 'Thought leadership, strategic insights' : 'Technical expertise, innovation-focused',
    linkedinConnected: profileId !== 'cto-1',
    linkedinAccountName: profileId === 'company-1' ? 'TechCorp Solutions' : profileId === 'ceo-1' ? 'Sarah Johnson' : '',
    linkedinExpiryDate: profileId === 'company-1' ? 'June 15, 2025' : 'July 20, 2025',
    customInstructions: profileId === 'company-1' ? 'Focus on industry insights and company achievements. Highlight our innovative solutions and client success stories.' : profileId === 'ceo-1' ? 'Share vision, industry trends, and leadership perspectives. Focus on thought leadership and strategic insights.' : 'Technical insights, product development, innovation. Share technical expertise and engineering perspectives.',
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
  });

  // Form data for different sections
  const [clientInfoData, setClientInfoData] = useState({
    businessName: 'TechCorp Solutions',
    websiteUrl: 'https://techcorp-solutions.com',
    linkedinUrl: 'https://linkedin.com/company/techcorp-solutions',
    companySize: '51-200',
    hqLocation: 'San Francisco, CA',
    postsPerWeek: 3,
    timeSlots: ['Monday at 9:00 AM', 'Wednesday at 2:00 PM', 'Friday at 11:00 AM']
  });

  const [brandStrategyData, setBrandStrategyData] = useState({
    oneLiner: 'Leading technology solutions provider specializing in enterprise software.',
    targetAudience: 'Mid-market to enterprise B2B companies looking to modernize their technology infrastructure.',
    contentGoals: {
      generateLeads: [3],
      buildAuthority: [4],
      engageAudience: [3],
      attractTalent: [2],
      supportPersonalBrand: [1]
    },
    brandPersona: 'The Seasoned Expert',
    coreTone: 'Confident & Direct',
    postLength: [2], // Medium
    emojiUsage: [1] // Sparingly
  });

  const [aiInstructionsData, setAiInstructionsData] = useState({
    keyOfferings: 'Enterprise software solutions, cloud migration services, custom development',
    hookGuidelines: 'Start with industry challenges or insights. Use data points when possible.',
    sampleCTA: 'Ready to transform your business? Book a consultation today.',
    uniquePOV: 'Technology adoption should be strategic, not reactive. Focus on business outcomes.',
    topicsToAvoid: 'Competitor bashing, political content, controversial industry takes',
    competitors: ['https://competitor1.com', 'https://competitor2.com']
  });

  // Sub-profile specific data
  const [subProfileData, setSubProfileData] = useState({
    fullName: profile.name,
    currentRole: profile.role,
    joinedDate: '2023-01-15',
    operatingLocation: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/sarah-johnson',
    primaryGoal: 'Build Thought Leadership',
    audienceFocus: 'C-suite executives and technology leaders in mid-market companies',
    expertiseAreas: ['Strategic Planning', 'Digital Transformation', 'Team Leadership', 'Industry Innovation'],
    personalBrandPersona: 'The Visionary Leader',
    coreTones: ['Inspirational', 'Strategic', 'Confident'],
    postLength: 'Medium (130–280 words)',
    emojiUsage: 'Sparingly 👍',
    uniquePOV: 'The future of work is hybrid, and companies that don\'t adapt their culture will lose top talent.',
    personalStories: 'Started career as a software engineer, built first team of 50+ people, led three successful digital transformations',
    hookGuidelines: 'Start with bold predictions or contrarian takes about the industry',
    sampleCTA: 'What\'s your take on this? Share your thoughts in the comments.',
    topicsToAvoid: ['Salary discussions', 'Specific company politics', 'Personal life details']
  });

  const handleSectionEdit = (section: string) => {
    setEditingSection(section);
  };

  const handleSectionSave = (section: string) => {
    // In real app, this would make API call to save data
    setEditingSection(null);
  };

  const handleSectionCancel = (section: string) => {
    // In real app, this would reset form data to original values
    setEditingSection(null);
  };

  const handleDeleteProfile = () => {
    // In real app, this would make API call to delete profile
    console.log('Profile deleted');
    navigate(`/clients/${clientId}/settings`);
  };

  const isMainProfile = profileId === 'company-1';

  if (isMainProfile) {
    // Main profile layout (keep existing code for main profile)
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${clientId}/settings`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.profileImage} />
              <AvatarFallback>
                <Building2 className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{profile.name}</h1>
              <Badge variant="outline" className="mt-1">{profile.role}</Badge>
            </div>
          </div>
        </div>

        {/* Card 1: Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Client Information</span>
              {editingSection !== 'clientInfo' ? (
                <Button variant="outline" size="sm" onClick={() => handleSectionEdit('clientInfo')}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSectionSave('clientInfo')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSectionCancel('clientInfo')}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Business Name</Label>
                {editingSection === 'clientInfo' ? (
                  <Input
                    value={clientInfoData.businessName}
                    onChange={(e) => setClientInfoData(prev => ({ ...prev, businessName: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm mt-1">{clientInfoData.businessName}</p>
                )}
              </div>
              <div>
                <Label>Company Size</Label>
                {editingSection === 'clientInfo' ? (
                  <Select value={clientInfoData.companySize} onValueChange={(value) => setClientInfoData(prev => ({ ...prev, companySize: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-1">{clientInfoData.companySize}</p>
                )}
              </div>
              <div>
                <Label>Website URL</Label>
                {editingSection === 'clientInfo' ? (
                  <Input
                    type="url"
                    value={clientInfoData.websiteUrl}
                    onChange={(e) => setClientInfoData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm mt-1">{clientInfoData.websiteUrl}</p>
                )}
              </div>
              <div>
                <Label>HQ Location</Label>
                {editingSection === 'clientInfo' ? (
                  <Input
                    value={clientInfoData.hqLocation}
                    onChange={(e) => setClientInfoData(prev => ({ ...prev, hqLocation: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm mt-1">{clientInfoData.hqLocation}</p>
                )}
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                {editingSection === 'clientInfo' ? (
                  <Input
                    type="url"
                    value={clientInfoData.linkedinUrl}
                    onChange={(e) => setClientInfoData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm mt-1">{clientInfoData.linkedinUrl}</p>
                )}
              </div>
              <div>
                <Label>Posts Per Week</Label>
                {editingSection === 'clientInfo' ? (
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={clientInfoData.postsPerWeek}
                    onChange={(e) => setClientInfoData(prev => ({ ...prev, postsPerWeek: parseInt(e.target.value) }))}
                  />
                ) : (
                  <p className="text-sm mt-1">{clientInfoData.postsPerWeek}</p>
                )}
              </div>
            </div>
            <div>
              <Label>Preferred Time Slots</Label>
              {editingSection === 'clientInfo' ? (
                <div className="space-y-2 mt-2">
                  {clientInfoData.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={slot} readOnly className="flex-1" />
                      <Button variant="outline" size="sm">×</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm">+ Add Time Slot</Button>
                </div>
              ) : (
                <div className="space-y-1 mt-1">
                  {clientInfoData.timeSlots.map((slot, index) => (
                    <p key={index} className="text-sm">{slot}</p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Brand Strategy & Voice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Brand Strategy & Voice</span>
              {editingSection !== 'brandStrategy' ? (
                <Button variant="outline" size="sm" onClick={() => handleSectionEdit('brandStrategy')}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSectionSave('brandStrategy')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSectionCancel('brandStrategy')}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>One-Liner Summary</Label>
              {editingSection === 'brandStrategy' ? (
                <Textarea
                  value={brandStrategyData.oneLiner}
                  onChange={(e) => setBrandStrategyData(prev => ({ ...prev, oneLiner: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{brandStrategyData.oneLiner}</p>
              )}
            </div>
            
            <div>
              <Label>Target Audience Persona</Label>
              {editingSection === 'brandStrategy' ? (
                <Textarea
                  value={brandStrategyData.targetAudience}
                  onChange={(e) => setBrandStrategyData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{brandStrategyData.targetAudience}</p>
              )}
            </div>

            <div>
              <Label>Content Goals (1-5 scale)</Label>
              <div className="space-y-4 mt-3">
                {[
                  { key: 'generateLeads', label: 'Generate Leads' },
                  { key: 'buildAuthority', label: 'Build Brand Authority' },
                  { key: 'engageAudience', label: 'Engage Audience' },
                  { key: 'attractTalent', label: 'Attract Talent' },
                  { key: 'supportPersonalBrand', label: 'Support a Personal Brand' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    {editingSection === 'brandStrategy' ? (
                      <div className="flex items-center gap-4 w-32">
                        <Slider
                          value={brandStrategyData.contentGoals[key as keyof typeof brandStrategyData.contentGoals]}
                          onValueChange={(value) => setBrandStrategyData(prev => ({
                            ...prev,
                            contentGoals: { ...prev.contentGoals, [key]: value }
                          }))}
                          max={5}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm w-4">{brandStrategyData.contentGoals[key as keyof typeof brandStrategyData.contentGoals][0]}</span>
                      </div>
                    ) : (
                      <span className="text-sm">{brandStrategyData.contentGoals[key as keyof typeof brandStrategyData.contentGoals][0]}/5</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Brand Persona</Label>
                {editingSection === 'brandStrategy' ? (
                  <Select value={brandStrategyData.brandPersona} onValueChange={(value) => setBrandStrategyData(prev => ({ ...prev, brandPersona: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="The Seasoned Expert">The Seasoned Expert</SelectItem>
                      <SelectItem value="The Helpful Guide">The Helpful Guide</SelectItem>
                      <SelectItem value="The Bold Innovator">The Bold Innovator</SelectItem>
                      <SelectItem value="The Trusted Peer">The Trusted Peer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-1">{brandStrategyData.brandPersona}</p>
                )}
              </div>
              
              <div>
                <Label>Core Tone</Label>
                {editingSection === 'brandStrategy' ? (
                  <Select value={brandStrategyData.coreTone} onValueChange={(value) => setBrandStrategyData(prev => ({ ...prev, coreTone: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confident & Direct">Confident & Direct</SelectItem>
                      <SelectItem value="Friendly & Approachable">Friendly & Approachable</SelectItem>
                      <SelectItem value="Witty & Humorous">Witty & Humorous</SelectItem>
                      <SelectItem value="Formal & Professional">Formal & Professional</SelectItem>
                      <SelectItem value="Casual & Conversational">Casual & Conversational</SelectItem>
                      <SelectItem value="Inspirational & Visionary">Inspirational & Visionary</SelectItem>
                      <SelectItem value="Technical & Precise">Technical & Precise</SelectItem>
                      <SelectItem value="Passionate & Energetic">Passionate & Energetic</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-1">{brandStrategyData.coreTone}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Average Post Length</Label>
              <div className="flex items-center gap-4 mt-2">
                {editingSection === 'brandStrategy' ? (
                  <>
                    <Slider
                      value={brandStrategyData.postLength}
                      onValueChange={(value) => setBrandStrategyData(prev => ({ ...prev, postLength: value }))}
                      max={4}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-32">
                      {brandStrategyData.postLength[0] === 1 && 'Super Short (50–90 words)'}
                      {brandStrategyData.postLength[0] === 2 && 'Short (80–130 words)'}
                      {brandStrategyData.postLength[0] === 3 && 'Medium (130–280 words)'}
                      {brandStrategyData.postLength[0] === 4 && 'Long (280–450 words)'}
                    </span>
                  </>
                ) : (
                  <p className="text-sm">
                    {brandStrategyData.postLength[0] === 1 && 'Super Short (50–90 words)'}
                    {brandStrategyData.postLength[0] === 2 && 'Short (80–130 words)'}
                    {brandStrategyData.postLength[0] === 3 && 'Medium (130–280 words)'}
                    {brandStrategyData.postLength[0] === 4 && 'Long (280–450 words)'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Emoji Usage</Label>
              <div className="flex items-center gap-4 mt-2">
                {editingSection === 'brandStrategy' ? (
                  <>
                    <Slider
                      value={brandStrategyData.emojiUsage}
                      onValueChange={(value) => setBrandStrategyData(prev => ({ ...prev, emojiUsage: value }))}
                      max={4}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-32">
                      {brandStrategyData.emojiUsage[0] === 1 && 'Professional ⚫️'}
                      {brandStrategyData.emojiUsage[0] === 2 && 'Sparingly 👍'}
                      {brandStrategyData.emojiUsage[0] === 3 && 'Moderately 😊'}
                      {brandStrategyData.emojiUsage[0] === 4 && 'Frequently ✨'}
                    </span>
                  </>
                ) : (
                  <p className="text-sm">
                    {brandStrategyData.emojiUsage[0] === 1 && 'Professional ⚫️'}
                    {brandStrategyData.emojiUsage[0] === 2 && 'Sparingly 👍'}
                    {brandStrategyData.emojiUsage[0] === 3 && 'Moderately 😊'}
                    {brandStrategyData.emojiUsage[0] === 4 && 'Frequently ✨'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Instructions & Guardrails</span>
              {editingSection !== 'aiInstructions' ? (
                <Button variant="outline" size="sm" onClick={() => handleSectionEdit('aiInstructions')}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSectionSave('aiInstructions')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSectionCancel('aiInstructions')}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Key Offerings to Promote</Label>
              {editingSection === 'aiInstructions' ? (
                <Textarea
                  value={aiInstructionsData.keyOfferings}
                  onChange={(e) => setAiInstructionsData(prev => ({ ...prev, keyOfferings: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{aiInstructionsData.keyOfferings}</p>
              )}
            </div>

            <div>
              <Label>Hook Guidelines</Label>
              {editingSection === 'aiInstructions' ? (
                <Textarea
                  value={aiInstructionsData.hookGuidelines}
                  onChange={(e) => setAiInstructionsData(prev => ({ ...prev, hookGuidelines: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{aiInstructionsData.hookGuidelines}</p>
              )}
            </div>

            <div>
              <Label>Sample Call-to-Action (CTA)</Label>
              {editingSection === 'aiInstructions' ? (
                <Textarea
                  value={aiInstructionsData.sampleCTA}
                  onChange={(e) => setAiInstructionsData(prev => ({ ...prev, sampleCTA: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{aiInstructionsData.sampleCTA}</p>
              )}
            </div>

            <div>
              <Label>Unique POV / "Hot Takes"</Label>
              {editingSection === 'aiInstructions' ? (
                <Textarea
                  value={aiInstructionsData.uniquePOV}
                  onChange={(e) => setAiInstructionsData(prev => ({ ...prev, uniquePOV: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{aiInstructionsData.uniquePOV}</p>
              )}
            </div>

            <div>
              <Label>Topics to Avoid</Label>
              {editingSection === 'aiInstructions' ? (
                <Textarea
                  value={aiInstructionsData.topicsToAvoid}
                  onChange={(e) => setAiInstructionsData(prev => ({ ...prev, topicsToAvoid: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{aiInstructionsData.topicsToAvoid}</p>
              )}
            </div>

            <div>
              <Label>Main Competitors</Label>
              {editingSection === 'aiInstructions' ? (
                <div className="space-y-2 mt-2">
                  {aiInstructionsData.competitors.map((competitor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="url"
                        value={competitor}
                        onChange={(e) => {
                          const newCompetitors = [...aiInstructionsData.competitors];
                          newCompetitors[index] = e.target.value;
                          setAiInstructionsData(prev => ({ ...prev, competitors: newCompetitors }));
                        }}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">×</Button>
                    </div>
                  ))}
                  {aiInstructionsData.competitors.length < 3 && (
                    <Button variant="outline" size="sm">+ Add Competitor</Button>
                  )}
                </div>
              ) : (
                <div className="space-y-1 mt-1">
                  {aiInstructionsData.competitors.map((competitor, index) => (
                    <p key={index} className="text-sm">{competitor}</p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sub-profile layout
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${clientId}/settings`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.profileImage} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{profile.name}</h1>
            <Badge variant="outline" className="mt-1">{profile.role}</Badge>
          </div>
        </div>
      </div>

      {/* Card 1: Profile Information & Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile Information & Connection</span>
            {editingSection !== 'profileInfo' ? (
              <Button variant="outline" size="sm" onClick={() => handleSectionEdit('profileInfo')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSectionSave('profileInfo')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSectionCancel('profileInfo')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                {editingSection ===  'profileInfo' ? (
                  <Input
                    value={subProfileData.fullName}
                    onChange={(e) => setSubProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{subProfileData.fullName}</p>
                )}
              </div>
              <div>
                <Label>Current Role</Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    value={subProfileData.currentRole}
                    onChange={(e) => setSubProfileData(prev => ({ ...prev, currentRole: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{subProfileData.currentRole}</p>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined Company Date
                </Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    type="date"
                    value={subProfileData.joinedDate}
                    onChange={(e) => setSubProfileData(prev => ({ ...prev, joinedDate: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{new Date(subProfileData.joinedDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Operating Location
                </Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    value={subProfileData.operatingLocation}
                    onChange={(e) => setSubProfileData(prev => ({ ...prev, operatingLocation: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{subProfileData.operatingLocation}</p>
                )}
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    type="url"
                    value={subProfileData.linkedinUrl}
                    onChange={(e) => setSubProfileData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <a 
                    href={subProfileData.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    {subProfileData.linkedinUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">LinkedIn Integration</Label>
            <div className="mt-3 p-4 bg-secondary rounded-lg">
              {profile.linkedinConnected ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                    <div>
                      <p className="font-medium">Connected as {profile.linkedinAccountName || profile.name}</p>
                      <p className="text-sm text-muted-foreground">Expires on {profile.linkedinExpiryDate}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Button>
                    <Linkedin className="h-4 w-4 mr-2" />
                    Connect LinkedIn
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Custom AI Instructions</Label>
            {editingSection === 'profileInfo' ? (
              <Textarea
                value={profile.customInstructions || ''}
                className="mt-2"
                rows={3}
                placeholder="Enter custom AI instructions for this profile..."
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {profile.customInstructions || 'No custom instructions specified'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Strategy & Expertise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Strategy & Expertise</span>
            {editingSection !== 'strategy' ? (
              <Button variant="outline" size="sm" onClick={() => handleSectionEdit('strategy')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSectionSave('strategy')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSectionCancel('strategy')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Primary LinkedIn Goal</Label>
            {editingSection === 'strategy' ? (
              <Select value={subProfileData.primaryGoal} onValueChange={(value) => setSubProfileData(prev => ({ ...prev, primaryGoal: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Build Thought Leadership">Build Thought Leadership</SelectItem>
                  <SelectItem value="Generate Leads">Generate Leads</SelectItem>
                  <SelectItem value="Build Network">Build Network</SelectItem>
                  <SelectItem value="Attract Talent">Attract Talent</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-2">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {subProfileData.primaryGoal}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Audience Focus</Label>
            {editingSection === 'strategy' ? (
              <Textarea
                value={subProfileData.audienceFocus}
                onChange={(e) => setSubProfileData(prev => ({ ...prev, audienceFocus: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {subProfileData.audienceFocus}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Specific Areas of Expertise</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {subProfileData.expertiseAreas.map((area, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {area}
                </Badge>
              ))}
            </div>
            {editingSection === 'strategy' && (
              <Button variant="outline" size="sm" className="mt-2">
                + Add Expertise Area
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Personal Voice & Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Personal Voice & Style</span>
            {editingSection !== 'voice' ? (
              <Button variant="outline" size="sm" onClick={() => handleSectionEdit('voice')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSectionSave('voice')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSectionCancel('voice')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Personal Brand Persona</Label>
                {editingSection === 'voice' ? (
                  <Select value={subProfileData.personalBrandPersona} onValueChange={(value) => setSubProfileData(prev => ({ ...prev, personalBrandPersona: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="The Visionary Leader">🎯 The Visionary Leader</SelectItem>
                      <SelectItem value="The Seasoned Expert">🏆 The Seasoned Expert</SelectItem>
                      <SelectItem value="The Helpful Guide">🤝 The Helpful Guide</SelectItem>
                      <SelectItem value="The Bold Innovator">⚡ The Bold Innovator</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      🎯 {subProfileData.personalBrandPersona}
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-base font-medium">Core Tones</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {subProfileData.coreTones.map((tone, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {tone}
                    </Badge>
                  ))}
                </div>
                {editingSection === 'voice' && (
                  <Button variant="outline" size="sm" className="mt-2">
                    + Add Tone
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Average Post Length</Label>
                {editingSection === 'voice' ? (
                  <Select value={subProfileData.postLength} onValueChange={(value) => setSubProfileData(prev => ({ ...prev, postLength: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Super Short (50–90 words)">Super Short (50–90 words)</SelectItem>
                      <SelectItem value="Short (80–130 words)">Short (80–130 words)</SelectItem>
                      <SelectItem value="Medium (130–280 words)">Medium (130–280 words)</SelectItem>
                      <SelectItem value="Long (280–450 words)">Long (280–450 words)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-2">{subProfileData.postLength}</p>
                )}
              </div>
              <div>
                <Label className="text-base font-medium">Emoji Usage</Label>
                {editingSection === 'voice' ? (
                  <Select value={subProfileData.emojiUsage} onValueChange={(value) => setSubProfileData(prev => ({ ...prev, emojiUsage: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional ⚫️">Professional ⚫️</SelectItem>
                      <SelectItem value="Sparingly 👍">Sparingly 👍</SelectItem>
                      <SelectItem value="Moderately 😊">Moderately 😊</SelectItem>
                      <SelectItem value="Frequently ✨">Frequently ✨</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-2">{subProfileData.emojiUsage}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Content Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Content Guidelines</span>
            {editingSection !== 'guidelines' ? (
              <Button variant="outline" size="sm" onClick={() => handleSectionEdit('guidelines')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSectionSave('guidelines')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSectionCancel('guidelines')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Unique POV / "Hot Takes"</Label>
            {editingSection === 'guidelines' ? (
              <Textarea
                value={subProfileData.uniquePOV}
                onChange={(e) => setSubProfileData(prev => ({ ...prev, uniquePOV: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {subProfileData.uniquePOV}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Key Personal Stories</Label>
            {editingSection === 'guidelines' ? (
              <Textarea
                value={subProfileData.personalStories}
                onChange={(e) => setSubProfileData(prev => ({ ...prev, personalStories: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {subProfileData.personalStories}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Hook Guidelines</Label>
            {editingSection === 'guidelines' ? (
              <Textarea
                value={subProfileData.hookGuidelines}
                onChange={(e) => setSubProfileData(prev => ({ ...prev, hookGuidelines: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {subProfileData.hookGuidelines}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Sample Call-to-Action (CTA)</Label>
            {editingSection === 'guidelines' ? (
              <Textarea
                value={subProfileData.sampleCTA}
                onChange={(e) => setSubProfileData(prev => ({ ...prev, sampleCTA: e.target.value }))}
                className="mt-2"
                rows={2}
              />
            ) : (
              <blockquote className="mt-2 border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r-md">
                <p className="text-sm italic">"{subProfileData.sampleCTA}"</p>
              </blockquote>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Topics / Phrases to Avoid</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {subProfileData.topicsToAvoid.map((topic, index) => (
                <Badge key={index} variant="destructive" className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200">
                  {topic}
                </Badge>
              ))}
            </div>
            {editingSection === 'guidelines' && (
              <Button variant="outline" size="sm" className="mt-2">
                + Add Topic to Avoid
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-900">Delete Profile</h4>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete this profile and all associated data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Profile
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to permanently delete the profile for <strong>{profile.name}</strong>. 
                    All associated data will be lost. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteProfile}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, delete this profile
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDetails;
