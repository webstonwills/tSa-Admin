import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Send, ThumbsUp, MessageCircle, MoreVertical, Flag, PlusCircle, X } from 'lucide-react';

// Define interfaces for our data structures
interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

export default function Forum() {
  // State variables
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  // Fetch posts on component mount and set up real-time subscriptions
  useEffect(() => {
    fetchPosts();
    
    // Set up real-time subscription for new posts and comments
    const postsSubscription = supabase
      .channel('forum_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_comments' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
    };
  }, []);

  // Function to fetch posts with comments
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          user:profiles(full_name, avatar_url),
          comments:forum_comments(
            *,
            user:profiles(full_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forum posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new post
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('forum_posts').insert([
        {
          title: newPost.title,
          content: newPost.content,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      setNewPost({ title: '', content: '' });
      setShowNewPostForm(false);
      toast({
        title: 'Success',
        description: 'Post created successfully',
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  // Function to add a comment to a post
  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('forum_comments').insert([
        {
          content: newComment,
          post_id: postId,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  // Function to like a post
  const handleLikePost = async (postId: string) => {
    try {
      // First check if post likes column exists
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .select('likes')
        .eq('id', postId)
        .single();
      
      if (postError) throw postError;
      
      // Update likes count
      const currentLikes = postData.likes || 0;
      const { error } = await supabase
        .from('forum_posts')
        .update({ likes: currentLikes + 1 })
        .eq('id', postId);
        
      if (error) throw error;
      
      // Refresh posts to show updated likes
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like post',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-4 max-w-2xl">
      {/* Mobile-friendly header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-center mb-5">Forum</h1>
        <Button 
          onClick={() => setShowNewPostForm(!showNewPostForm)}
          className="w-full flex items-center justify-center gap-2"
          size="lg"
        >
          {showNewPostForm ? (
            <>
              <X className="h-5 w-5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <PlusCircle className="h-5 w-5" />
              <span>Create New Post</span>
            </>
          )}
        </Button>
      </div>

      {/* New Post Form - Mobile Optimized */}
      {showNewPostForm && (
        <Card className="p-4 mb-6 shadow-lg">
          <h2 className="text-lg font-bold mb-4">Create New Post</h2>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Post Title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="text-base h-12"
              />
            </div>
            <div>
              <Textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="min-h-[150px] text-base"
              />
            </div>
            <Button
              onClick={handleCreatePost}
              disabled={sending}
              className="w-full h-12 text-base"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {posts.length === 0 && !loading && (
        <Card className="p-6 text-center">
          <p className="text-lg text-muted-foreground mb-4">No posts yet</p>
          <Button
            onClick={() => setShowNewPostForm(true)}
            className="mx-auto"
          >
            Create the first post
          </Button>
        </Card>
      )}

      {/* Posts List - Mobile Optimized */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="p-4">
              {/* Post Header - Optimized for mobile */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={post.user.avatar_url} />
                    <AvatarFallback>
                      {post.user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm line-clamp-1">
                      {post.user.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Content - Mobile optimized */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2 break-words">{post.title}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {post.content.length > 200 && activePostId !== post.id
                    ? `${post.content.substring(0, 200)}...`
                    : post.content}
                </p>
                {post.content.length > 200 && activePostId !== post.id && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs"
                    onClick={() => setActivePostId(post.id)}
                  >
                    Read more
                  </Button>
                )}
              </div>

              {/* Post Actions - Mobile friendly */}
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-1 h-8 px-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs">{post.likes || 0}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
                    className="flex items-center gap-1 h-8 px-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{post.comments?.length || 0}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments Section - Mobile Optimized */}
            {activePostId === post.id && (
              <div className="border-t bg-muted/30">
                <div className="p-4">
                  <h3 className="text-sm font-medium mb-2">Comments ({post.comments?.length || 0})</h3>
                  
                  {/* Scrollable comment area */}
                  {post.comments?.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto mb-4">
                      <div className="space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              <AvatarImage src={comment.user.avatar_url} />
                              <AvatarFallback>
                                {comment.user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-background rounded-lg p-2">
                                <p className="font-medium text-xs mb-1">{comment.user.full_name}</p>
                                <p className="text-sm break-words">{comment.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                  
                  {/* Comment input - Mobile friendly */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="text-sm h-10"
                    />
                    <Button
                      onClick={() => handleAddComment(post.id)}
                      disabled={sending}
                      size="icon"
                      className="h-10 w-10 flex-shrink-0"
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
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
