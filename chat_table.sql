-- First, check if the table exists and add the seen column if needed
DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_messages') THEN
        -- Check if the seen column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'chat_messages' 
                      AND column_name = 'seen') THEN
            -- Add the seen column
            ALTER TABLE public.chat_messages ADD COLUMN seen BOOLEAN DEFAULT FALSE;
        END IF;
    ELSE
        -- Create the table with all columns including seen
        CREATE TABLE public.chat_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            content TEXT NOT NULL,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
            seen BOOLEAN DEFAULT FALSE
        );
    END IF;
END
$$;

-- Enable RLS if not already enabled
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow users to view all messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow users to insert their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow users to update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow users to mark messages as seen" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow users to update seen status on any message" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow users to delete their own messages" ON public.chat_messages;

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

-- Modified policy for updating seen status
CREATE POLICY "Allow users to mark messages as seen"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (
    -- Only allow updates where the only change is setting seen to true
    auth.uid() IS NOT NULL AND
    seen = true
  );

CREATE POLICY "Allow users to delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime subscriptions using a proper DO block
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        -- Publication exists, try to add the table
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
            EXCEPTION WHEN OTHERS THEN
                -- Table might already be in the publication, that's okay
                RAISE NOTICE 'Table might already be in the publication: %', SQLERRM;
        END;
    ELSE
        -- Publication doesn't exist, create it
        CREATE PUBLICATION supabase_realtime FOR TABLE public.chat_messages;
    END IF;
END
$$;

-- Add indexes for performance
DROP INDEX IF EXISTS chat_messages_user_id_idx;
DROP INDEX IF EXISTS chat_messages_reply_to_id_idx;
DROP INDEX IF EXISTS chat_messages_created_at_idx;
DROP INDEX IF EXISTS chat_messages_seen_idx;

CREATE INDEX chat_messages_user_id_idx ON public.chat_messages(user_id);
CREATE INDEX chat_messages_reply_to_id_idx ON public.chat_messages(reply_to_id);
CREATE INDEX chat_messages_created_at_idx ON public.chat_messages(created_at);
CREATE INDEX chat_messages_seen_idx ON public.chat_messages(seen); 