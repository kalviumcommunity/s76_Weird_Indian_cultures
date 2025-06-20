// ... other imports
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaThumbsUp, FaComment, FaShare, FaBookmark, FaEllipsisH } from 'react-icons/fa';
import axios from 'axios';

function CulturalEntity({ id, CultureName, CultureDescription, Region, Significance, ImageURL, VideoURL, Likes, onDelete }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Likes || 0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, []);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/item/comments/${id}`, { withCredentials: true });
      setComments(res.data || []);
    } catch (err) {
      setComments([]);
    }
  };

  const handleLike = async () => {
    if (!liked) {
      await axios.put(`http://localhost:5000/api/item/like/${id}`, {}, { withCredentials: true });
      setLikes(prev => prev + 1);
      setLiked(true);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const userId = localStorage.getItem("userId"); // Get userId from localStorage or your auth logic
      if (!userId) {
        alert("Please select a user before commenting.");
        return;
      }
      await axios.post(`http://localhost:5000/api/item/comment`, {
        item_id: id,
        user_id: userId, // <-- Add user_id here
        comment: commentText
      }, { withCredentials: true });
      setCommentText('');
      fetchComments();
    } catch (err) {}
  };

  // ...rest of component (unchanged)


  const colorOptions = ['bg-orange-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500'];
  const randomColor = colorOptions[Math.floor(id % colorOptions.length)];

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl border border-gray-700 mb-4">
      <div className={`h-2 ${randomColor}`}></div>

      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${randomColor}`}>
            {CultureName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-white">{Region}</h3>
            <p className="text-xs text-gray-400">Posted {Math.floor(Math.random() * 7) + 1}d ago</p>
          </div>
        </div>
        <div className="relative">
          <button className="text-gray-400 hover:text-white" onClick={() => setShowOptions(!showOptions)}>
            <FaEllipsisH />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-1 bg-gray-900 shadow-lg rounded-md py-2 w-36 z-10 border border-gray-700">
              <button
                onClick={() => navigate(`/form/${id}`)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >Edit</button>
              <button
                onClick={() => onDelete(id)}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
              >Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        {ImageURL && (
          <img src={`http://localhost:5000${ImageURL}`} alt={CultureName}
            className="w-full h-48 object-cover rounded-lg mb-2" />
        )}
        {VideoURL && (
          <video src={`http://localhost:5000${VideoURL}`} controls
            className="w-full h-48 object-cover rounded-lg mb-2" />
        )}
        <h2 className="text-xl font-bold text-orange-400 mb-2">{CultureName}</h2>
        <p className="text-gray-300 text-sm mb-3">{CultureDescription}</p>
        <div className="mb-1 text-sm text-gray-300">
          <span className="font-semibold text-orange-400">Significance:</span> {Significance}
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-700">
        <div className="flex items-center text-gray-400 text-sm gap-4">
          <span className="mr-2">{likes} likes</span>
          <span>{comments.length} comments</span>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-gray-700 flex justify-between">
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${liked ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'}`}
          onClick={handleLike}
        >
          <FaThumbsUp /> <span>Like</span>
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-400 hover:text-orange-400"
          onClick={() => setShowComments(!showComments)}
        >
          <FaComment /><span>Comment</span>
        </button>
        <button className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-400 hover:text-orange-400">
          <FaShare /><span>Share</span>
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${saved ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'}`}
          onClick={() => setSaved(!saved)}
        >
          <FaBookmark />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-700 bg-black/40">
          <div className="mb-2">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="w-3/4 px-2 py-1 border text-white border-gray-600 rounded mr-2"
            />
            <button
              onClick={handleAddComment}
              className="bg-orange-500 text-white px-3 py-1 rounded"
            >Post</button>
          </div>
          <div className="max-h-32 overflow-auto">
            {comments.length === 0 && <div className="text-gray-400 text-xs">No comments yet</div>}
            {comments.map(c => (
              <div key={c.id} className="mb-1 text-gray-200 text-sm">
                <span className="font-semibold">{c.username}:</span> {c.comment}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

CulturalEntity.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  CultureName: PropTypes.string.isRequired,
  CultureDescription: PropTypes.string.isRequired,
  Region: PropTypes.string.isRequired,
  Significance: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  ImageURL: PropTypes.string,
  VideoURL: PropTypes.string,
  Likes: PropTypes.number
};

export default CulturalEntity;