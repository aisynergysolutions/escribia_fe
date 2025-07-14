import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Save, X, Linkedin, Building2, MapPin, Calendar, ExternalLink, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { getCompanyProfile, CompanyProfile } from '@/context/ProfilesContext';
import { Switch } from '@/components/ui/switch';
import LinkedInConnectionPanel from './LinkedInConnectionPanel';

const ProfileDetailsCompany: React.FC = () => {
  const { clientId, profileId } = useParams<{ clientId: string; profileId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Form data states
  const [companyInfoData, setCompanyInfoData] = useState({
    companyName: '',
    role: '',
    foundationDate: '',
    contactEmail: '',
    linkedinUrl: '',
    language: '',
    customInstructions: '',
  });

  // Add addHashtags to brandStrategyData state
  const [brandStrategyData, setBrandStrategyData] = useState({
    primaryGoal: '',
    audienceFocus: '',
    brandPersona: '',
    coreTone: '',
    postLengthValue: 0,
    emojiUsageValue: 0,
    addHashtags: false, // Add this field
  });

  const [contentGuidelinesData, setContentGuidelinesData] = useState({
    hookGuidelines: '',
    hotTakes: '',
    sampleCTA: '',
    topicsToAvoid: [] as string[],
    favPosts: [] as string[],
  });

  useEffect(() => {
    if (clientId && profileId) {
      getCompanyProfile(clientId, profileId).then(fetchedProfile => {
        setProfile(fetchedProfile);
        
        // Populate form data
        setCompanyInfoData({
          companyName: fetchedProfile.profileName,
          role: fetchedProfile.role,
          foundationDate: fetchedProfile.foundationDate || '',
          contactEmail: fetchedProfile.contactEmail,
          linkedinUrl: `https://linkedin.com/company/${fetchedProfile.linkedin.linkedinName}`,
          language: fetchedProfile.contentProfile.contentLanguage,
          customInstructions: fetchedProfile.contentProfile.customInstructions,
        });

        setBrandStrategyData({
          primaryGoal: fetchedProfile.contentProfile.primaryGoal,
          audienceFocus: fetchedProfile.contentProfile.audienceFocus,
          brandPersona: fetchedProfile.contentProfile.contentPersona,
          coreTone: fetchedProfile.contentProfile.coreTones,
          postLengthValue: getPostLengthValue(fetchedProfile.contentProfile.postLength),
          emojiUsageValue: getEmojiUsageValue(fetchedProfile.contentProfile.emojiUsage),
          addHashtags: fetchedProfile.contentProfile.addHashtags, // Add this field
        });

        setContentGuidelinesData({
          hookGuidelines: fetchedProfile.contentProfile.hookGuidelines,
          hotTakes: fetchedProfile.contentProfile.hotTakes,
          sampleCTA: fetchedProfile.contentProfile.sampleCTA,
          topicsToAvoid: fetchedProfile.contentProfile.topicsToAvoid,
          favPosts: fetchedProfile.contentProfile.favPosts,
        });
      });
    }
  }, [clientId, profileId]);

  // Helper functions
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  const getPostLengthValue = (postLength: string) => {
    if (postLength.includes('Super Short')) return 0;
    if (postLength.includes('Short')) return 1;
    if (postLength.includes('Medium')) return 2;
    if (postLength.includes('Long')) return 3;
    return 0;
  };

  const getEmojiUsageValue = (emojiUsage: string) => {
    if (emojiUsage.includes('Professional')) return 0;
    if (emojiUsage.includes('Sparingly')) return 1;
    if (emojiUsage.includes('Moderately')) return 2;
    if (emojiUsage.includes('Frequently')) return 3;
    return 0;
  };

  const getPostLengthLabel = (value: number) => {
    const labels = ['Super Short (50–90 words)', 'Short (80–130 words)', 'Medium (130–280 words)', 'Long (280–450 words)'];
    return labels[value] || labels[0];
  };

  const getEmojiUsageLabel = (value: number) => {
    const labels = ['Professional ⚫️', 'Sparingly 👍', 'Moderately 😊', 'Frequently ✨'];
    return labels[value] || labels[0];
  };

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

  const handleAddFavPost = () => {
    setContentGuidelinesData(prev => ({
      ...prev,
      favPosts: [...prev.favPosts, 'New favorite post']
    }));
  };

  const handleRemoveFavPost = (index: number) => {
    setContentGuidelinesData(prev => ({
      ...prev,
      favPosts: prev.favPosts.filter((_, i) => i !== index)
    }));
  };

  const handleFavPostChange = (index: number, value: string) => {
    setContentGuidelinesData(prev => ({
      ...prev,
      favPosts: prev.favPosts.map((post, i) => i === index ? value : post)
    }));
  };

  if (!profile) return <div>Loading...</div>;

  const { linkedin, contentProfile } = profile;

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
            <AvatarImage src={linkedin.profileImage} />
            <AvatarFallback>
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{profile.profileName}</h1>
            <Badge variant="outline" className="mt-1">{profile.role}</Badge>
          </div>
        </div>
      </div>

      {/* Card 1: Company Information & Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Company Information & Connection</span>
            {editingSection !== 'companyInfo' ? (
              <Button variant="outline" size="sm" onClick={() => handleSectionEdit('companyInfo')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSectionSave('companyInfo')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSectionCancel('companyInfo')}>
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
                  Company Name
                </Label>
                {editingSection === 'companyInfo' ? (
                  <Input
                    value={companyInfoData.companyName}
                    onChange={(e) => setCompanyInfoData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{companyInfoData.companyName}</p>
                )}
              </div>
              <div>
                <Label>Role/Type</Label>
                {editingSection === 'companyInfo' ? (
                  <Input
                    value={companyInfoData.role}
                    onChange={(e) => setCompanyInfoData(prev => ({ ...prev, role: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{companyInfoData.role}</p>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Foundation Date
                </Label>
                {editingSection === 'companyInfo' ? (
                  <Input
                    type="date"
                    value={companyInfoData.foundationDate}
                    onChange={(e) => setCompanyInfoData(prev => ({ ...prev, foundationDate: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{companyInfoData.foundationDate ? formatDate(companyInfoData.foundationDate) : 'N/A'}</p>
                )}
              </div>
              <div>
                <Label>Contact Email</Label>
                {editingSection === 'companyInfo' ? (
                  <Input
                    type="email"
                    value={companyInfoData.contactEmail}
                    onChange={(e) => setCompanyInfoData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{companyInfoData.contactEmail}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">

              <div>
                <Label>LinkedIn URL</Label>
                {editingSection === 'companyInfo' ? (
                  <Input
                    type="url"
                    value={companyInfoData.linkedinUrl}
                    onChange={(e) => setCompanyInfoData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <a 
                    href={companyInfoData.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    {companyInfoData.linkedinUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div>
                <Label>Content Language</Label>
                {editingSection === 'companyInfo' ? (
                  <Select value={companyInfoData.language} onValueChange={(value) => setCompanyInfoData(prev => ({ ...prev, language: value }))}>
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
                    {getFlagEmoji(companyInfoData.language)} {companyInfoData.language}
                  </p>
                )}
              </div>
              <div>
                <Label>Status</Label>
                <p className="text-sm mt-1">{profile.status}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Custom AI Instructions</Label>
            {editingSection === 'companyInfo' ? (
              <Textarea
                value={companyInfoData.customInstructions}
                onChange={(e) => setCompanyInfoData(prev => ({ ...prev, customInstructions: e.target.value }))}
                className="mt-2"
                rows={3}
                placeholder="Enter custom AI instructions for this company profile..."
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {companyInfoData.customInstructions || 'No custom instructions specified'}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">LinkedIn Integration</Label>
            <div className="mt-3">
              <LinkedInConnectionPanel 
                linkedinInfo={linkedin}
                profileId={profileId!}
                clientId={clientId!}
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Onboarding Link</Label>
            <a 
              href={profile.onboardingLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
            >
              {profile.onboardingLink}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Add Profile Details Section */}
          <div>
            <Label className="text-base font-medium">Profile Details</Label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Profile Type:</span>
                <Badge variant="outline" className="ml-2">
                  {profile.profileType}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <p className="text-muted-foreground mt-1">{formatDate(profile.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <p className="text-muted-foreground mt-1">{formatDate(profile.updatedAt)}</p>
              </div>
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
                <Label className="text-base font-medium">Primary LinkedIn Goal</Label>
                {editingSection === 'brandStrategy' ? (
                  <Select value={brandStrategyData.primaryGoal} onValueChange={(value) => setBrandStrategyData(prev => ({ ...prev, primaryGoal: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brand Awareness">Brand Awareness</SelectItem>
                      <SelectItem value="Generate Leads">Generate Leads</SelectItem>
                      <SelectItem value="Thought Leadership">Thought Leadership</SelectItem>
                      <SelectItem value="Attract Talent">Attract Talent</SelectItem>
                      <SelectItem value="Customer Engagement">Customer Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {brandStrategyData.primaryGoal}
                    </Badge>
                  </div>
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
                      <SelectItem value="The Industry Leader">🏆 The Industry Leader</SelectItem>
                      <SelectItem value="The Innovative Disruptor">⚡ The Innovative Disruptor</SelectItem>
                      <SelectItem value="The Trusted Partner">🤝 The Trusted Partner</SelectItem>
                      <SelectItem value="The Expert Authority">🎯 The Expert Authority</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      {brandStrategyData.brandPersona.includes('Leader') ? '🏆' : 
                       brandStrategyData.brandPersona.includes('Innovative') ? '⚡' : 
                       brandStrategyData.brandPersona.includes('Trusted') ? '🤝' : '🎯'} {brandStrategyData.brandPersona}
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
                      <SelectItem value="Professional & Authoritative">Professional & Authoritative</SelectItem>
                      <SelectItem value="Friendly & Approachable">Friendly & Approachable</SelectItem>
                      <SelectItem value="Innovative & Forward-thinking">Innovative & Forward-thinking</SelectItem>
                      <SelectItem value="Trustworthy & Reliable">Trustworthy & Reliable</SelectItem>
                      <SelectItem value="Dynamic & Energetic">Dynamic & Energetic</SelectItem>
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
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Target Audience</Label>
                {editingSection === 'brandStrategy' ? (
                  <Textarea
                    value={brandStrategyData.audienceFocus}
                    onChange={(e) => setBrandStrategyData(prev => ({ ...prev, audienceFocus: e.target.value }))}
                    className="mt-2"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                    {brandStrategyData.audienceFocus}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-base font-medium">Add Hashtags</Label>
                <div className="mt-2 flex items-center space-x-2">
                  {editingSection === 'brandStrategy' ? (
                    <Switch
                      checked={brandStrategyData.addHashtags}
                      onCheckedChange={(checked) => setBrandStrategyData(prev => ({ ...prev, addHashtags: checked }))
                      }
                    />
                  ) : (
                    <Switch
                      checked={brandStrategyData.addHashtags}
                      disabled
                    />
                  )}
                  <Label className="text-sm">
                    {brandStrategyData.addHashtags ? 'Automatically add hashtags to posts' : 'No hashtags added to posts'}
                  </Label>
                </div>
              </div>
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
            <Label className="text-base font-medium">Hot Takes / Unique POV</Label>
            {editingSection === 'contentGuidelines' ? (
              <Textarea
                value={contentGuidelinesData.hotTakes}
                onChange={(e) => setContentGuidelinesData(prev => ({ ...prev, hotTakes: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {contentGuidelinesData.hotTakes}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Sample Call-to-Action (CTA)</Label>
            {editingSection === 'contentGuidelines' ? (
              <Textarea
                value={contentGuidelinesData.sampleCTA}
                onChange={(e) => setContentGuidelinesData(prev => ({ ...prev, sampleCTA: e.target.value }))}
                className="mt-2"
                rows={2}
              />
            ) : (
              <blockquote className="mt-2 border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r-md">
                <p className="text-sm italic">"{contentGuidelinesData.sampleCTA}"</p>
              </blockquote>
            )}
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
                  <Badge key={index} variant="destructive" className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Favorite Posts</Label>
            {editingSection === 'contentGuidelines' ? (
              <div className="space-y-2 mt-2">
                {contentGuidelinesData.favPosts.map((post, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Textarea
                      value={post}
                      onChange={(e) => handleFavPostChange(index, e.target.value)}
                      className="flex-1"
                      placeholder="Favorite post example"
                      rows={2}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveFavPost(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddFavPost}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Favorite Post
                </Button>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {contentGuidelinesData.favPosts.map((post, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{post}</p>
                  </div>
                ))}
              </div>
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
                You are about to permanently delete the company profile for <strong>{profile.profileName}</strong>. 
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

export default ProfileDetailsCompany;