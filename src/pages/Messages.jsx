import React, { useState, useEffect } from 'react';
import { ChatList } from '../components/messaging/ChatList';
import { ChatWindow } from '../components/messaging/ChatWindow';
import { MessageInput } from '../components/messaging/MessageInput';
import { useMessages } from '../hooks/useMessages';
import './Messages.scss';

export default function Messages() {
  const { chats, messages, sendMessage, fetchMessages } = useMessages();
  /** undefined = auto-select first chat; null = user cleared selection */
  const [selection, setSelection] = useState(undefined);

  const selectedChatId =
    selection === undefined ? (chats[0]?.id ?? null) : selection;

  // When a chat is selected, fetch its messages
  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    }
  }, [selectedChatId, fetchMessages]);

  const activeChat = chats.find(c => c.id === selectedChatId);

  const handleSelectChat = (id) => {
    setSelection(id);
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
            onBack={() => setSelection(null)}
          />
          {selectedChatId && (
            <MessageInput onSendMessage={handleSendMessage} />
          )}
        </div>
      </div>
    </div>
  );
}
