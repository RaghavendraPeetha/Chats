import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './ConversationsList.css';

const ConversationsList = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const navigate = useNavigate();

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setIsLoading(false);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchConversations();
      await fetchAllUsers();
    };

    fetchInitialData();
  }, [fetchConversations, fetchAllUsers]);

  const handleNewConversationSubmit = async (selectedUser) => {
    try {
      let available = false;
      let conversationId = null;

      conversations.some((conversation) => {
        const hasSelectedUser = conversation.participants.some((participant) => participant._id === selectedUser._id);
        const hasCurrentUser = conversation.participants.some((participant) => participant._id === user._id);

        if (hasSelectedUser && hasCurrentUser) {
          available = true;
          conversationId = conversation._id;
          return true;
        }

        return false;
      });

      if (!available) {
        const participants = [user._id, selectedUser._id];
        const response = await api.post('/conversations/add', { participants });

        if (response.status === 200) {
          await fetchConversations();
          setTimeout(() => {
            navigate(`/conversations/${response.data._id}`);
          }, 400);
        }
      } else {
        setIsAvailable(true);
        setTimeout(() => {
          navigate(`/conversations/${conversationId}`);
        }, 2000);
      }
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSearchChange = async (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    setShowSuggestions(searchTerm.length > 0);

    const filteredUsers = allUsers.filter(
      (searchingUser) =>
        searchingUser.username.toLowerCase().includes(searchTerm.toLowerCase()) && searchingUser._id !== user._id
    );

    setSearchResults(filteredUsers);
  };

  const handleUserSelect = async (userId) => {
    const selectedUser = allUsers.find((user) => user._id === userId);
    if (selectedUser) {
      setSelectedUser(selectedUser);
      setShowSuggestions(false);
      setSearchTerm('');
      await handleNewConversationSubmit(selectedUser);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      setConversations((prevConversations) => prevConversations.filter((conv) => conv._id !== conversationId));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const toggleSearchVisibility = () => {
    setIsSearchVisible(!isSearchVisible);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="conversations-list-container">
      <h1 className="page-title">Your Conversations</h1>

      <div className={`search-container ${isSearchVisible ? 'search-container-expanded' : 'search-container-compressed'}`}>  
        <button className="icon-button" onClick={toggleSearchVisibility}>
          <i className={`fa ${isSearchVisible ? 'fa-arrow-left' : 'fa-search'}`}></i>
        </button>

        {isSearchVisible && (
          <input
            type="text"
            className="search-input"
            placeholder="Search for users..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        )}

        {isSearchVisible && searchTerm !=='' && (
          <button className="icon-button" onClick={() => { setSearchTerm(''); setSearchResults([]); }}>
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>

      <div className='suggestions-container'>
        {showSuggestions && (
          searchResults.length > 0 ? (
            <ul className="suggestions-list">
              {searchResults.map((user) => (
                <li key={user._id} onClick={() => handleUserSelect(user._id)}>
                  {user.username}
                </li>
              ))}
            </ul>
          ) : (
            searchTerm !=='' && <p className="no-results-message">No users found.</p>
          )
        )}
      </div>

      {isAvailable && (
        <div className="available-conversation">
          <h2>Already having conversation with {selectedUser.username}!!</h2>
          <p>Redirecting to previous conversation...</p>
        </div>
      )}

      {!isLoading && (
        <ul className="conversation-list">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <li key={conversation._id} className="conversation-item">
                <Link to={`/conversations/${conversation._id}`} className="conversation-link">
                  {conversation.participants &&
                    conversation.participants
                      .filter((participant) => participant._id !== user._id)
                      .map((participant) => participant.username || 'Unknown User')
                      .join(', ')}
                </Link>
                <button className="delete-button" onClick={() => handleDeleteConversation(conversation._id)}>
                  <i className="fa fa-trash-alt"></i> {/* Trash icon */}
                </button>
              </li>
            ))
          ) : (
            <p className="no-conversations-message">No conversations found.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default ConversationsList;
