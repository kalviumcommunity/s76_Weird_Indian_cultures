'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import {
  FaBookmark,
  FaComment,
  FaEllipsisH,
  FaShare,
  FaHeart,
  FaRegHeart,
} from 'react-icons/fa';
import {
  API_BASE_URL,
  API_ROUTES,
  CultureComment,
  CultureItem,
} from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

type Props = CultureItem & {
  onDelete: (id: string) => void;
};

const colorOptions = [
  'bg-orange-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-cyan-500',
];

export default function CulturalEntity({
  id,
  caption,
  location,
  tags,
  imageUrl,
  videoUrl,
  likes = 0,
  likedByCurrentUser = false,
  onDelete,
  // Legacy support
  CultureName,
  CultureDescription,
  Region,
  Significance,
  ImageURL,
  VideoURL,
  Likes,
}: Props) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Use new fields, fallback to legacy fields
  const displayCaption = caption || CultureName || '';
  const displayLocation = location || Region || '';
  const displayImage = imageUrl || ImageURL;
  const displayVideo = videoUrl || VideoURL;
  const displayLikes = likes || Likes || 0;
  
  const [liked, setLiked] = useState(likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(displayLikes);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<CultureComment[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Update liked state when likedByCurrentUser prop changes
  useEffect(() => {
    setLiked(likedByCurrentUser);
  }, [likedByCurrentUser]);

  const accentColor = useMemo(() => {
    if (!id) {
      return colorOptions[0];
    }
    const hash = Array.from(id).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    return colorOptions[hash % colorOptions.length];
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get<CultureComment[]>(
          API_ROUTES.comments(id),
          { withCredentials: true }
        );
        setComments(Array.isArray(res.data) ? res.data : []);
      } catch {
        setComments([]);
      }
    };

    fetchComments();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like posts.');
      return;
    }

    if (liked) {
      alert('You already liked this post.');
      return;
    }

    try {
      const response = await axios.put(
        API_ROUTES.likePost(id),
        {},
        { withCredentials: true }
      );
      
      if (response.data.message === 'Already liked') {
        setLiked(true);
        alert('You already liked this post.');
      } else {
        setLikeCount((prev: number) => (prev ?? 0) + 1);
        setLiked(true);
      }
    } catch (error: any) {
      if (error.response?.data?.message === 'Already liked') {
        setLiked(true);
        alert('You already liked this post.');
      }
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated || !user) {
      alert('Please login to comment.');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      await axios.post(
        API_ROUTES.addComment(id),
        {
          item_id: id,
          user_id: user.id,
          comment: commentText,
        },
        { withCredentials: true }
      );
      setCommentText('');
      
      // Refresh comments
      const res = await axios.get<CultureComment[]>(
        API_ROUTES.comments(id),
        { withCredentials: true }
      );
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert('Failed to add comment. Please try again.');
    }
  };

  const assetUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-sm mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-sm ${accentColor}`}>
            {(displayLocation || displayCaption || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-sm text-gray-900 block">{displayLocation || 'User'}</span>
            {tags && <span className="text-xs text-gray-500">{tags}</span>}
          </div>
        </div>
        <button type="button" onClick={() => setShowOptions(!showOptions)} className="text-gray-900">
          <FaEllipsisH />
        </button>
        {showOptions && (
          <div className="absolute right-4 mt-32 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
            <button onClick={() => router.push(`/form/${id}`)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">Edit</button>
            <button onClick={() => onDelete(id)} className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100">Delete</button>
          </div>
        )}
      </div>

      {/* Media */}
      {displayImage && (
        <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
          <Image src={assetUrl(displayImage) || '/images/photo-1585607344893-43a4bd91169a.png'} alt={displayCaption} fill className="object-cover" sizes="100vw" />
        </div>
      )}
      {displayVideo && <video src={assetUrl(displayVideo) || undefined} controls className="w-full" style={{ maxHeight: '600px' }} />}

      {/* Actions */}
      <div className="px-4 py-2 flex items-center gap-4">
        <button onClick={handleLike} className="hover:opacity-60">
          {liked ? <FaHeart className="text-red-500 text-2xl" /> : <FaRegHeart className="text-2xl" />}
        </button>
        <button onClick={() => setShowComments(!showComments)} className="hover:opacity-60">
          <FaComment className="text-2xl" />
        </button>
        <button className="hover:opacity-60">
          <FaShare className="text-2xl" />
        </button>
        <button onClick={() => setSaved(!saved)} className="ml-auto hover:opacity-60">
          <FaBookmark className={`text-2xl ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Likes */}
      <div className="px-4 pb-2">
        <span className="font-semibold text-sm">{likeCount} likes</span>
      </div>

      {/* Caption */}
      <div className="px-4 pb-2">
        <p className="text-sm">
          <span className="font-semibold mr-2">{displayLocation || 'User'}</span>
          {displayCaption}
        </p>
        {(CultureDescription || Significance) && (
          <p className="text-sm text-gray-600 mt-1">
            {CultureDescription || Significance}
          </p>
        )}
      </div>

      {/* Comments */}
      {comments.length > 0 && !showComments && (
        <button onClick={() => setShowComments(true)} className="px-4 pb-2 text-sm text-gray-500">
          View all {comments.length} comments
        </button>
      )}

      {showComments && (
        <div className="px-4 pb-3 border-t border-gray-200 pt-3">
          <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold mr-2">{comment.username || 'User'}</span>
                {comment.comment}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-gray-200 pt-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1 text-sm outline-none"
            />
            <button onClick={handleAddComment} disabled={!commentText.trim()} className="text-blue-500 font-semibold text-sm disabled:opacity-50">
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
