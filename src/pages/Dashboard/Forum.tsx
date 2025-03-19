import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ForumChannelList from "@/components/forum/ForumChannelList";
import ForumChannelView from "@/components/forum/ForumChannelView";
import { useAuth } from "@/components/auth/AuthContext";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import NewChannelDialog from "@/components/forum/NewChannelDialog";
import { useLocation } from "react-router-dom";

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
}

const Forum = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // Check if the current user is a CEO (based on the URL path)
  const isCEO = location.pathname.includes("/dashboard/ceo");
  
  // Set page title using the document API
  useEffect(() => {
    document.title = "Organization Forum | Dashboard";
    return () => {
      // Reset title when component unmounts (optional)
      document.title = "Dashboard";
    };
  }, []);
  
  useEffect(() => {
    fetchChannels();

    // Setup realtime subscription for new channels
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_channels'
        },
        () => {
          fetchChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching channels:', error);
        return;
      }

      if (data) {
        setChannels(data);
        // Select the first channel by default if one exists and none is selected
        if (data.length > 0 && !selectedChannel) {
          setSelectedChannel(data[0]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelCreate = async (newChannel: { name: string; description: string }) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('forum_channels')
        .insert([
          {
            name: newChannel.name,
            description: newChannel.description,
            created_by: user.id
          }
        ])
        .select();

      if (error) {
        console.error('Error creating channel:', error);
        return;
      }

      if (data && data.length > 0) {
        // The channel should be added via the realtime subscription
        setSelectedChannel(data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Organization Forum</h1>
          {isCEO && <NewChannelDialog onCreateChannel={handleChannelCreate} />}
        </div>
        
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Channels List - Fixed width on desktop, full width on mobile */}
            <div className="w-full md:w-80 border-r flex-shrink-0">
              <ForumChannelList 
                channels={channels} 
                selectedChannel={selectedChannel} 
                onSelectChannel={setSelectedChannel} 
              />
            </div>
            
            {/* Chat View - Takes remaining space */}
            <div className="flex-1 flex flex-col">
              {selectedChannel ? (
                <ForumChannelView channel={selectedChannel} />
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground">
                  {channels.length > 0 ? 
                    "Select a channel to start chatting" : 
                    isCEO ? 
                      "No channels available. Create a new channel to get started." :
                      "No channels available. Only the CEO can create new channels."
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Forum;
