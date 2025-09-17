// src/app/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { getFcmToken } from '@/firebase';
import { servers, Server } from '@/utils/servers';
import '@/app/styles/NotificationSettings.css';

const API_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_API_URL;

const NotificationSettings = () => {
  const { user, jwt, loading: authLoading } = useAuth();
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(false);
      return;
    }
    const fetchCurrentSettings = async () => {
      try {
        const query = `${API_ENDPOINT}/api/user-notifications?filters[user][id][$eq]=${user.id}`;
        const { data: responseData } = await axios.get(query, { headers: { Authorization: `Bearer ${jwt}` } });
        
        if (responseData.data && responseData.data.length > 0) {
          const setting = responseData.data[0];
          setSelectedServer(setting.attributes.selectedServer);
        } else {
          setSelectedServer(servers[0].id);
        }
      } catch (error) {
        console.error("Failed to load user notification settings:", error);
        setSelectedServer(servers[0].id);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentSettings();
  }, [user, jwt, authLoading]);

  const handleSave = async () => {
    if (!user) {
      alert("Please log in to save your settings.");
      return;
    }
    setIsSaving(true);
    try {
      const fcmToken = await getFcmToken();
      if (!fcmToken) {
        alert("Could not get notification token. Please grant permissions and try again.");
        setIsSaving(false);
        return;
      }
      
      const payload = {
        fcmToken,
        selectedServer,
      };

      await axios.post(`${API_ENDPOINT}/api/user-notifications/upsert`, payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      alert('✅ Settings saved successfully!');
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert('❌ Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) { return <div className="settings-container">Loading...</div>; }
  if (!user) { return <div className="settings-container">Please log in to manage notifications.</div>; }

  return (
    <div className="settings-container">
      <h1>Notification Settings</h1>
      <p className="description">
        Select your primary server to receive in-game event reminders.
      </p>
      <div className="server-selection">
        {servers.map((server: Server) => (
          <label key={server.id} className="radio-label">
            <input
              type="radio"
              name="server"
              value={server.id}
              checked={selectedServer === server.id}
              onChange={() => setSelectedServer(server.id)}
            />
            <span className="radio-custom"></span>
            {server.name}
          </label>
        ))}
      </div>
      <div className="save-button-container">
        <button onClick={handleSave} disabled={isSaving} className="save-button">
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;