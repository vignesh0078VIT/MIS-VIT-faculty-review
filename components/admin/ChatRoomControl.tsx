import React, { useState, useEffect } from 'react';
import { listenToSiteSettings, updateSiteSettings } from '../../firebase/services';
import { SiteSettings } from '../../types';

export const SiteSettingsControl: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = listenToSiteSettings((settingsData) => {
            setSettings(settingsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleToggle = async (key: keyof SiteSettings, value: boolean) => {
        if (settings) {
            const newSettings = { ...settings, [key]: value };
            setSettings(newSettings); // Optimistic update
            await updateSiteSettings({ [key]: value });
        }
    };

    if (loading) {
        return <div className="p-8">Loading site settings...</div>;
    }
    
    if (!settings) {
        return <div className="p-8">Could not load site settings.</div>;
    }

    const ToggleSwitch: React.FC<{
        id: string;
        label: string;
        description: string;
        checked: boolean;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }> = ({ id, label, description, checked, onChange }) => (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-medium text-gray-900">{label}</h2>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    id={id}
                    className="sr-only peer"
                    checked={checked}
                    onChange={onChange}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 flex-1 h-screen overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Site Settings</h1>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl space-y-8">
                <ToggleSwitch
                    id="chat-toggle"
                    label="Enable Student Chat Room"
                    description="When enabled, all users can access the public chat room."
                    checked={settings.isChatEnabled}
                    onChange={(e) => handleToggle('isChatEnabled', e.target.checked)}
                />
                 <ToggleSwitch
                    id="about-toggle"
                    label="Enable About Page"
                    description="When enabled, the 'About' page will be visible to all users."
                    checked={settings.isAboutPageEnabled}
                    onChange={(e) => handleToggle('isAboutPageEnabled', e.target.checked)}
                />
            </div>
        </div>
    );
};