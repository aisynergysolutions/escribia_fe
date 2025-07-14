
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Save, X, Linkedin, User, Building2, Calendar, MapPin, ExternalLink, Trash2, Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import StatusBadge from '../common/StatusBadge';
import { SubClient } from '../../types/interfaces';
import { Timestamp } from 'firebase/firestore';

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
    createdAt: Timestamp.now()
  });

  // Form data for main company profile
  const [clientInfoData, setClientInfoData] = useState({
    clientName: 'TechCorp Solutions',
    websiteUrl: 'https://techcorp-solutions.com',
    linkedinUrl: 'https://linkedin.com/company/techcorp-solutions',
    companySize: '51-200',
    hqLocation: 'San Francisco, CA',
    language: 'English'
  });

  const [timeSlots, setTimeSlots] = useState([
    { day: 'Monday', time: '09:00' },
    { day: 'Wednesday', time: '14:00' },
    { day: 'Friday', time: '11:00' }
  ]);

  const [brandStrategyData, setBrandStrategyData] = useState({
    oneLiner: 'Leading technology solutions provider specializing in enterprise software.',
    targetAudience: 'Mid-market to enterprise B2B companies looking to modernize their technology infrastructure.',
    contentGoals: {
      generateLeads: 3,
      buildAuthority: 4,
      engageAudience: 3,
      attractTalent: 2,
      supportPersonalBrand: 1
    },
    brandPersona: 'The Seasoned Expert',
    coreTone: 'Confident & Direct',
    postLengthValue: 1, // 0-3 scale
    emojiUsageValue: 0 // 0-3 scale
  });

  const [contentGuidelinesData, setContentGuidelinesData] = useState({
    keyOfferings: 'Enterprise software solutions, cloud migration services, custom development',
    hookGuidelines: 'Start with industry challenges or insights. Use data points when possible.',
    uniquePOV: 'Technology adoption should be strategic, not reactive. Focus on business outcomes.',
    competitors: ['https://competitor1.com', 'https://competitor2.com'],
    topicsToAvoid: ['Competitor bashing', 'Political content', 'Controversial industry takes']
  });

  // Sub-profile specific data
  const [subProfileData, setSubProfileData] = useState({
    fullName: profile.name,
    currentRole: profile.role,
    joinedDate: '2023-01-15',
    operatingLocation: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/sarah-johnson',
    language: 'English',
    primaryGoal: 'Build Thought Leadership',
    audienceFocus: 'C-suite executives and technology leaders in mid-market companies',
    expertiseAreas: ['Strategic Planning', 'Digital Transformation', 'Team Leadership', 'Industry Innovation'],
    personalBrandPersona: 'The Visionary Leader',
    coreTones: ['Inspirational', 'Strategic', 'Confident'],
    coreTone: 'Inspirational & Visionary',
    postLengthValue: 2, // 0-3 scale (Super Short, Short, Medium, Long)
    emojiUsageValue: 1, // 0-3 scale (Professional, Sparingly, Moderately, Frequently)
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

  const handleDeleteClient = () => {
    // In real app, this would make API call to delete entire client
    console.log('Client deleted');
    navigate('/clients');
  };

  const handleAddTimeSlot = () => {
    setTimeSlots(prev => [...prev, { day: 'Monday', time: '09:00' }]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  const handleTimeSlotChange = (index: number, field: 'day' | 'time', value: string) => {
    setTimeSlots(prev => prev.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const handleAddCompetitor = () => {
    if (contentGuidelinesData.competitors.length < 3) {
      setContentGuidelinesData(prev => ({
        ...prev,
        competitors: [...prev.competitors, 'https://']
      }));
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    setContentGuidelinesData(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
  };

  const handleCompetitorChange = (index: number, value: string) => {
    setContentGuidelinesData(prev => ({
      ...prev,
      competitors: prev.competitors.map((comp, i) => i === index ? value : comp)
    }));
  };

  const handleAddTopicToAvoid = () => {
    setContentGuidelinesData(prev => ({
      ...prev,
      topicsToAvoid: [...prev.topicsToAvoid, 'New topic']
    }));
  };

  const handleRemoveTopicToAvoid = (index: number) => {
    setContentGuidelinesData(prev => ({
      ...prev,
      topicsToAvoid: prev.topicsToAvoid.filter((_, i) => i !== index)
    }));
  };

  const handleTopicToAvoidChange = (index: number, value: string) => {
    setContentGuidelinesData(prev => ({
      ...prev,
      topicsToAvoid: prev.topicsToAvoid.map((topic, i) => i === index ? value : topic)
    }));
  };

  // Helper functions for sliders
  const getPostLengthLabel = (value: number) => {
    const labels = ['Super Short (50–90 words)', 'Short (80–130 words)', 'Medium (130–280 words)', 'Long (280–450 words)'];
    return labels[value] || labels[0];
  };

  const getEmojiUsageLabel = (value: number) => {
    const labels = ['Professional ⚫️', 'Sparingly 👍', 'Moderately 😊', 'Frequently ✨'];
    return labels[value] || labels[0];
  };

  // Helper function to get flag emoji
  const getFlagEmoji = (language: string) => {
    const flags: { [key: string]: string } = {
      'English': '🇺🇸',
      'Dutch': '🇳🇱',
      'Spanish': '🇪🇸',
      'German': '🇩🇪',
      'French': '🇫🇷',
      'Italian': '🇮🇹',
      'Portuguese': '🇵🇹'
    };
    return flags[language] || '🇺🇸';
  };

  // Helper function to group time slots by day
  const groupTimeSlotsByDay = () => {
    const grouped: { [key: string]: string[] } = {};
    timeSlots.forEach(slot => {
      if (!grouped[slot.day]) {
        grouped[slot.day] = [];
      }
      const time = new Date(`2000-01-01T${slot.time}`).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
      });
      grouped[slot.day].push(time);
    });
    return grouped;
  };

  const isMainProfile = profileId === 'company-1';

  if (isMainProfile) {
    // Main profile layout - updated design
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Business Name
                  </Label>
                  {editingSection === 'clientInfo' ? (
                    <Input
                      value={clientInfoData.clientName}
                      onChange={(e) => setClientInfoData(prev => ({ ...prev, clientName: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{clientInfoData.clientName}</p>
                  )}
                </div>
                <div>
                  <Label>Website URL</Label>
                  {editingSection === 'clientInfo' ? (
                    <Input
                      type="url"
                      value={clientInfoData.websiteUrl}
                      onChange={(e) => setClientInfoData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <a
                      href={clientInfoData.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      {clientInfoData.websiteUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  {editingSection === 'clientInfo' ? (
                    <Input
                      type="url"
                      value={clientInfoData.linkedinUrl}
                      onChange={(e) => setClientInfoData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <a
                      href={clientInfoData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      {clientInfoData.linkedinUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    HQ Location
                  </Label>
                  {editingSection === 'clientInfo' ? (
                    <Input
                      value={clientInfoData.hqLocation}
                      onChange={(e) => setClientInfoData(prev => ({ ...prev, hqLocation: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{clientInfoData.hqLocation}</p>
                  )}
                </div>
                <div>
                  <Label>Company Size</Label>
                  {editingSection === 'clientInfo' ? (
                    <Select value={clientInfoData.companySize} onValueChange={(value) => setClientInfoData(prev => ({ ...prev, companySize: value }))}>
                      <SelectTrigger className="mt-1">
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
                  <Label>Content Language</Label>
                  {editingSection === 'clientInfo' ? (
                    <Select value={clientInfoData.language} onValueChange={(value) => setClientInfoData(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">🇺🇸 English</SelectItem>
                        <SelectItem value="Dutch">🇳🇱 Dutch</SelectItem>
                        <SelectItem value="Spanish">🇪🇸 Spanish</SelectItem>
                        <SelectItem value="German">🇩🇪 German</SelectItem>
                        <SelectItem value="French">🇫🇷 French</SelectItem>
                        <SelectItem value="Italian">🇮🇹 Italian</SelectItem>
                        <SelectItem value="Portuguese">🇵🇹 Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm mt-1 flex items-center gap-2">
                      {getFlagEmoji(clientInfoData.language)} {clientInfoData.language}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Custom AI Instructions</Label>
              {editingSection === 'clientInfo' ? (
                <Textarea
                  value={profile.customInstructions || ''}
                  className="mt-2"
                  rows={3}
                  placeholder="Enter custom AI instructions..."
                />
              ) : (
                <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                  {profile.customInstructions}
                </p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Preferred Time Slots
                </Label>
                {editingSection === 'clientInfo' ? (
                  <div className="space-y-2 mt-3">
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                        <Select
                          value={slot.day}
                          onValueChange={(value) => handleTimeSlotChange(index, 'day', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="time"
                          value={slot.time}
                          onChange={(e) => handleTimeSlotChange(index, 'time', e.target.value)}
                          className="w-28"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTimeSlot(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddTimeSlot}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 mt-3">
                    {Object.entries(groupTimeSlotsByDay()).map(([day, times]) => (
                      <div key={day} className="p-3 bg-muted rounded-md">
                        <p className="font-medium text-sm">{day}</p>
                        {times.map((time, index) => (
                          <p key={index} className="text-sm text-muted-foreground ml-2">
                            {time}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">One-Liner Summary</Label>
                  {editingSection === 'brandStrategy' ? (
                    <Textarea
                      value={brandStrategyData.oneLiner}
                      onChange={(e) => setBrandStrategyData(prev => ({ ...prev, oneLiner: e.target.value }))}
                      className="mt-2"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                      {brandStrategyData.oneLiner}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-base font-medium">Brand Persona</Label>
                  {editingSection === 'brandStrategy' ? (
                    <Select value={brandStrategyData.brandPersona} onValueChange={(value) => setBrandStrategyData(prev => ({ ...prev, brandPersona: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="The Seasoned Expert">🏆 The Seasoned Expert</SelectItem>
                        <SelectItem value="The Helpful Guide">🤝 The Helpful Guide</SelectItem>
                        <SelectItem value="The Bold Innovator">⚡ The Bold Innovator</SelectItem>
                        <SelectItem value="The Trusted Peer">👥 The Trusted Peer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="px-3 py-1">
                        🏆 {brandStrategyData.brandPersona}
                      </Badge>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-base font-medium">Core Tone</Label>
                  {editingSection === 'brandStrategy' ? (
                    <Select value={brandStrategyData.coreTone} onValueChange={(value) => setBrandStrategyData(prev => ({ ...prev, coreTone: value }))}>
                      <SelectTrigger className="mt-2">
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
                    <div className="mt-2">
                      <Badge variant="outline" className="px-3 py-1">
                        {brandStrategyData.coreTone}
                      </Badge>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-base font-medium">Target Audience Persona</Label>
                  {editingSection === 'brandStrategy' ? (
                    <Textarea
                      value={brandStrategyData.targetAudience}
                      onChange={(e) => setBrandStrategyData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="mt-2"
                      rows={3}
                    />
                  ) : (
                    <blockquote className="mt-2 border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r-md">
                      <p className="text-sm italic">"{brandStrategyData.targetAudience}"</p>
                    </blockquote>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                {/* Sub-section 1: Content Goals */}
                <div>
                  <Label className="text-base font-medium">Content Goals</Label>
                  <div className="space-y-3 mt-2">
                    {[
                      { key: 'generateLeads', label: 'Generate Leads', value: brandStrategyData.contentGoals.generateLeads },
                      { key: 'buildAuthority', label: 'Build Brand Authority', value: brandStrategyData.contentGoals.buildAuthority },
                      { key: 'engageAudience', label: 'Engage Audience', value: brandStrategyData.contentGoals.engageAudience },
                      { key: 'attractTalent', label: 'Attract Talent', value: brandStrategyData.contentGoals.attractTalent },
                      { key: 'supportPersonalBrand', label: 'Support a Personal Brand', value: brandStrategyData.contentGoals.supportPersonalBrand }
                    ].map(({ key, label, value }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">{value}/5</span>
                        </div>
                        {editingSection === 'brandStrategy' ? (
                          <Slider
                            value={[value]}
                            onValueChange={(newValue) => setBrandStrategyData(prev => ({
                              ...prev,
                              contentGoals: {
                                ...prev.contentGoals,
                                [key]: newValue[0]
                              }
                            }))}
                            max={5}
                            step={1}
                            className="w-full"
                          />
                        ) : (
                          <Progress value={(value / 5) * 100} className="h-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <Separator />

                {/* Sub-section 2: Content Style */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Average Post Length</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Super Short</span>
                        <span className="text-sm font-medium">{getPostLengthLabel(brandStrategyData.postLengthValue)}</span>
                        <span className="text-sm text-muted-foreground">Long</span>
                      </div>
                      {editingSection === 'brandStrategy' ? (
                        <Slider
                          value={[brandStrategyData.postLengthValue]}
                          onValueChange={(value) => setBrandStrategyData(prev => ({ ...prev, postLengthValue: value[0] }))}
                          max={3}
                          step={1}
                          className="w-full"
                        />
                      ) : (
                        <Progress value={((brandStrategyData.postLengthValue) / 3) * 100} className="h-2" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Emoji Usage</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Professional</span>
                        <span className="text-sm font-medium">{getEmojiUsageLabel(brandStrategyData.emojiUsageValue)}</span>
                        <span className="text-sm text-muted-foreground">Frequently</span>
                      </div>
                      {editingSection === 'brandStrategy' ? (
                        <Slider
                          value={[brandStrategyData.emojiUsageValue]}
                          onValueChange={(value) => setBrandStrategyData(prev => ({ ...prev, emojiUsageValue: value[0] }))}
                          max={3}
                          step={1}
                          className="w-full"
                        />
                      ) : (
                        <Progress value={((brandStrategyData.emojiUsageValue) / 3) * 100} className="h-2" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Content Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Content Guidelines</span>
              {editingSection !== 'contentGuidelines' ? (
                <Button variant="outline" size="sm" onClick={() => handleSectionEdit('contentGuidelines')}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSectionSave('contentGuidelines')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSectionCancel('contentGuidelines')}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Key Offerings to Promote</Label>
              {editingSection === 'contentGuidelines' ? (
                <Textarea
                  value={contentGuidelinesData.keyOfferings}
                  onChange={(e) => setContentGuidelinesData(prev => ({ ...prev, keyOfferings: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              ) : (
                <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                  {contentGuidelinesData.keyOfferings}
                </p>
              )}
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Hook Guidelines</Label>
              {editingSection === 'contentGuidelines' ? (
                <Textarea
                  value={contentGuidelinesData.hookGuidelines}
                  onChange={(e) => setContentGuidelinesData(prev => ({ ...prev, hookGuidelines: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              ) : (
                <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                  {contentGuidelinesData.hookGuidelines}
                </p>
              )}
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Unique POV / "Hot Takes"</Label>
              {editingSection === 'contentGuidelines' ? (
                <Textarea
                  value={contentGuidelinesData.uniquePOV}
                  onChange={(e) => setContentGuidelinesData(prev => ({ ...prev, uniquePOV: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              ) : (
                <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                  {contentGuidelinesData.uniquePOV}
                </p>
              )}
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Main Competitors (Max 3)</Label>
              <div className="space-y-2 mt-2">
                {contentGuidelinesData.competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {editingSection === 'contentGuidelines' ? (
                      <>
                        <Input
                          type="url"
                          value={competitor}
                          onChange={(e) => handleCompetitorChange(index, e.target.value)}
                          className="flex-1"
                          placeholder="https://competitor.com"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCompetitor(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <a
                        href={competitor}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 p-2 bg-muted rounded-md flex-1"
                      >
                        {competitor}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
                {editingSection === 'contentGuidelines' && contentGuidelinesData.competitors.length < 3 && (
                  <Button variant="outline" size="sm" onClick={handleAddCompetitor}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Competitor
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Topics to Avoid</Label>
              {editingSection === 'contentGuidelines' ? (
                <div className="space-y-2 mt-2">
                  {contentGuidelinesData.topicsToAvoid.map((topic, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={topic}
                        onChange={(e) => handleTopicToAvoidChange(index, e.target.value)}
                        className="flex-1"
                        placeholder="Topic to avoid"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTopicToAvoid(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={handleAddTopicToAvoid}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Topic to Avoid
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {contentGuidelinesData.topicsToAvoid.map((topic, index) => (
                    <Badge key={index} variant="destructive" className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Client Button */}
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Client
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to permanently delete the entire client account for <strong>{profile.name}</strong>.
                  This will delete all profiles, posts, settings, and data associated with this client.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteClient}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, delete entire client account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
                {editingSection === 'profileInfo' ? (
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
              <div>
                <Label>Content Language</Label>
                {editingSection === 'profileInfo' ? (
                  <Select value={subProfileData.language} onValueChange={(value) => setSubProfileData(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">🇺🇸 English</SelectItem>
                      <SelectItem value="Dutch">🇳🇱 Dutch</SelectItem>
                      <SelectItem value="Spanish">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="German">🇩🇪 German</SelectItem>
                      <SelectItem value="French">🇫🇷 French</SelectItem>
                      <SelectItem value="Italian">🇮🇹 Italian</SelectItem>
                      <SelectItem value="Portuguese">🇵🇹 Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-1 flex items-center gap-2">
                    {getFlagEmoji(subProfileData.language)} {subProfileData.language}
                  </p>
                )}
              </div>
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
                      <SelectItem value="The Seasoned Expert">🏆 The Seasoned Expert</SelectItem>
                      <SelectItem value="The Helpful Guide">🤝 The Helpful Guide</SelectItem>
                      <SelectItem value="The Bold Innovator">⚡ The Bold Innovator</SelectItem>
                      <SelectItem value="The Trusted Peer">👥 The Trusted Peer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      🏆 {subProfileData.personalBrandPersona}
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-base font-medium">Core Tone</Label>
                {editingSection === 'voice' ? (
                  <Select value={subProfileData.coreTone} onValueChange={(value) => setSubProfileData(prev => ({ ...prev, coreTone: value }))}>
                    <SelectTrigger className="mt-2">
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
                  <div className="mt-2">
                    <Badge variant="outline" className="px-3 py-1">
                      {subProfileData.coreTone}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Average Post Length</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Super Short</span>
                    <span className="text-sm font-medium">{getPostLengthLabel(subProfileData.postLengthValue)}</span>
                    <span className="text-sm text-muted-foreground">Long</span>
                  </div>
                  {editingSection === 'voice' ? (
                    <Slider
                      value={[subProfileData.postLengthValue]}
                      onValueChange={(value) => setSubProfileData(prev => ({ ...prev, postLengthValue: value[0] }))}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                  ) : (
                    <Progress value={((subProfileData.postLengthValue) / 3) * 100} className="h-2" />
                  )}
                </div>
              </div>
              <div>
                <Label className="text-base font-medium">Emoji Usage</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Professional</span>
                    <span className="text-sm font-medium">{getEmojiUsageLabel(subProfileData.emojiUsageValue)}</span>
                    <span className="text-sm text-muted-foreground">Frequently</span>
                  </div>
                  {editingSection === 'voice' ? (
                    <Slider
                      value={[subProfileData.emojiUsageValue]}
                      onValueChange={(value) => setSubProfileData(prev => ({ ...prev, emojiUsageValue: value[0] }))}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                  ) : (
                    <Progress value={((subProfileData.emojiUsageValue) / 3) * 100} className="h-2" />
                  )}
                </div>
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

      {/* Delete Profile Button */}
      <div className="flex justify-end">
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
    </div>
  );
};

export default ProfileDetails;
