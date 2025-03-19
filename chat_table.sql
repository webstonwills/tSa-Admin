-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  seen BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to view all messages"
  ON public.chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Allow users to insert their own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update seen status on any message"
  ON public.chat_messages FOR UPDATE
  USING (true)
  WITH CHECK (
    (auth.uid() IS NOT NULL) AND 
    (OLD.content = NEW.content) AND
    (OLD.user_id = NEW.user_id) AND
    (OLD.reply_to_id = NEW.reply_to_id) AND
    (OLD.created_at = NEW.created_at) AND
    (NEW.seen = true)
  );

CREATE POLICY "Allow users to delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add indexes for performance
CREATE INDEX chat_messages_user_id_idx ON public.chat_messages(user_id);
CREATE INDEX chat_messages_reply_to_id_idx ON public.chat_messages(reply_to_id);
CREATE INDEX chat_messages_created_at_idx ON public.chat_messages(created_at);
CREATE INDEX chat_messages_seen_idx ON public.chat_messages(seen); 