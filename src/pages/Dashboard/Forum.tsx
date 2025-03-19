import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Send, Reply, X, Image, Smile, Paperclip, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define interfaces for our data structures
interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  reply_to_id: string | null;
  profile?: {
    full_name: string;
    avatar_url: string;
  };
  reply_to?: Message;
}

// Array of colors for user avatars
const userColors = [
  "bg-blue-600",
  "bg-green-600", 
  "bg-purple-600",
  "bg-pink-600",
  "bg-amber-600",
  "bg-indigo-600",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-teal-600",
];

export default function Chat() {
  // State variables
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // User color mapping
  const userColorMap = useRef(new Map<string, string>());
  
  // Get a consistent color for a user based on their ID
  const getUserColor = (userId: string) => {
    if (!userColorMap.current.has(userId)) {
      const hashCode = userId.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      const colorIndex = Math.abs(hashCode) % userColors.length;
      userColorMap.current.set(userId, userColors[colorIndex]);
    }
    return userColorMap.current.get(userId) || "bg-primary";
  };
  
  // Fetch messages on component mount and set up real-time subscriptions
  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel('chat_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    // Log user for debugging
    console.log("Current user:", user);

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user]);

  // Function to fetch messages with profiles
  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // First get the basic message data without joins
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }
      
      // We'll fetch profiles separately since we're having join issues
      const messages = data || [];
      
      if (messages.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }
      
      // Extract all user IDs from messages (including those in replies)
      const userIds = [...new Set(messages.map(msg => msg.user_id))]; 
      
      // Get profiles for all message authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue anyway, we'll just have messages without profile info
      }
      
      // Create a map of profiles by user ID for quick lookup
      const profilesMap = {};
      if (profilesData) {
        for (const profile of profilesData) {
          profilesMap[profile.id] = profile;
        }
      }
      
      // Process the messages with profile data
      const processedMessages = messages.map(msg => {
        const userProfile = profilesMap[msg.user_id];
        
        // Find the reply message if there's a reply_to_id
        const replyToMessage = msg.reply_to_id 
          ? messages.find(m => m.id === msg.reply_to_id)
          : null;
          
        // Get the profile for the reply message author
        const replyToProfile = replyToMessage && profilesMap[replyToMessage.user_id];
        
        return {
          ...msg,
          profile: userProfile ? {
            full_name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
            avatar_url: userProfile.avatar_url
          } : undefined,
          reply_to: replyToMessage ? {
            ...replyToMessage,
            profile: replyToProfile ? {
              full_name: `${replyToProfile.first_name || ''} ${replyToProfile.last_name || ''}`.trim(),
              avatar_url: replyToProfile.avatar_url
            } : undefined
          } : undefined
        };
      });
      
      console.log("Processed messages:", processedMessages);
      setMessages(processedMessages);
      
      // Scroll to bottom after messages load
      setTimeout(() => scrollToBottom(), 100);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load chat messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Function to send a message
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      return;
    }

    setSending(true);
    try {
      // Log what we're trying to insert
      console.log("Sending message:", {
        content: messageText.trim(),
        user_id: user?.id,
        reply_to_id: replyingTo?.id || null,
      });

      // Make sure user ID is present
      if (!user?.id) {
        throw new Error("User ID is missing. Please try logging out and back in.");
      }

      const { data, error } = await supabase.from('chat_messages').insert({
        content: messageText.trim(),
        user_id: user.id,
        reply_to_id: replyingTo?.id || null,
      }).select();

      if (error) {
        throw error;
      }

      console.log("Message sent successfully:", data);

      // Clear message text and reply state
      setMessageText('');
      setReplyingTo(null);
      
      // Refetch messages to include the new one
      await fetchMessages();
      
      // Scroll to bottom
      setTimeout(() => scrollToBottom(), 100);
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (message: Message) => {
    if (message.profile?.full_name) {
      return message.profile.full_name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return 'U';
  };

  // Check if message is from current user
  const isCurrentUser = (messageUserId: string) => {
    return user?.id === messageUserId;
  };

  // Handle reply to message
  const handleReply = (message: Message) => {
    setReplyingTo(message);
    // Focus on the text input
    document.getElementById('message-input')?.focus();
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* The main chat content - exclude the header that's already in the dashboard layout */}
      <div className="flex-1 flex flex-col h-[calc(100vh-170px)] overflow-hidden">
        {/* Messages area - expanded to fill available space */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="group relative">
                  {/* Reply preview */}
                  {message.reply_to && (
                    <div className="ml-12 mb-1 p-2 bg-muted/50 rounded text-sm text-muted-foreground border-l-2 border-primary flex items-start gap-2 max-w-[85%]">
                      <Reply className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-medium text-xs">
                          {message.reply_to.profile?.full_name || 'User'}
                        </p>
                        <p className="truncate">{message.reply_to.content}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div className={cn(
                    "flex items-start gap-2 max-w-[85%] group relative",
                    message.user_id === user?.id ? "ml-auto flex-row-reverse" : ""
                  )}>
                    {/* Avatar */}
                    <Avatar className={cn("h-8 w-8 flex-shrink-0", getUserColor(message.user_id))}>
                      <AvatarImage
                        src={message.profile?.avatar_url}
                        alt={message.profile?.full_name || "User"}
                      />
                      <AvatarFallback>{getInitials(message)}</AvatarFallback>
                    </Avatar>
                    
                    {/* Message content */}
                    <div className={cn(
                      "rounded-lg p-3 min-w-[80px] break-words",
                      message.user_id === user?.id 
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                    )}>
                      {/* Sender name */}
                      {message.user_id !== user?.id && (
                        <p className="font-medium text-xs mb-1">
                          {message.profile?.full_name || 'User'}
                        </p>
                      )}
                      
                      {/* Message text */}
                      <p>{message.content}</p>
                      
                      {/* Timestamp */}
                      <p className={cn(
                        "text-[10px] mt-1 text-right",
                        message.user_id === user?.id 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground"
                      )}>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    
                    {/* Message actions */}
                    <div className={cn(
                      "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
                      message.user_id === user?.id ? "left-0 transform -translate-x-full" : "right-0 transform translate-x-full"
                    )}>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={() => setReplyingTo(message)}
                      >
                        <Reply className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Be the first to send a message!</p>
            </div>
          )}
        </ScrollArea>

        {/* Message input area - fixed at the bottom */}
        <div className="w-full mt-auto">
          {/* Reply preview */}
          {replyingTo && (
            <div className="p-2 border-t bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Reply className="h-3.5 w-3.5" />
                <span>Replying to <span className="font-medium">{replyingTo.profile?.full_name || 'User'}</span></span>
                <span className="truncate max-w-[150px] sm:max-w-[300px]">{replyingTo.content}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setReplyingTo(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Input box and send button */}
          <div className="border-t p-2 sm:p-3 bg-background">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  id="message-input"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="min-h-[60px] max-h-[120px] resize-none pr-10 sm:min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={sending}
                className="h-10 w-10 rounded-full"
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
      </div>
    </div>
  );
}
