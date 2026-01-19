import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Layout } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Badge,
} from '@/components/ui';
import { useAuth } from '@/contexts';
import {
  ArrowLeft,
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Key,
  Mail,
  Save,
  Moon,
  Sun,
  Monitor,
  Check,
  AlertCircle,
  LogOut,
  Trash2,
  Camera,
  Link2,
} from 'lucide-react';
import { Toggle, Dropdown } from '@/components/ui/Form';

import { Avatar } from '@/components/ui/Avatar';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile settings
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [browserNotifications, setBrowserNotifications] = useState(false);

  // Appearance settings
  const [theme, setTheme] = useState('system');
  const [accentColor, setAccentColor] = useState('blue');
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('team');
  const [activityStatus, setActivityStatus] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);

  const handleSaveProfile = () => {
    toast.success('Profile settings saved successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const handleSaveAppearance = () => {
    toast.success('Appearance settings applied!');
  };

  const handleSavePrivacy = () => {
    toast.success('Privacy settings updated!');
  };

  const themeOptions = [
    { label: 'Light', value: 'light', icon: <Sun className="h-4 w-4" /> },
    { label: 'Dark', value: 'dark', icon: <Moon className="h-4 w-4" /> },
    { label: 'System', value: 'system', icon: <Monitor className="h-4 w-4" /> },
  ];

  const colorOptions = [
    { name: 'Blue', value: 'blue', color: '#3b82f6' },
    { name: 'Purple', value: 'purple', color: '#8b5cf6' },
    { name: 'Green', value: 'green', color: '#22c55e' },
    { name: 'Orange', value: 'orange', color: '#f97316' },
    { name: 'Pink', value: 'pink', color: '#ec4899' },
    { name: 'Cyan', value: 'cyan', color: '#06b6d4' },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700">
            <Settings className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'appearance', label: 'Appearance', icon: Palette },
                  { id: 'privacy', label: 'Privacy', icon: Shield },
                  { id: 'integrations', label: 'Integrations', icon: Link2 },
                  { id: 'danger', label: 'Danger Zone', icon: AlertCircle },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      activeTab === item.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile details and public information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar name={user?.name || 'User'} size="xl" />
                    <div className="space-y-2">
                      <Button variant="secondary" size="sm" leftIcon={<Camera className="h-4 w-4" />}>
                        Change Avatar
                      </Button>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        JPG, GIF or PNG. Max size 1MB.
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Tell us a bit about yourself..."
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Password</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Last changed 30 days ago
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      Change Password
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3 pl-6">
                    <Toggle
                      label="Enable email notifications"
                      description="Receive notifications via email"
                      checked={emailNotifications}
                      onChange={setEmailNotifications}
                    />
                    <Toggle
                      label="Incident alerts"
                      description="Get notified when new incidents are created"
                      checked={incidentAlerts}
                      onChange={setIncidentAlerts}
                      disabled={!emailNotifications}
                    />
                    <Toggle
                      label="Analysis complete"
                      description="Get notified when incident analysis is complete"
                      checked={analysisComplete}
                      onChange={setAnalysisComplete}
                      disabled={!emailNotifications}
                    />
                    <Toggle
                      label="Weekly digest"
                      description="Receive a weekly summary of incident activity"
                      checked={weeklyDigest}
                      onChange={setWeeklyDigest}
                      disabled={!emailNotifications}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Push Notifications
                  </h3>
                  <div className="pl-6">
                    <Toggle
                      label="Browser notifications"
                      description="Enable desktop push notifications"
                      checked={browserNotifications}
                      onChange={setBrowserNotifications}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveNotifications}>
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how NileTrace looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Theme Selection */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">
                    Theme
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                          theme === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        )}
                      >
                        <div
                          className={cn(
                            'p-3 rounded-lg',
                            theme === option.value
                              ? 'bg-primary-100 dark:bg-primary-800/50 text-primary-600 dark:text-primary-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          )}
                        >
                          {option.icon}
                        </div>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            theme === option.value
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-slate-700 dark:text-slate-300'
                          )}
                        >
                          {option.label}
                        </span>
                        {theme === option.value && (
                          <Check className="h-4 w-4 text-primary-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">
                    Accent Color
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAccentColor(option.value)}
                        className={cn(
                          'group flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                          accentColor === option.value
                            ? 'border-slate-900 dark:border-white'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        )}
                      >
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {option.name}
                        </span>
                        {accentColor === option.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4">
                  <Toggle
                    label="Compact mode"
                    description="Reduce spacing and make the interface more compact"
                    checked={compactMode}
                    onChange={setCompactMode}
                  />
                  <Toggle
                    label="Enable animations"
                    description="Show smooth transitions and animations"
                    checked={animationsEnabled}
                    onChange={setAnimationsEnabled}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSaveAppearance}>
                    Apply Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Dropdown
                  label="Profile Visibility"
                  value={profileVisibility}
                  onChange={setProfileVisibility}
                  options={[
                    { label: 'Public', value: 'public', description: 'Anyone can view your profile' },
                    { label: 'Team Only', value: 'team', description: 'Only team members can view' },
                    { label: 'Private', value: 'private', description: 'Only you can view your profile' },
                  ]}
                />

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4">
                  <Toggle
                    label="Show activity status"
                    description="Let others see when you're online"
                    checked={activityStatus}
                    onChange={setActivityStatus}
                  />
                  <Toggle
                    label="Data sharing for improvements"
                    description="Help improve NileTrace by sharing anonymous usage data"
                    checked={dataSharing}
                    onChange={setDataSharing}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSavePrivacy}>
                    Save Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect external services and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Slack', description: 'Get notifications in Slack', connected: false },
                  { name: 'PagerDuty', description: 'Sync incidents with PagerDuty', connected: false },
                  { name: 'Jira', description: 'Create Jira tickets from incidents', connected: true },
                  { name: 'GitHub', description: 'Link incidents to commits and PRs', connected: false },
                  { name: 'Datadog', description: 'Import metrics and alerts', connected: false },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <Link2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {integration.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    {integration.connected ? (
                      <Badge variant="success">Connected</Badge>
                    ) : (
                      <Button variant="secondary" size="sm">
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          {activeTab === 'danger' && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="error" title="Warning">
                  These actions are permanent and cannot be undone. Please proceed with caution.
                </Alert>

                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Sign out everywhere
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Sign out of all devices and sessions
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<LogOut className="h-4 w-4" />}
                    onClick={logout}
                  >
                    Sign Out All
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Delete Account
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    onClick={() => toast.error('Account deletion is disabled in demo mode')}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};
