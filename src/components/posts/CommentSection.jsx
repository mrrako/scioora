import React, { useState, useEffect, useMemo } from 'react';
import { Comment } from './Comment';
import { CommentInput } from './CommentInput';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { parseFirestoreDate } from '../../utils/firestoreDate';
import './CommentSection.scss';

function getCommentTime(c) {
  const parsed = parseFirestoreDate(c.createdAt);
  if (parsed) return parsed.getTime();
  if (typeof c.createdAt?.seconds === 'number') return c.createdAt.seconds * 1000;
  return 0;
}

/** Nest flat Firestore comments by parentId for threaded UI */
function buildCommentTree(flat) {
  if (!flat?.length) return [];
  const nodes = new Map();
  for (const raw of flat) {
    nodes.set(raw._id, { ...raw, replies: [] });
  }
  const roots = [];
  for (const node of nodes.values()) {
    const pid = node.parentId;
    if (pid && nodes.has(pid)) {
      nodes.get(pid).replies.push(node);
    } else {
      roots.push(node);
    }
  }
  roots.sort((a, b) => getCommentTime(b) - getCommentTime(a));
  for (const node of nodes.values()) {
    node.replies.sort((a, b) => getCommentTime(a) - getCommentTime(b));
  }
  return roots;
}

export function CommentSection({ postId, onAddComment, onDeleteComment }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const threadedComments = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    queueMicrotask(() => setLoading(true));
    // Fetch all comments for this post without server-side ordering to avoid index requirements
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          _id: doc.id,
          ...data
        };
      });

      // Sort roots merge order before tree build happens in useMemo
      fetchedComments.sort((a, b) => getCommentTime(b) - getCommentTime(a));

      setComments(fetchedComments);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching comments:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleTopLevelSubmit = async (text) => {
    await onAddComment(postId, text);
    // onSnapshot will handle the state update automatically
  };

  const handleDelete = async (commentId) => {
    const success = await onDeleteComment(postId, commentId);
    if (success) {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    }
  };

  const handleReply = async (text, parentId) => {
    await onAddComment(postId, text, parentId);
    // onSnapshot will handle the update
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <CommentInput onSubmit={handleTopLevelSubmit} placeholder="Add a comment..." />
      </div>
      
      <div className="comments-list">
        {loading ? (
          <p className="loading-comments">Loading comments...</p>
        ) : threadedComments.length > 0 ? (
          threadedComments.map(comment => (
            <Comment 
              key={comment._id} 
              comment={comment} 
              postId={postId}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="no-comments">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
