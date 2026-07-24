import {
  ArrowLeft,
  MessageCircleMore,
  RefreshCw,
  Send,
  Signal,
  SignalZero,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { useSocket } from '../hooks/useSocket';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Skeleton from '../components/ui/Skeleton';

function mergeById(items, incoming) {
  const ids = new Set(items.map((item) => item._id));
  return incoming.reduce((result, item) => ids.has(item._id) ? result : [...result, item], items);
}

export default function ChatPage() {
  const { user } = useSelector((state) => state.auth);
  const { socket, status } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState('');
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const getOther = useCallback((conversation) => (
    conversation?.participants?.find((participant) => String(participant._id) !== String(user?._id))
  ), [user?._id]);

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    setConversationsError('');
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data);
      setActive((current) => current && data.find((conversation) => conversation._id === current._id) || current);
    } catch (requestError) {
      setConversationsError(getApiErrorMessage(requestError, 'Conversations could not be loaded.'));
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(async (conversation) => {
    if (!conversation) return;
    setMessagesLoading(true);
    setMessagesError('');
    try {
      const { data } = await api.get(`/chat/conversations/${conversation._id}/messages`, { params: { page: 1, limit: 50 } });
      setMessages(data);
      socket?.emit('mark-read', { conversationId: conversation._id });
    } catch (requestError) {
      setMessages([]);
      setMessagesError(getApiErrorMessage(requestError, 'Messages could not be loaded.'));
    } finally {
      setMessagesLoading(false);
    }
  }, [socket]);

  useEffect(() => {
    if (!active) return undefined;
    socket?.emit('join-conversation', active._id);
    loadMessages(active);
    return () => socket?.emit('leave-conversation', active._id);
  }, [active, loadMessages, socket]);

  useEffect(() => {
    if (!socket) return undefined;
    const receive = (message) => {
      setConversations((current) => current
        .map((conversation) => conversation._id === message.conversationId
          ? { ...conversation, lastMessage: message.content, lastMessageAt: message.createdAt }
          : conversation)
        .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)));
      if (String(message.conversationId) === String(active?._id)) {
        setMessages((current) => mergeById(current, [message]));
        socket.emit('mark-read', { conversationId: active._id });
      }
    };
    const typing = ({ userId }) => {
      if (String(userId) !== String(user?._id)) setTypingUser(true);
    };
    const stopTyping = () => setTypingUser(false);
    socket.on('receive-message', receive);
    socket.on('typing', typing);
    socket.on('stop-typing', stopTyping);
    return () => {
      socket.off('receive-message', receive);
      socket.off('typing', typing);
      socket.off('stop-typing', stopTyping);
    };
  }, [active?._id, socket, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typingUser]);

  const updateInput = (event) => {
    setInput(event.target.value);
    if (!socket || !active) return;
    socket.emit('typing', { conversationId: active._id });
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => socket.emit('stop-typing', { conversationId: active._id }), 900);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || !active || sending) return;
    setSending(true);
    setMessagesError('');
    setInput('');
    socket?.emit('stop-typing', { conversationId: active._id });
    try {
      const { data: message } = await api.post(`/chat/conversations/${active._id}/messages`, { content });
      setMessages((current) => mergeById(current, [message]));
      setConversations((current) => current.map((conversation) => conversation._id === active._id ? { ...conversation, lastMessage: content, lastMessageAt: message.createdAt } : conversation));
    } catch (requestError) {
      setInput(content);
      setMessagesError(getApiErrorMessage(requestError, 'Message failed to send. Your draft has been restored.'));
    } finally {
      setSending(false);
    }
  };

  const activeOther = useMemo(() => getOther(active), [active, getOther]);

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <Card className="mx-auto flex h-[calc(100dvh-5.5rem)] max-w-[1440px] overflow-hidden lg:h-[calc(100dvh-7rem)]">
        <section className={`${active ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-r border-slate-200 md:w-80 lg:w-[360px]`} aria-label="Conversations">
          <header className="flex min-h-16 items-center justify-between border-b border-slate-100 px-4">
            <div>
              <h1 className="text-base font-extrabold text-slate-950">Messages</h1>
              <p className="mt-0.5 text-xs text-slate-500">{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={loadConversations} aria-label="Refresh conversations"><RefreshCw className="h-4 w-4" /></Button>
          </header>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {conversationsLoading ? (
              <div className="space-y-2 p-3">{[0, 1, 2, 3].map((item) => <div key={item} className="flex gap-3 p-2"><Skeleton className="h-11 w-11" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-4/5" /></div></div>)}</div>
            ) : conversationsError ? (
              <ErrorState compact message={conversationsError} onRetry={loadConversations} />
            ) : conversations.length === 0 ? (
              <EmptyState compact icon={UsersRound} title="No conversations yet" description="An accepted mentorship can become a conversation from the mentorship page." />
            ) : (
              conversations.map((conversation) => {
                const other = getOther(conversation);
                return (
                  <button
                    type="button"
                    key={conversation._id}
                    onClick={() => setActive(conversation)}
                    className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-100 ${active?._id === conversation._id ? 'bg-blue-50/70' : ''}`}
                  >
                    <Avatar name={other?.name} src={other?.profilePhoto} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-slate-800">{other?.name || 'Community member'}</span>
                        {conversation.lastMessageAt && <span className="shrink-0 text-[10px] text-slate-400">{new Date(conversation.lastMessageAt).toLocaleDateString()}</span>}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">{conversation.lastMessage || 'Start a conversation'}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className={`${active ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-white`} aria-label="Active conversation">
          {!active ? (
            <EmptyState icon={MessageCircleMore} title="Choose a conversation" description="Select a person from the conversation list to read and send messages." />
          ) : (
            <>
              <header className="flex min-h-16 items-center gap-3 border-b border-slate-100 px-3 sm:px-5">
                <button type="button" onClick={() => setActive(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Back to conversations"><ArrowLeft className="h-5 w-5" /></button>
                <Avatar name={activeOther?.name} src={activeOther?.profilePhoto} size="md" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-extrabold text-slate-950">{activeOther?.name || 'Community member'}</h2>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{activeOther?.role || 'Alumni Bridge member'}</p>
                </div>
                <Badge tone={status === 'connected' ? 'green' : 'slate'}>
                  {status === 'connected' ? <Signal className="h-3 w-3" /> : <SignalZero className="h-3 w-3" />}
                  {status === 'connected' ? 'Live' : 'Reconnecting'}
                </Badge>
              </header>

              <div className="flex-1 overflow-y-auto bg-slate-50/60 p-3 scrollbar-thin sm:p-5">
                {messagesLoading ? (
                  <div className="space-y-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className={`h-12 ${item % 2 ? 'ml-auto w-2/5' : 'w-1/2'}`} />)}</div>
                ) : messagesError && messages.length === 0 ? (
                  <ErrorState compact message={messagesError} onRetry={() => loadMessages(active)} />
                ) : messages.length === 0 ? (
                  <EmptyState compact icon={MessageCircleMore} title={`Start a conversation with ${activeOther?.name || 'this member'}`} description="A thoughtful first message can set expectations for a useful mentorship conversation." />
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const mine = String(message.senderId?._id || message.senderId) === String(user?._id);
                      return (
                        <div key={message._id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                          {!mine && <Avatar name={message.senderId?.name || activeOther?.name} src={message.senderId?.profilePhoto} size="sm" />}
                          <div className={`max-w-[84%] px-4 py-2.5 text-sm leading-6 shadow-sm sm:max-w-[70%] ${mine ? 'rounded-2xl rounded-br-md bg-blue-600 text-white' : 'rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-700'}`}>
                            <p className="break-words whitespace-pre-wrap">{message.content}</p>
                            <p className={`mt-1 text-[10px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      );
                    })}
                    {typingUser && <p className="pl-10 text-xs font-semibold text-slate-400">{activeOther?.name || 'They'} is typing…</p>}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="border-t border-slate-100 bg-white p-3 sm:p-4">
                {messagesError && messages.length > 0 && <p className="mb-2 text-xs text-red-600" role="alert">{messagesError}</p>}
                <div className="flex items-end gap-2">
                  <textarea value={input} onChange={updateInput} rows="1" maxLength="4000" placeholder="Write a message…" className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                  <Button type="submit" size="icon" loading={sending} disabled={!input.trim()} aria-label="Send message"><Send className="h-4 w-4" /></Button>
                </div>
              </form>
            </>
          )}
        </section>
      </Card>
    </div>
  );
}
