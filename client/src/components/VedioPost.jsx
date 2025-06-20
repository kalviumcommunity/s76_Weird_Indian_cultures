import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
import { FaThumbsUp, FaComment, FaShare, FaBookmark, FaPlay, FaPause } from 'react-icons/fa';

function VideoPost({ id ,title, description, poster, videoUrl, region, likes: initialLikes, comments: initialComments }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl border border-gray-700">
      {/* Random color header for visual interest */}
      <div className={`h-2 ${['bg-orange-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500'][Math.floor(Math.random() * 5)]}`}></div>
      
      {/* Post header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-orange-500`}>
            <FaPlay size={12} />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-white">{region}</h3>
            <p className="text-xs text-gray-400">Video • {Math.floor(Math.random() * 7) + 1}d ago</p>
          </div>
        </div>
      </div>
      
      {/* Video content */}
      <div className="px-4 py-3">
        <h2 className="text-xl font-bold text-orange-400 mb-2">{title}</h2>
        
        <div className="relative rounded-lg overflow-hidden mb-3 group">
          <video
            ref={videoRef}
            poster={poster || "https://via.placeholder.com/640x360"}
            className="w-full rounded-lg"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          <div 
            className={`absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
            onClick={togglePlayPause}
          >
            {isPlaying ? 
              <FaPause size={40} className="text-white opacity-80" /> : 
              <FaPlay size={40} className="text-white opacity-80" />
            }
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mb-3">{description}</p>
      </div>
      
      {/* Engagement bar */}
      <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-700">
        <div className="flex items-center text-gray-400 text-sm">
          <span className="mr-2">{likes} likes</span>
          <span>{initialComments} comments</span>
        </div>
      </div>
      
      {/* Actions bar */}
      <div className="px-4 py-2 border-t border-gray-700 flex justify-between">
        <button 
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${liked ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'}`}
          onClick={handleLike}
        >
          <FaThumbsUp /> 
          <span>Like</span>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-400 hover:text-orange-400">
          <FaComment />
          <span>Comment</span>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-400 hover:text-orange-400">
          <FaShare />
          <span>Share</span>
        </button>
        
        <button 
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${saved ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'}`}
          onClick={() => setSaved(!saved)}
        >
          <FaBookmark />
        </button>
      </div>
    </div>
  );
}

VideoPost.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  poster: PropTypes.string,
  videoUrl: PropTypes.string.isRequired,
  region: PropTypes.string.isRequired,
  likes: PropTypes.number,
  comments: PropTypes.number
};

export default VideoPost;