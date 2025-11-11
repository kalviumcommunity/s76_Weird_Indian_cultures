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
  FaThumbsUp,
} from 'react-icons/fa';
import {
  API_BASE_URL,
  API_ROUTES,
  CultureComment,
  CultureItem,
} from '@/lib/constants';

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
  CultureName,
  CultureDescription,
  Region,
  Significance,
  ImageURL,
  VideoURL,
  Likes = 0,
  onDelete,
}: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Likes);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<CultureComment[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

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
    if (liked) return;
    try {
      await axios.put(API_ROUTES.likeItem(id), {}, { withCredentials: true });
      setLikes((prev) => prev + 1);
      setLiked(true);
    } catch {
      // no-op
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const userId =
      typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) {
      alert('Please select a user before commenting.');
      return;
    }
    try {
      await axios.post(
        API_ROUTES.addComment,
        {
          item_id: id,
          user_id: userId,
          comment: commentText,
        },
        { withCredentials: true }
      );
      setCommentText('');
      const res = await axios.get<CultureComment[]>(
        API_ROUTES.comments(id),
        { withCredentials: true }
      );
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch {
      // no-op
    }
  };

  const assetUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-700 bg-black/30 backdrop-blur-md shadow-lg transition-all hover:shadow-xl">
      <div className={`h-2 ${accentColor}`} />

      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${accentColor}`}
          >
            {CultureName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-white">{Region}</h3>
            <p className="text-xs text-gray-400">
              Posted {Math.floor(Math.random() * 7) + 1}d ago
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            className="text-gray-400 hover:text-white"
            onClick={() => setShowOptions((prev) => !prev)}
          >
            <FaEllipsisH />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-1 w-36 rounded-md border border-gray-700 bg-gray-900 py-2 shadow-lg">
              <button
                type="button"
                onClick={() => router.push(`/form/${id}`)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(id)}
                className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        {ImageURL && (
          <div className="relative mb-2 h-48 w-full overflow-hidden rounded-lg">
            <Image
              src={assetUrl(ImageURL) ?? '/images/photo-1585607344893-43a4bd91169a.png'}
              alt={CultureName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        {VideoURL && (
          <video
            src={assetUrl(VideoURL) ?? undefined}
            controls
            className="mb-2 h-48 w-full rounded-lg object-cover"
          />
        )}
        <h2 className="mb-2 text-xl font-bold text-orange-400">
          {CultureName}
        </h2>
        <p className="mb-3 text-sm text-gray-300">{CultureDescription}</p>
        <div className="text-sm text-gray-300">
          <span className="font-semibold text-orange-400">Significance:</span>{' '}
          {Significance}
        </div>
      </div>

      <div className="border-t border-gray-700 bg-gray-900/50 px-4 py-2">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{likes} likes</span>
          <span>{comments.length} comments</span>
        </div>
      </div>

      <div className="flex justify-between border-t border-gray-700 px-4 py-2">
        <button
          type="button"
          className={`flex items-center gap-1 rounded-full px-3 py-1 ${
            liked
              ? 'text-orange-400'
              : 'text-gray-400 hover:text-orange-400'
          }`}
          onClick={handleLike}
        >
          <FaThumbsUp /> <span>Like</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-gray-400 hover:text-orange-400"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <FaComment /> <span>Comment</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-gray-400 hover:text-orange-400"
        >
          <FaShare /> <span>Share</span>
        </button>
        <button
          type="button"
          className={`flex items-center gap-1 rounded-full px-3 py-1 ${
            saved
              ? 'text-orange-400'
              : 'text-gray-400 hover:text-orange-400'
          }`}
          onClick={() => setSaved((prev) => !prev)}
        >
          <FaBookmark />
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-700 bg-black/40 px-4 py-3">
          <div className="mb-2 flex items-center">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="mr-2 w-3/4 rounded border border-gray-600 bg-transparent px-2 py-1 text-white"
            />
            <button
              type="button"
              className="rounded bg-orange-500 px-3 py-1 text-white"
              onClick={handleAddComment}
            >
              Post
            </button>
          </div>
          <div className="max-h-32 overflow-auto">
            {comments.length === 0 && (
              <div className="text-xs text-gray-400">No comments yet</div>
            )}
            {comments.map((comment) => (
              <div key={comment.id} className="mb-1 text-sm text-gray-200">
                <span className="font-semibold">
                  {comment.username ?? 'User'}:
                </span>{' '}
                {comment.comment}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
