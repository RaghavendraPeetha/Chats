import React, { useState, useEffect, useCallback, useRef} from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import MessageList from './MessageList';
import { useAuth } from '../context/AuthContext';
import './ChatWindow.css';
import '@fortawesome/fontawesome-free/css/all.css';


const ChatWindow = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [chatName, setChatName] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef=useRef();

  const fetchMessages = useCallback(async () => {
    try {
      //setLoading(true);
      const response = await api.get(`/conversations/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchConversationDetails = useCallback(async () => {
    try {
      const response = await api.get(`/conversations/${id}`);
      const conversation = response.data;

      const chatName = conversation.participants
        .filter(participant => participant._id !== user._id)
        .map(participant => participant.username)
        .join(', ') || 'Chat';

      setChatName(chatName);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  }, [id, user._id]);

  useEffect(() => {
    fetchMessages();
    fetchConversationDetails();
  }, [fetchMessages, fetchConversationDetails]);

  useEffect(() => {
    inputRef.current.focus();
    scrollToBottom();
  }, [messages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(`/conversations/${id}/messages/add`, {
        content: newMessage || '',
        sender: user.username,
        image,
      });

      if (response.status === 200) {
        // Update messages state optimistically
        const newMessageData = {
          content: newMessage,
          sender: user.username,
          image,
          createdAt: new Date().toISOString(), // Example timestamp, adjust as per your server response
        };

        setMessages([...messages, newMessageData]);
        scrollToBottom(); // Scroll to bottom after adding new message
      }

      setNewMessage('');
      setImage(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-window">
      <div className="chat-title">
        {chatName && 
        <h1>{chatName.toLocaleUpperCase()}<span className='alias'>{`  (${chatName})`}</span></h1>
        }
      </div>
      <div className="message-list">
        {loading ? (
          <p>Loading messages...</p>
        ) : (
            <MessageList messages={messages} user={user} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="form-container">
        <form onSubmit={handleSendMessage} className="form-row">
          <input
            type="text"
            className="message-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            ref={inputRef}
          />
          <label htmlFor="image-upload" className="image-upload-label">
            <input
              type="file"
              id="image-upload"
              className="image-input"
              onChange={handleImageChange}
              accept="image/*"
            />
            <i className="fas fa-paperclip icon_file"></i> {/* Paperclip icon */}
          </label>
          <button
            type="submit"
            disabled={!newMessage && !image}
            className="send-button"
          >
            <i className="fab fa-telegram-plane icon"></i> {/* Send plane icon */}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
