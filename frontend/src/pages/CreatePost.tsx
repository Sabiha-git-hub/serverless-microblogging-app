import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsApi } from '../services/api';

/** Maximum allowed characters for post content */
const MAX_CONTENT_LENGTH = 280;

/**
 * CreatePost component allows authenticated users to create new posts.
 * Validates content length (max 280 characters) and handles submission to the API.
 * Redirects to feed on success or displays errors on failure.
 */
const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  /**
   * Handles post submission with validation and API call.
   * Validates content is non-empty and within character limit before submitting.
   * Redirects to feed on success, displays error message on failure.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Post content cannot exceed ${MAX_CONTENT_LENGTH} characters`);
      return;
    }
    
    if (!token) {
      setError('You must be logged in to create a post');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await postsApi.createPost(content, token);
      
      // Redirect to feed after successful post creation
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles cancel action with unsaved changes warning.
   * Prompts user for confirmation if they have typed content to prevent accidental data loss.
   */
  const handleCancel = () => {
    if (content.trim()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel? Your draft will be lost.'
      );
      if (!confirmed) {
        return;
      }
    }
    navigate('/');
  };

  return (
    <div className="create-post">
      <h2>Create a New Post</h2>
      
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="content">What's on your mind?</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={MAX_CONTENT_LENGTH}
            disabled={loading}
            required
          />
          <div className="character-count">
            {content.length}/{MAX_CONTENT_LENGTH}
          </div>
        </div>
        
        <div className="button-group">
          <button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : 'Post'}
          </button>
          <button 
            type="button" 
            className="cancel-button" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
