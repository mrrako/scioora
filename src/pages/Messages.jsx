import React, { useState, useEffect } from 'react';
import { ChatList } from '../components/messaging/ChatList';
import { ChatWindow } from '../components/messaging/ChatWindow';
import { MessageInput } from '../components/messaging/MessageInput';
import { useMessages } from '../hooks/useMessages';
import './Messages.scss';

export default function Messages() {
  const { chats, messages, sendMessage, fetchMessages, activeChatId } = useMessages();
  const [selectedChatId, setSelectedChatId] = useState(null);

  // If chats load and none selected, optionally select the first
  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  // When a chat is selected, fetch its messages
  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    }
  }, [selectedChatId, fetchMessages]);

  const activeChat = chats.find(c => c.id === selectedChatId);

  const handleSelectChat = (id) => {
    setSelectedChatId(id);
  };

  const handleSendMessage = (text) => {
    if (selectedChatId) {
      sendMessage(selectedChatId, text);
    }
  };

  return (
    <div className={`messages-page ${selectedChatId ? 'chat-active' : ''}`}>
      <div className="messages-container">
        <ChatList 
          chats={chats} 
          activeChatId={selectedChatId} 
          onSelectChat={handleSelectChat} 
        />
        <div className="chat-area">
          <ChatWindow 
            chat={activeChat} 
            messages={messages} 
            isTyping={false}
            onBack={() => setSelectedChatId(null)}
          />
          {selectedChatId && (
            <MessageInput onSendMessage={handleSendMessage} />
          )}
        </div>
      </div>
    </div>
  );
}
