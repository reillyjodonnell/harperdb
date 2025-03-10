'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { timeAgo } from './utils';
import { getMessages } from './actions';

// I normally would just import the type directly from resource.ts but I couldn't make it a .ts file / didn't know how to do the ts compiler step / override the scripts that get ran
type Messages = Array<{
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    email: string;
    location: string;
  };
}>;
type User = {
  id: string;
  name: string;
  email: string;
  location: string;
};

export function Chat({ initialMessages, user }: { initialMessages: Messages }) {
  const { sendMessage, messages } = useMessages(initialMessages, user);
  const [input, setInput] = useState('');

  const messageContainerRef = useRef<HTMLUListElement>(null);

  function handleMessage() {
    sendMessage(input);
    setInput('');
  }

  useLayoutEffect(() => {
    messageContainerRef.current?.scrollTo({ top: 999999, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="border border-slate-100 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <p className="text-sm text-slate-500">Here's what locals are saying</p>
      </div>
      <div className="max-h-[500px] flex flex-col min-h-0 flex-1">
        <ul
          ref={messageContainerRef}
          style={{ scrollBehavior: 'auto' }}
          className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse"
        >
          {messages.length === 0 && (
            <li className="flex w-full h-full font-bold justify-center items-center">
              No messages yet
            </li>
          )}
          {messages.length >= 1 &&
            messages.map((message) => {
              return (
                <li
                  key={message.id}
                  className={`p-4 flex gap-2 justify-start items-end ${
                    message.sender.id === user.id
                      ? ' text-white flex-row-reverse'
                      : 'flex-row'
                  }`}
                >
                  <div className="message-avatar">
                    {message.sender.name[0].toUpperCase()}
                  </div>
                  <div
                    className={`flex flex-col justify-between  p-4 rounded-sm text-sm break-words whitespace-pre-wrap max-w-[50%] ${
                      message.sender.id === user.id
                        ? 'bg-white items-end text-black border border-slate-100'
                        : 'bg-slate-800 items-start text-white border border-slate-800'
                    }`}
                  >
                    {message.content}
                    <span className="message-timestamp">
                      {timeAgo(new Date(message.timestamp).getTime())}
                    </span>
                  </div>
                </li>
              );
            })}
        </ul>
        <div className="border-t p-4 flex gap-2 border-gray-200">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type here"
            className="border border-[#e4e4e7] shadow-sm focus-visible:ring-1 focus-visible:ring-slate-400 max-h-12 px-4 py-3 bg-background text-sm disabled:cursor-not-allowed disabled:opacity-50 w-full flex items-center h-16 resize-none rounded-md placeholder-slate-500"
          />
          <button
            onClick={handleMessage}
            className="rounded-xl p-2 cursor-pointer text-[#71717a] hover:bg-[#f4f4f5] transition-all duration-300  "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-send"
            >
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
              <path d="m21.854 2.147-10.94 10.939" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function useMessages(initialMessages: Messages, user: User) {
  // doing this bc the sql command isn't sorting - I don't think ORDER BY is supported yet?
  const [messages, setMessages] = useState(
    initialMessages.sort(
      (a, b) =>
        // descending order but we display it as a flex-col-reverse so newest is at the bottom
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  );
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9926/Chat');
    wsRef.current = ws;
    ws.onmessage = (event) => {
      // again it's at the beginning bc we're using flex-col-reverse
      setMessages((prev) => [JSON.parse(event.data), ...prev]);
    };
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  function sendMessage(content) {
    wsRef.current.send(
      JSON.stringify({
        content,
        senderId: '9cf6450a-68b5-4afd-a31b-bfdb7f9e2c74',
        sender: {
          id: user.id,
          name: user.name,
          email: user.email,
          location: user.location,
        },
      })
    );
  }

  return { sendMessage, messages };
}
