import React from 'react';
import { useAuth } from '../context/AuthContext';
import './MessageList.css';
import moment from 'moment';

const MessageList = ({ messages }) => {
  const { user } = useAuth();

  const formatTime = (timestamp) => {
    return moment(timestamp).format('hh:mm A');
  };

  const formatDate = (timestamp) => {
    return moment(timestamp).format('dddd, MMMM D, YYYY');
  };

  const groupedMessages = messages.reduce((acc, message) => {
    const dateKey = moment(message.createdAt).format('YYYY-MM-DD');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(message);
    return acc;
  }, {});

  return (
    <div className="message-list">
      {Object.keys(groupedMessages).map((dateKey) => (
        <div key={dateKey}>
          <div className="date-container">
            <span className="date">{formatDate(groupedMessages[dateKey][0].createdAt)}</span>
          </div>
          {groupedMessages[dateKey].map((message) => (
            <div key={message._id} className="message-item-container">
              <div className={`message-item ${message.sender === user.username ? 'sent' : 'received'}`}>
                <p className="message-text">{message.content}</p>
                {message.image && <img src={message.image} alt="Message" className="message-image" />}
                <p className="message-time">{formatTime(message.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
