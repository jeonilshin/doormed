'use client'

import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Send, MessageSquare } from 'lucide-react'

export default function Support() {
  const [messages, setMessages] = useState<any[]>([])
  const [conversationId, setConversationId] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Removed auto-refresh for better performance
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/support/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setConversationId(data.conversationId)
        setIsArchived(data.isArchived || false)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          conversationId
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Update conversation ID if it changed (new conversation created)
        if (data.conversationId !== conversationId) {
          setConversationId(data.conversationId)
        }
        setNewMessage('')
        await fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardLayout 
      currentPage="/dashboard/support" 
      title="Customer Support"
      subtitle="Get help from our support team"
    >
      <div className="bg-white rounded-2xl border border-gray-200 h-[calc(100vh-250px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading messages...</p>
            </div>
          ) : messages.length > 0 ? (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-[#1b4332] text-white'
                        : 'bg-[#f2f7e8] text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No messages yet</p>
              <p className="text-sm text-gray-500">
                Send a message to start a conversation with our support team
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-5 w-5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Help Info */}
        <div className="border-t border-gray-200 p-4 bg-[#f2f7e8]">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700 mb-1">Email Support</p>
              <p className="text-gray-600">support@doormedexpress.com</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Phone Support</p>
              <p className="text-gray-600">+63 2 1234 5678</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Business Hours</p>
              <p className="text-gray-600">Mon-Fri: 8AM-6PM</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
