-- Migrate posts to messages
INSERT INTO public.chat_messages (content, user_id, created_at)
SELECT 
    CASE 
        WHEN title IS NULL OR title = '' THEN content
        ELSE title || E'\n\n' || content 
    END as content,
    user_id,
    created_at
FROM public.forum_posts;

-- Migrate comments to messages, linking them to the corresponding post as replies
INSERT INTO public.chat_messages (content, user_id, created_at, reply_to_id)
SELECT 
    c.content,
    c.user_id,
    c.created_at,
    (
        SELECT cm.id 
        FROM public.chat_messages cm
        INNER JOIN public.forum_posts p ON (
            cm.user_id = p.user_id AND 
            cm.created_at = p.created_at AND
            p.id = c.post_id
        )
        LIMIT 1
    ) as reply_to_id
FROM public.forum_comments c; 