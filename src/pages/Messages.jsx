import React, { useState } from 'react';
import { ChatList } from '../components/messaging/ChatList';
import { ChatWindow } from '../components/messaging/ChatWindow';
import { MessageInput } from '../components/messaging/MessageInput';
import { useMessages } from '../hooks/useMessages';
import './Messages.scss';

export default function Messages() {
  const { chats, messages, sendMessage, markAsRead } = useMessages();
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id || null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeMessages = activeChatId ? (messages[activeChatId] || []) : [];

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    markAsRead(id);
  };

  const handleSendMessage = (text) => {
    if (activeChatId) {
      sendMessage(activeChatId, text);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <ChatList 
          chats={chats} 
          activeChatId={activeChatId} 
          onSelectChat={handleSelectChat} 
        />
        <div className="chat-area">
          <ChatWindow 
            chat={activeChat} 
            messages={activeMessages} 
            isTyping={false}
          />
          {activeChatId && (
            <MessageInput onSendMessage={handleSendMessage} />
          )}
        </div>
      </div>
    </div>
  );
}
