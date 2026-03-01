import { useState, useEffect } from 'react';
import { Comment } from '../types/comment';
import { postsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './CommentSection.css';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const MAX_COMMENT_LENGTH = 280;

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      if (!token) {
        console.log('No token available, skipping comment fetch');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching comments for post:', postId);
        const response = await postsApi.getComments(postId, token);
        console.log('Comments fetched:', response.comments);
        setComments(response.comments);
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, token]);

  // Format timestamp as relative time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  // Handle comment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !user) {
      setError('You must be logged in to comment');
      return;
    }

    const trimmedText = commentText.trim();
    
    // Validation
    if (!trimmedText) {
      setError('Comment cannot be empty');
      return;
    }

    if (trimmedText.length > MAX_COMMENT_LENGTH) {
      setError(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      console.log('Creating comment for post:', postId, 'with text:', trimmedText);
      const response = await postsApi.createComment(postId, trimmedText, token);
      console.log('Comment created successfully:', response.comment);
      
      // Add new comment to the list
      setComments([...comments, response.comment]);
      
      // Clear input field
      setCommentText('');
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.message || 'Failed to post comment');
      // Preserve comment text on error
    } finally {
      setSubmitting(false);
    }
  };

  const remainingChars = MAX_COMMENT_LENGTH - commentText.length;
  const isSubmitDisabled = !commentText.trim() || commentText.length > MAX_COMMENT_LENGTH || submitting;

  return (
    <div className="comment-section">
      {/* Comment List */}
      <div className="comments-list">
        {loading ? (
          <p className="loading-text">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="empty-state">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.displayName}</span>
                <span className="comment-username">@{comment.username}</span>
                <span className="comment-timestamp">{formatTimestamp(comment.createdAt)}</span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Comment Input (only for authenticated users) */}
      {user && (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="comment-input-wrapper">
            <textarea
              className="comment-input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                setError(null);
              }}
              disabled={submitting}
              rows={2}
            />
            <div className="comment-form-footer">
              <span className={`char-counter ${remainingChars < 0 ? 'over-limit' : ''}`}>
                {remainingChars}
              </span>
              <button
                type="submit"
                className="comment-submit-btn"
                disabled={isSubmitDisabled}
              >
                {submitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}
    </div>
  );
};
