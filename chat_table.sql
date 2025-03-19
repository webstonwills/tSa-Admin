-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reply_to_id UUID REFERENCES public.chat_messages(id)
);

-- Add RLS policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for reading messages - anyone who's authenticated can read
CREATE POLICY "Anyone can read messages" 
  ON public.chat_messages
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Policy for inserting messages - users can create messages
CREATE POLICY "Users can create messages" 
  ON public.chat_messages
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating own messages - users can update their own messages
CREATE POLICY "Users can update own messages" 
  ON public.chat_messages
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for deleting own messages - users can delete their own messages  
CREATE POLICY "Users can delete own messages" 
  ON public.chat_messages
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime subscriptions
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Add indexes for better performance
CREATE INDEX chat_messages_user_id_idx ON public.chat_messages(user_id);
CREATE INDEX chat_messages_reply_to_id_idx ON public.chat_messages(reply_to_id);
CREATE INDEX chat_messages_created_at_idx ON public.chat_messages(created_at); 