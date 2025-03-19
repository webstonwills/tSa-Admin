import { useState, useEffect, useRef, useMemo } from "react";
import { Channel } from "@/pages/Dashboard/Forum";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Reply, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  reply_to?: {
    id: string;
    content: string;
    user_id: string;
    profile?: {
      first_name: string | null;
      last_name: string | null;
      email: string;
    } | null;
  };
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
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
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
            channel_id: channel.id,
            reply_to_id: replyingTo?.id || null
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

      // Clear input and reply state after successful send
      setMessageText("");
      setReplyingTo(null);
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

  const handleReply = (message: Message) => {
    setReplyingTo({
      ...message,
      created_at: message.created_at
    });
  };

  const cancelReply = () => {
    setReplyingTo(null);
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
                <div className={`flex flex-col max-w-[80%] ${isCurrentUser(message.user_id) ? 'items-end' : 'items-start'}`}>
                  {/* Reply preview if message is a reply */}
                  {message.reply_to && (
                    <div className="text-xs text-muted-foreground mb-1">
                      Replying to {getUserName(message.reply_to)}
                    </div>
                  )}
                  
                  <div className={`flex items-start gap-2 ${isCurrentUser(message.user_id) ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className={`h-8 w-8 ${getUserColor(message.user_id)} text-white flex items-center justify-center`}>
                      {getInitials(message)}
                    </Avatar>
                    
                    <div className={`group relative rounded-lg px-4 py-2 ${
                      isCurrentUser(message.user_id) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {formatMessageTime(message.created_at)}
                      </div>
                      
                      {/* Reply button - only show on hover */}
                      <button
                        onClick={() => handleReply(message)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        )}
      </ScrollArea>
      
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 border-t">
          <div className="flex-1 text-sm text-muted-foreground">
            Replying to {getUserName(replyingTo)}
          </div>
          <button
            onClick={cancelReply}
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Message input */}
      <div className="flex-shrink-0 p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyingTo ? `Reply to ${getUserName(replyingTo)}...` : "Type a message..."}
            className="min-h-[60px] resize-none"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!messageText.trim() || sending}
            size="icon"
            className="self-end"
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
