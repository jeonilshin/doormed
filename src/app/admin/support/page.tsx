'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { MessageSquare, User, Clock } from 'lucide-react'

export default function AdminSupport() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [replyMessage, setReplyMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    fetchConversations()
    // Removed auto-refresh for better performance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived])

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/admin/support?archived=${showArchived}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/admin/support/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setSelectedConversation(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!replyMessage.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedConversation.user.id,
          conversationId: selectedConversation.messages[0].conversationId,
          message: replyMessage
        })
      })

      if (response.ok) {
        setReplyMessage('')
        await fetchConversationMessages(selectedConversation.messages[0].conversationId)
        await fetchConversations()
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setSending(false)
    }
  }

  const handleArchiveConversation = async () => {
    if (!selectedConversation) return
    
    if (!confirm('Archive this conversation? The customer can start a new conversation if needed.')) return

    try {
      const response = await fetch(`/api/admin/support/${selectedConversation.messages[0].conversationId}/archive`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Conversation archived successfully')
        setSelectedConversation(null)
        setMessages([])
        await fetchConversations()
      }
    } catch (error) {
      console.error('Error archiving conversation:', error)
      alert('Failed to archive conversation')
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif italic text-[#1b4332] mb-2">Customer Support</h1>
            <p className="text-gray-600">View and respond to customer messages</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">Show Archived</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-[#f2f7e8]">
            <h2 className="font-medium text-gray-900">Conversations ({conversations.length})</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {loading ? (
              <div className="p-4 text-center text-gray-600">Loading...</div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.conversationId}
                  onClick={() => fetchConversationMessages(conv.conversationId)}
                  className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition text-left ${
                    selectedConversation?.messages?.[0]?.conversationId === conv.conversationId
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1b4332] text-[#c9e265] flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {conv.user?.firstName} {conv.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{conv.user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {conv.messageCount} messages
                        </span>
                        {conv.isArchived && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            Archived
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-[#f2f7e8]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1b4332] text-[#c9e265] flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedConversation.user?.firstName} {selectedConversation.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedConversation.user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleArchiveConversation}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                  >
                    Archive
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-[#f2f7e8] text-gray-900'
                          : 'bg-[#1b4332] text-white'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-gray-500' : 'text-white/70'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!replyMessage.trim() || sending}
                    className="bg-[#1b4332] text-[#c9e265] px-6 py-3 rounded-xl font-medium hover:bg-[#143528] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send Reply'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
