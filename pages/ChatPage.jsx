import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../services/api';
import { Send, MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const { user, token } = useSelector((s) => s.auth);
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/chat/conversations').then((r) => setConversations(r.data));
  }, []);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { auth: { token }, transports: ['polling', 'websocket'] });
    socketRef.current.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socketRef.current?.disconnect();
  }, [token]);

  useEffect(() => {
    if (!active) return;
    socketRef.current?.emit('join-conversation', active._id);
    api.get(`/chat/conversations/${active._id}/messages`).then((r) => setMessages(r.data));
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !active) return;
    socketRef.current?.emit('send-message', { conversationId: active._id, content: input.trim() });
    setInput('');
  };

  const getOther = (conv) => conv.participants?.find((p) => String(p._id) !== String(user?._id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex gap-4">
      <div className="w-72 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">No conversations yet</div>
          ) : (
            conversations.map((conv) => {
              const other = getOther(conv);
              return (
                <button
                  key={conv._id}
                  onClick={() => setActive(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${active?._id === conv._id ? 'bg-blue-50' : ''}`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold shrink-0">
                    {other?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{other?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage || 'Start a conversation'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="font-medium">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                {getOther(active)?.name?.[0]}
              </div>
              <span className="font-semibold text-gray-900">{getOther(active)?.name}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => {
                const isMe = String(msg.senderId?._id || msg.senderId) === String(user?._id);
                return (
                  <div key={i} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold shrink-0">
                        {msg.senderId?.name?.[0]}
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
