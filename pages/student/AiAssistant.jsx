import { Bot, RotateCcw, Send, Sparkles, Trash2, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/apiError';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const suggestions = [
  'Build a 90-day roadmap for a frontend internship',
  'Help me prepare for a product engineering interview',
  'What should I ask an alumni mentor in our first call?',
  'Review my plan to move from college projects to job-ready skills',
];

export default function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailed, setLastFailed] = useState('');
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loading, messages]);

  const send = async (event, suppliedMessage) => {
    event?.preventDefault?.();
    const content = (suppliedMessage ?? input).trim();
    if (!content || loading) return;
    setInput('');
    setLastFailed('');
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', content }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: content });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', content: data.reply }]);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'The career assistant could not respond.');
      setLastFailed(content);
      setMessages((current) => [...current, { id: `error-${Date.now()}`, role: 'error', content: message }]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    setClearing(true);
    try {
      await api.delete('/ai/history');
      setMessages([]);
      setLastFailed('');
      setClearOpen(false);
    } catch (requestError) {
      setMessages((current) => [...current, {
        id: `error-${Date.now()}`,
        role: 'error',
        content: getApiErrorMessage(requestError, 'The conversation could not be cleared.'),
      }]);
      setClearOpen(false);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <Card className="mx-auto flex h-[calc(100dvh-5.5rem)] max-w-5xl flex-col overflow-hidden lg:h-[calc(100dvh-7rem)]">
        <header className="flex min-h-16 items-center justify-between border-b border-slate-100 px-4 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Bot className="h-5 w-5" /></span>
            <div>
              <h1 className="text-sm font-extrabold text-slate-950 sm:text-base">AI career assistant</h1>
              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">Practical guidance for skills, interviews, and mentorship</p>
            </div>
          </div>
          {messages.length > 0 && <Button variant="ghost" size="sm" onClick={() => setClearOpen(true)}><Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Clear conversation</span></Button>}
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 scrollbar-thin sm:p-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-200"><Sparkles className="h-7 w-7" /></span>
              <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950">What would you like to work through?</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Use the assistant to structure your thinking, prepare for a conversation, or turn a broad career goal into concrete next steps.</p>
              <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => send(null, suggestion)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-semibold leading-6 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((message) => {
                const mine = message.role === 'user';
                const failure = message.role === 'error';
                return (
                  <div key={message.id} className={`flex items-start gap-3 ${mine ? 'justify-end' : 'justify-start'}`}>
                    {!mine && <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${failure ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-700'}`}><Bot className="h-4 w-4" /></span>}
                    <div className={`max-w-[86%] break-words whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[78%] ${mine ? 'rounded-br-md bg-blue-600 text-white' : failure ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-700' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'}`}>
                      {message.content}
                    </div>
                    {mine && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600"><UserRound className="h-4 w-4" /></span>}
                  </div>
                );
              })}
              {loading && (
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Bot className="h-4 w-4" /></span>
                  <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-4">
                    {[0, 1, 2].map((item) => <span key={item} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${item * 120}ms` }} />)}
                  </div>
                </div>
              )}
              {lastFailed && !loading && <div className="flex justify-center"><Button variant="secondary" size="sm" onClick={() => send(null, lastFailed)}><RotateCcw className="h-4 w-4" /> Retry last question</Button></div>}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form onSubmit={send} className="border-t border-slate-100 bg-white p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <textarea value={input} onChange={(event) => setInput(event.target.value)} rows="1" maxLength="4000" placeholder="Ask about a career path, skill roadmap, interview, or mentor conversation…" className="max-h-36 min-h-12 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            <Button type="submit" size="icon" disabled={!input.trim()} loading={loading} aria-label="Send question"><Send className="h-4 w-4" /></Button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-400">Use career guidance as a starting point and verify important decisions with people you trust.</p>
        </form>
      </Card>

      <ConfirmDialog open={clearOpen} onClose={() => setClearOpen(false)} onConfirm={clearConversation} title="Clear this conversation?" description="This clears the assistant’s backend conversation history and removes the messages from this screen." confirmLabel="Clear conversation" loading={clearing} />
    </div>
  );
}
