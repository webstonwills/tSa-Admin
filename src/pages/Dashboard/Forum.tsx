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

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, []);

  // Function to fetch messages with profiles
  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profile:profiles(id, first_name, last_name, email, avatar_url),
          reply_to:chat_messages!chat_messages_reply_to_id_fkey(
            id,
            content,
            user_id,
            profile:profiles(id, first_name, last_name, email, avatar_url)
          )
        `)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }
      
      // Process the data to match our Message interface
      const processedMessages = (data || []).map((msg: any) => {
        return {
          ...msg,
          profile: msg.profile ? {
            full_name: msg.profile.first_name + ' ' + (msg.profile.last_name || ''),
            avatar_url: msg.profile.avatar_url
          } : undefined,
          reply_to: msg.reply_to ? {
            ...msg.reply_to[0],
            profile: msg.reply_to[0]?.profile ? {
              full_name: msg.reply_to[0].profile.first_name + ' ' + (msg.reply_to[0].profile.last_name || ''),
              avatar_url: msg.reply_to[0].profile.avatar_url
            } : undefined
          } : undefined
        };
      });
      
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
    if (!messageText.trim() || !user) {
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('chat_messages').insert({
        content: messageText.trim(),
        user_id: user.id,
        reply_to_id: replyingTo?.id || null,
      });

      if (error) throw error;

      setMessageText('');
      setReplyingTo(null);
      fetchMessages(); // Fetch messages to ensure we get the latest
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

  // Handle enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    <div className="container mx-auto py-4 max-w-4xl">
      <div className="flex flex-col h-[calc(100vh-200px)] border rounded-xl shadow-md overflow-hidden bg-background">
        {/* Header - Always visible */}
        <div className="flex-shrink-0 p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">Team Chat</h1>
              <p className="text-sm text-muted-foreground">
                Connect with all team members in real-time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              <span className="text-sm font-medium text-muted-foreground">
                {messages.length > 0 ? `${messages.length} messages` : 'No messages yet'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <ScrollArea 
          className="flex-1 px-4 py-6 bg-gradient-to-b from-background to-muted/20" 
          ref={scrollAreaRef}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-6">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser(message.user_id) ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[80%] ${isCurrentUser(message.user_id) ? 'items-end' : 'items-start'}`}>
                    {/* Reply preview */}
                    {message.reply_to && (
                      <div 
                        className={`text-xs mb-1 px-3 py-1.5 rounded-t-lg ${
                          isCurrentUser(message.user_id) 
                            ? 'bg-primary/15 text-primary-foreground/90 rounded-tl-lg rounded-tr-none' 
                            : 'bg-muted/80 text-foreground/80 rounded-tr-lg rounded-tl-none'
                        }`}
                      >
                        <span className="font-medium">
                          {message.reply_to.profile?.full_name || 'Unknown user'}:
                        </span> {message.reply_to.content.length > 60 
                          ? `${message.reply_to.content.substring(0, 60)}...` 
                          : message.reply_to.content}
                      </div>
                    )}
                    
                    <div className={`flex items-start gap-2 ${isCurrentUser(message.user_id) ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isCurrentUser(message.user_id) && (
                        <Avatar className={`h-9 w-9 ${getUserColor(message.user_id)} text-white flex-shrink-0 ring-2 ring-background shadow-sm`}>
                          <AvatarFallback>{getInitials(message)}</AvatarFallback>
                          <AvatarImage src={message.profile?.avatar_url} />
                        </Avatar>
                      )}
                      
                      <div className="group">
                        {!isCurrentUser(message.user_id) && (
                          <div className="text-xs font-medium mb-1 ml-1">
                            {message.profile?.full_name || 'Unknown user'}
                          </div>
                        )}
                        
                        <div className={cn(
                          "relative rounded-lg px-4 py-2.5 shadow-sm",
                          isCurrentUser(message.user_id) 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "bg-card border rounded-tl-none"
                        )}>
                          <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                          </div>
                          <div className="text-xs mt-1.5 opacity-70 font-medium">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </div>
                          
                          {/* Reply button */}
                          <button
                            onClick={() => handleReply(message)}
                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                          >
                            <Reply className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full gap-3 text-muted-foreground">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Send className="h-8 w-8 text-primary/60" />
              </div>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Be the first to start the conversation!</p>
            </div>
          )}
        </ScrollArea>
        
        {/* Reply preview */}
        {replyingTo && (
          <div className="flex items-center gap-2 p-3 bg-muted/30 border-t border-b">
            <div className="flex-1 flex items-center gap-2">
              <Reply className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">
                  Replying to {replyingTo.profile?.full_name || 'Unknown user'}:
                </span> {replyingTo.content.length > 50 
                  ? `${replyingTo.content.substring(0, 50)}...` 
                  : replyingTo.content}
              </div>
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
        <div className="flex-shrink-0 p-4 border-t bg-card">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  id="message-input"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={replyingTo ? `Reply to ${replyingTo.profile?.full_name || 'Unknown user'}...` : "Type a message..."}
                  className="min-h-[60px] resize-none pr-24 text-base"
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                    type="button"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                    type="button"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={!messageText.trim() || sending}
                size="icon"
                className="h-10 w-10 rounded-full shadow-sm"
                type="submit"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Image className="h-3.5 w-3.5 mr-1" />
                  Image
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Mic className="h-3.5 w-3.5 mr-1" />
                  Voice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
