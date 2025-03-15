
import { useState, useEffect, useRef, useMemo } from "react";
import { Channel } from "@/pages/Dashboard/Forum";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

interface ForumChannelViewProps {
  channel: Channel;
}

// Array of colors for unique user avatars within the same color family
const userColors = [
  "bg-primary", // Default primary color
  "bg-purple-600",
  "bg-purple-700",
  "bg-indigo-500",
  "bg-indigo-600",
  "bg-violet-500",
  "bg-violet-600",
  "bg-fuchsia-500",
  "bg-fuchsia-600",
];

const ForumChannelView = ({ channel }: ForumChannelViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Map to store user colors by user ID
  const userColorMap = useMemo(() => new Map<string, string>(), []);

  // Function to get a consistent color for a user based on their ID
  const getUserColor = (userId: string) => {
    if (!userColorMap.has(userId)) {
      // Use the hash of the user ID to select a color deterministically
      const hashCode = userId.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const colorIndex = Math.abs(hashCode) % userColors.length;
      userColorMap.set(userId, userColors[colorIndex]);
    }
    return userColorMap.get(userId) || "bg-primary";
  };

  useEffect(() => {
    if (channel) {
      fetchMessages();

      // Setup realtime subscription for new messages
      const realtimeChannel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'forum_messages',
            filter: `channel_id=eq.${channel.id}`
          },
          (payload) => {
            // Add message to the chat if it's not from the current user
            const newMessage = payload.new as Message;
            
            // Fetch the profile for the new message
            fetchMessageProfile(newMessage).then(messageWithProfile => {
              setMessages(prev => [...prev, messageWithProfile]);
              setTimeout(() => scrollToBottom(), 100);
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(realtimeChannel);
      };
    }
  }, [channel.id]);

  const fetchMessageProfile = async (message: Message): Promise<Message> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', message.user_id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return message;
      }

      return { ...message, profile: data };
    } catch (error) {
      console.error('Error:', error);
      return message;
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_messages')
        .select('*')
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (data) {
        // Fetch profiles for all messages
        const messagesWithProfiles = await Promise.all(
          data.map(fetchMessageProfile)
        );
        setMessages(messagesWithProfiles);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user) return;
    
    try {
      setSending(true);
      const { error } = await supabase
        .from('forum_messages')
        .insert([
          {
            content: messageText.trim(),
            user_id: user.id,
            channel_id: channel.id
          }
        ]);

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Clear input after successful send
      setMessageText("");
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };

  const getInitials = (message: Message) => {
    if (message.profile?.first_name && message.profile?.last_name) {
      return `${message.profile.first_name[0]}${message.profile.last_name[0]}`.toUpperCase();
    }
    return message.profile?.email?.[0].toUpperCase() || 'U';
  };

  const getUserName = (message: Message) => {
    // First name is prioritized but fallbacks are in place
    if (message.profile?.first_name) {
      return message.profile.first_name;
    }
    if (message.profile?.first_name && message.profile?.last_name) {
      return `${message.profile.first_name} ${message.profile.last_name}`;
    }
    return message.profile?.email || 'Unknown User';
  };

  const isCurrentUser = (messageUserId: string) => {
    return user?.id === messageUserId;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b">
        <h2 className="font-semibold text-lg">{channel.name}</h2>
        {channel.description && (
          <p className="text-sm text-muted-foreground">{channel.description}</p>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser(message.user_id) ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${isCurrentUser(message.user_id) ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}>
                  <Avatar className="w-8 h-8 mt-1">
                    <div className={`w-full h-full rounded-full ${isCurrentUser(message.user_id) ? 'bg-primary' : getUserColor(message.user_id)} flex items-center justify-center text-primary-foreground text-xs font-medium`}>
                      {getInitials(message)}
                    </div>
                  </Avatar>
                  
                  <div className={`rounded-lg px-3 py-2 ${
                    isCurrentUser(message.user_id) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-xs">
                        {isCurrentUser(message.user_id) ? 'You' : getUserName(message)}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Be the first to send a message!</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-end gap-2">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="resize-none min-h-[60px]"
            disabled={sending}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!messageText.trim() || sending}
            size="icon"
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumChannelView;
