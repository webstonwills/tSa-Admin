import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Send, Reply, X } from 'lucide-react';

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
  reply_to?: {
    id: string;
    content: string;
    user_id: string;
    profile?: {
      full_name: string;
      avatar_url: string;
    };
  };
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
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profile:profiles(full_name, avatar_url),
          reply_to:chat_messages(
            id,
            content,
            user_id,
            profile:profiles(full_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      
      setMessages(messagesData || []);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages',
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
      const { error } = await supabase.from('chat_messages').insert([
        {
          content: messageText.trim(),
          user_id: user.id,
          reply_to_id: replyingTo?.id || null,
        },
      ]);

      if (error) throw error;

      setMessageText('');
      setReplyingTo(null);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
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
    <div className="container mx-auto px-3 py-4 max-w-3xl h-[calc(100vh-120px)]">
      <div className="flex flex-col h-full border rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b bg-card">
          <h1 className="text-xl font-bold">Chat</h1>
          <p className="text-sm text-muted-foreground">Group chat with all members</p>
        </div>
        
        {/* Messages */}
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
                    {/* Reply preview */}
                    {message.reply_to && (
                      <div 
                        className={`text-xs px-2 py-1 rounded-t-md ${
                          isCurrentUser(message.user_id) 
                            ? 'bg-primary/20 text-primary-foreground/80' 
                            : 'bg-muted/70 text-muted-foreground'
                        }`}
                      >
                        <span className="font-medium">
                          {message.reply_to.profile?.full_name || 'Unknown user'}:
                        </span> {message.reply_to.content.length > 40 
                          ? `${message.reply_to.content.substring(0, 40)}...` 
                          : message.reply_to.content}
                      </div>
                    )}
                    
                    <div className={`flex items-start gap-2 ${isCurrentUser(message.user_id) ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isCurrentUser(message.user_id) && (
                        <Avatar className={`h-8 w-8 ${getUserColor(message.user_id)} text-white flex-shrink-0`}>
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
                        
                        <div className={`relative rounded-lg px-3 py-2 ${
                          isCurrentUser(message.user_id) 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-muted rounded-tl-none'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </div>
                          
                          {/* Reply button */}
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
          <div className="flex items-center gap-2 p-2 bg-muted/30 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              <span className="font-medium">
                Replying to {replyingTo.profile?.full_name || 'Unknown user'}:
              </span> {replyingTo.content.length > 40 
                ? `${replyingTo.content.substring(0, 40)}...` 
                : replyingTo.content}
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
          <div className="flex gap-2">
            <Textarea
              id="message-input"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={replyingTo ? `Reply to ${replyingTo.profile?.full_name || 'Unknown user'}...` : "Type a message..."}
              className="min-h-[60px] resize-none"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!messageText.trim() || sending}
              size="icon"
              className="self-end h-10 w-10"
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
  );
}
