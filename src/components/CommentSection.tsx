'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase'; // Use the updated firebase config
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import type { User, UserProfile } from '@/context/AuthContext'; // Import types

// --- Cloudinary Image URLs ---
const DEFAULT_ICON_URL = "https://res.cloudinary.com/di8bf7ufw/image/upload/v1757845754/default-icon.png_wqrpnw.png";
const DEFAULT_FRAME_URL = "https://res.cloudinary.com/di8bf7ufw/image/upload/v1757845753/default-frame.png_gna3cg.png";

// --- Interfaces ---
interface AuthorInfo {
  isGuest: boolean;
  name: string;
  userId: string;
}
interface Comment {
  id: string;
  text: string;
  createdAt: Timestamp;
  authorInfo: AuthorInfo;
}
interface CommentSectionProps {
  pageId: string;
}

// --- Sub-component for each comment ---
const CommentCard: React.FC<{ comment: Comment }> = ({ comment }) => {
  const isGuest = comment.authorInfo.isGuest;
  return (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-700">
      <div className="w-12 h-12 rounded-full flex-shrink-0 relative">
        {isGuest ? (
          <div className="w-full h-full rounded-full bg-gray-600" />
        ) : (
          <img 
            src={DEFAULT_ICON_URL} 
            alt="User Icon" 
            className="w-full h-full object-cover rounded-full" 
          />
        )}
      </div>
      <div>
        <p className="font-bold text-gray-200">{comment.authorInfo.name}</p>
        <p className="text-gray-300 whitespace-pre-wrap">{comment.text}</p>
        <p className="text-xs text-gray-500 mt-1">
          {comment.createdAt?.toDate().toLocaleString() ?? 'Just now'}
        </p>
      </div>
    </div>
  );
};

// --- Main Component ---
const CommentSection: React.FC<CommentSectionProps> = ({ pageId }) => {
  const { user, profile, isLoggedIn } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  
  // --- NEW: Add loading and error states ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!pageId) {
        setLoading(false);
        return;
    };
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('pageId', '==', pageId), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const commentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];
        setComments(commentsData);
        setLoading(false); // <--- Set loading to false on success
        setError(null); // <--- Clear any previous errors
      }, 
      (err) => {
        console.error("Error fetching comments:", err);
        // --- NEW: Handle fetch errors ---
        setError("Could not connect to the comment service. Please check your connection or try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [pageId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    let authorInfo: AuthorInfo;
    if (isLoggedIn && user && profile) {
      authorInfo = { isGuest: false, name: profile.displayName || user.username, userId: user.id.toString() };
    } else {
      let guestName = localStorage.getItem('guestName');
      if (!guestName) {
        guestName = `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
        localStorage.setItem('guestName', guestName);
      }
      authorInfo = { isGuest: true, name: guestName, userId: '' };
    }

    try {
        await addDoc(collection(db, 'comments'), {
          pageId: pageId,
          text: newComment,
          createdAt: serverTimestamp(),
          authorInfo: authorInfo,
        });
        setNewComment('');
    } catch (err) {
        console.error("Error posting comment:", err);
        setError("Failed to post comment. Please try again.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-500 text-center">Loading comments...</p>;
    }
    if (error) {
      return <p className="text-red-400 text-center">{error}</p>;
    }
    if (comments.length === 0) {
      return <p className="text-gray-500 text-center">Be the first to comment!</p>;
    }
    return comments.map((comment) => (
      <CommentCard key={comment.id} comment={comment} />
    ));
  }

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg mt-8">
      <h3 className="text-2xl font-bold mb-4">Comments</h3>
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isLoggedIn ? `Commenting as ${profile?.displayName || user?.username}...` : 'Write a comment...'}
          className="w-full p-3 bg-gray-700 text-gray-100 rounded-md border border-gray-600"
          rows={3}
        ></textarea>
        <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
          Post Comment
        </button>
      </form>
      <div className="space-y-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default CommentSection;