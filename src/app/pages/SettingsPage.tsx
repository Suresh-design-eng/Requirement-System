import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  User,
  Mail,
  Shield,
  Bell,
  Lock,
  Moon,
  Sun,
  CheckCircle
} from 'lucide-react';
import CandidateSettings from '../components/candidate/CandidateSettings';

export default function SettingsPage() {
  const { currentUser, isDarkMode, toggleDarkMode } = useApp();
  const [notice, setNotice] = useState('');

  if (currentUser?.role === 'user') {
    return <CandidateSettings />;
  }

  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: User,
      settings: [
        {
          label: 'Full Name',
          value: currentUser?.name || 'Not set',
          type: 'text'
        },
        {
          label: 'Email Address',
          value: currentUser?.email || 'Not set',
          type: 'email',
          icon: Mail
        },
        {
          label: 'Role',
          value: currentUser?.role || 'Not set',
          type: 'badge',
          icon: Shield,
          readonly: true
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Moon,
      settings: [
        {
          label: 'Dark Mode',
          value: isDarkMode,
          type: 'toggle',
          action: toggleDarkMode,
          icon: isDarkMode ? Moon : Sun
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          label: 'Email Notifications',
          value: true,
          type: 'toggle',
          description: 'Receive email updates about your applications'
        },
        {
          label: 'Application Updates',
          value: true,
          type: 'toggle',
          description: 'Get notified when your application status changes'
        },
        {
          label: 'Job Recommendations',
          value: false,
          type: 'toggle',
          description: 'Receive personalized job recommendations'
        }
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      settings: [
        {
          label: 'Change Password',
          type: 'button',
          action: () =>
            setNotice('Password changes require a backend account service and are disabled in this frontend-only build.')
        },
        {
          label: 'Two-Factor Authentication',
          value: false,
          type: 'toggle',
          description: 'Add an extra layer of security to your account'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/30">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl border border-primary/20 p-8 mb-8"
        >
          <div className="flex items-center gap-6">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-20 h-20 rounded-2xl ring-4 ring-primary/20"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{currentUser?.name}</h2>
              <p className="text-muted-foreground mb-3">{currentUser?.email}</p>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold flex items-center gap-1 capitalize">
                  <Shield className="w-4 h-4" />
                  {currentUser?.role}
                </div>
                {currentUser?.resumeUrl && (
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Resume Uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary"
          >
            {notice}
          </motion.div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + sectionIndex * 0.1 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <SectionIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{section.title}</h3>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {section.settings.map((setting, settingIndex) => {
                    const SettingIcon = setting.icon;

                    return (
                      <div
                        key={settingIndex}
                        className="flex items-center justify-between pb-6 last:pb-0 border-b border-border last:border-0"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {SettingIcon && (
                            <div className="p-2 bg-muted rounded-lg mt-1">
                              <SettingIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <label className="font-medium block mb-1">
                              {setting.label}
                            </label>
                            {setting.description && (
                              <p className="text-sm text-muted-foreground">
                                {setting.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="ml-4">
                          {setting.type === 'text' || setting.type === 'email' ? (
                            <input
                              type={setting.type}
                              value={setting.value as string}
                              readOnly={setting.readonly}
                              className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                          ) : setting.type === 'badge' ? (
                            <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold capitalize">
                              {setting.value as string}
                            </div>
                          ) : setting.type === 'toggle' ? (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={setting.action}
                              className={`relative w-14 h-7 rounded-full transition-colors ${
                                setting.value
                                  ? 'bg-primary'
                                  : 'bg-muted'
                              }`}
                            >
                              <motion.div
                                animate={{ x: setting.value ? 28 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                              />
                            </motion.button>
                          ) : setting.type === 'button' ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={setting.action}
                              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                              Change
                            </motion.button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-destructive/5 rounded-2xl border border-destructive/20 p-8"
        >
          <h3 className="font-semibold text-lg text-destructive mb-4">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-1">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setNotice('Account deletion requires backend support and has been disabled in this build.')
              }
              className="px-4 py-2 bg-destructive text-white rounded-lg font-medium hover:bg-destructive/90 transition-colors"
            >
              Delete Account
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
