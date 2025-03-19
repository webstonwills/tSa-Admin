import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Loader2, Send, Reply, X, Image, Smile, Paperclip, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Define interfaces for our data structures
interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  reply_to_id: string | null;
  seen: boolean;
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
  const [typingUsers, setTypingUsers] = useState<{[key: string]: boolean}>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [userReady, setUserReady] = useState(false);
  
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
  
  // Check if user is ready and properly authenticated
  useEffect(() => {
    if (user?.id) {
      console.log("User authenticated:", user);
      setUserReady(true);
    } else {
      console.log("User not ready:", user);
      setUserReady(false);
      
      // Try to get the session directly from Supabase
      const checkSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Direct session check:", session, "Error:", error);
        
        if (session?.user?.id) {
          console.log("Found user via direct session check:", session.user);
          setUserReady(true);
        }
      };
      
      checkSession();
    }
  }, [user]);
  
  // Fetch messages on component mount and set up real-time subscriptions
  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel('chat_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        console.log('New message received:', payload);
        fetchMessages();
        
        // If the message is not from the current user, increment unread count
        if (payload.new && payload.new.user_id !== user?.id) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    // Set up typing indicator channel
    const typingChannel = supabase
      .channel('typing')
      .on('broadcast', { event: 'typing' }, (payload) => {
        // Add user to typing list
        if (payload.payload.user_id !== user?.id) {
          setTypingUsers(prev => ({
            ...prev,
            [payload.payload.user_id]: true
          }));
          
          // Remove user from typing list after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => {
              const newState = {...prev};
              delete newState[payload.payload.user_id];
              return newState;
            });
          }, 3000);
        }
      })
      .subscribe();

    // Log user for debugging
    console.log("Current user state:", user, "ID:", user?.id);

    return () => {
      messagesSubscription.unsubscribe();
      typingChannel.unsubscribe();
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
      
      // Get profiles for all message authors - remove avatar_url from the query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
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
          seen: msg.seen || false,
          profile: userProfile ? {
            full_name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
            avatar_url: null // Set to null since the column doesn't exist
          } : undefined,
          reply_to: replyToMessage ? {
            ...replyToMessage,
            profile: replyToProfile ? {
              full_name: `${replyToProfile.first_name || ''} ${replyToProfile.last_name || ''}`.trim(),
              avatar_url: null // Set to null since the column doesn't exist
            } : undefined
          } : undefined
        };
      });
      
      console.log("Processed messages:", processedMessages);
      setMessages(processedMessages);
      
      // Reset unread count
      setUnreadCount(0);
      
      // Mark messages as seen
      const unseenMessages = processedMessages
        .filter(msg => !msg.seen && msg.user_id !== user?.id)
        .map(msg => msg.id);
        
      if (unseenMessages.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ seen: true })
          .in('id', unseenMessages);
      }
      
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
      console.log("Attempting to send message, user state:", user, "ID:", user?.id);

      // Make sure user ID is present
      if (!user?.id) {
        // Try to check if we can get the user from supabase directly
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData?.user?.id) {
          console.error("Failed to get user ID even from direct auth check:", userError);
          toast({
            title: 'Authentication Error',
            description: 'Please log out and log back in to fix this issue.',
            variant: 'destructive',
          });
          throw new Error("User ID is missing. Please try logging out and back in.");
        }
        
        // We have a user ID from direct check
        console.log("Found user ID via direct auth check:", userData.user.id);
        
        const { data, error } = await supabase.from('chat_messages').insert({
          content: messageText.trim(),
          user_id: userData.user.id,
          reply_to_id: replyingTo?.id || null,
          seen: false
        }).select();

        if (error) {
          throw error;
        }

        console.log("Message sent successfully with direct user ID:", data);
      } else {
        // Normal flow when user is available from context
        const { data, error } = await supabase.from('chat_messages').insert({
          content: messageText.trim(),
          user_id: user.id,
          reply_to_id: replyingTo?.id || null,
          seen: false
        }).select();

        if (error) {
          throw error;
        }

        console.log("Message sent successfully with context user ID:", data);
      }

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

  // Get user initials for avatar - make more robust with fallbacks
  const getInitials = (message: Message) => {
    if (message.profile?.full_name && message.profile.full_name.trim() !== '') {
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

  // Format timestamp in a more readable way
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  // Handle typing notification
  const handleTyping = () => {
    if (user?.id) {
      supabase.channel('typing').send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user.id }
      });
    }
  };

  // Force refresh authentication
  const refreshAuth = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session?.user?.id) {
        console.log("Auth refreshed, new user data:", data.session.user);
        toast({
          title: 'Authentication Refreshed',
          description: 'You should now be able to send messages.',
        });
        setUserReady(true);
        await fetchMessages();
      } else {
        throw new Error("Unable to refresh authentication");
      }
    } catch (error: any) {
      console.error("Auth refresh failed:", error);
      toast({
        title: 'Authentication Failed',
        description: 'Please try logging out and back in.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* The main chat content - exclude the header that's already in the dashboard layout */}
      <div className="flex-1 flex flex-col h-[calc(100vh-170px)] overflow-hidden">
        {/* Auth Status Banner - show if user is not ready */}
        {!userReady && (
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 p-3 text-center flex flex-col gap-2">
            <p>Authentication issue detected. Your session may have expired.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mx-auto bg-amber-200 dark:bg-amber-800 hover:bg-amber-300"
              onClick={refreshAuth}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>Refresh Authentication</>
              )}
            </Button>
          </div>
        )}
        
        {/* Chat header */}
        <div className="border-b p-3 bg-background sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">Team Chat</h2>
              <Badge variant="secondary" className="text-xs">
                {messages.length} messages
              </Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Messages area - expanded to fill available space */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message, index) => {
                // Check if this is the first message of the day or from this user
                const showDateDivider = index === 0 || 
                  !isToday(new Date(messages[index-1].created_at)) && isToday(new Date(message.created_at)) ||
                  !isYesterday(new Date(messages[index-1].created_at)) && isYesterday(new Date(message.created_at));
                
                const isNewSender = index === 0 || messages[index-1].user_id !== message.user_id;
                
                return (
                  <React.Fragment key={message.id}>
                    {/* Date divider */}
                    {showDateDivider && (
                      <div className="my-4 flex items-center justify-center">
                        <div className="border-t flex-grow"></div>
                        <span className="mx-2 text-xs text-muted-foreground bg-background px-2">
                          {isToday(new Date(message.created_at)) 
                            ? 'Today' 
                            : isYesterday(new Date(message.created_at))
                              ? 'Yesterday'
                              : format(new Date(message.created_at), 'MMMM d, yyyy')}
                        </span>
                        <div className="border-t flex-grow"></div>
                      </div>
                    )}
                    
                    <div className="group relative">
                      {/* Reply preview */}
                      {message.reply_to && (
                        <div className={`mb-1 p-2 bg-muted/50 rounded text-sm text-muted-foreground border-l-2 border-primary flex items-start gap-2 max-w-[85%] ${
                          message.user_id === user?.id ? 'ml-auto' : 'ml-12'
                        }`}>
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
                        {/* Avatar - only show for new sender or after a time gap */}
                        {(isNewSender || index === 0) && (
                          <Avatar className={cn("h-8 w-8 flex-shrink-0", getUserColor(message.user_id))}>
                            <AvatarImage
                              src={message.profile?.avatar_url}
                              alt={message.profile?.full_name || "User"}
                            />
                            <AvatarFallback>{getInitials(message)}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        {/* Message content */}
                        <div className={cn(
                          "rounded-lg p-3 min-w-[80px] break-words",
                          message.user_id === user?.id 
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted rounded-tl-none"
                        )}>
                          {/* Sender name - show only for first message in a group */}
                          {(isNewSender || index === 0) && message.user_id !== user?.id && (
                            <p className="font-medium text-xs mb-1">
                              {message.profile?.full_name || 'User'}
                            </p>
                          )}
                          
                          {/* Message text */}
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Timestamp and seen status */}
                          <div className={cn(
                            "flex items-center justify-end gap-1 mt-1",
                            message.user_id === user?.id 
                              ? "text-primary-foreground/70" 
                              : "text-muted-foreground"
                          )}>
                            <span className="text-[10px]">
                              {formatMessageTime(message.created_at)}
                            </span>
                            
                            {/* Show seen status for current user's messages */}
                            {message.user_id === user?.id && (
                              message.seen 
                                ? <CheckCheck className="h-3 w-3" /> 
                                : <Check className="h-3 w-3" />
                            )}
                          </div>
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
                  </React.Fragment>
                );
              })}
              
              {/* Typing indicators */}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex items-center gap-2 pl-12 text-sm text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                  </div>
                  <span>Someone is typing...</span>
                </div>
              )}
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
          <div className="border-t p-2 sm:p-3 bg-background sticky bottom-0 left-0 right-0">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  id="message-input"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && userReady) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  onKeyUp={handleTyping}
                  placeholder={userReady ? "Type a message..." : "Authentication required..."}
                  className="min-h-[60px] max-h-[120px] resize-none pr-10 sm:min-h-[60px] focus:ring-1 focus:ring-primary"
                  disabled={!userReady}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={!userReady}>
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={!userReady}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={!userReady}>
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={sending || !userReady || !messageText.trim()}
                className={`h-10 w-10 rounded-full ${sending ? 'opacity-70' : ''}`}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!userReady && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                You need to be authenticated to send messages. Try refreshing the page or logging out and back in.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
