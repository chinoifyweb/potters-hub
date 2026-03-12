"use client"

import React, { useState } from "react"
import { Send, Plus, Search, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
  id: string
  text: string
  sender: "me" | "other"
  time: string
}

interface Conversation {
  id: string
  name: string
  avatar?: string
  initials: string
  lastMessage: string
  time: string
  unread: number
  messages: Message[]
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Pastor James Okonkwo",
    initials: "JO",
    lastMessage: "God bless you! See you on Sunday.",
    time: "10:30 AM",
    unread: 1,
    messages: [
      { id: "m1", text: "Good morning Pastor! I wanted to ask about joining the prayer team.", sender: "me", time: "9:15 AM" },
      { id: "m2", text: "Good morning John! That's wonderful to hear. We'd love to have you on the prayer team.", sender: "other", time: "9:45 AM" },
      { id: "m3", text: "The team meets every Tuesday at 5:30 AM in the prayer room. Can you make it?", sender: "other", time: "9:46 AM" },
      { id: "m4", text: "Yes, I can! I'll be there this Tuesday.", sender: "me", time: "10:00 AM" },
      { id: "m5", text: "God bless you! See you on Sunday.", sender: "other", time: "10:30 AM" },
    ],
  },
  {
    id: "2",
    name: "Grace Eze",
    initials: "GE",
    lastMessage: "The youth program is going to be amazing!",
    time: "Yesterday",
    unread: 0,
    messages: [
      { id: "m6", text: "Hi Grace, are you coordinating the youth fellowship this Friday?", sender: "me", time: "Yesterday 3:00 PM" },
      { id: "m7", text: "Yes I am! We have a great program lined up.", sender: "other", time: "Yesterday 3:30 PM" },
      { id: "m8", text: "That's great! Can I help with anything?", sender: "me", time: "Yesterday 3:35 PM" },
      { id: "m9", text: "The youth program is going to be amazing!", sender: "other", time: "Yesterday 4:00 PM" },
    ],
  },
  {
    id: "3",
    name: "Men of Valor Group",
    initials: "MV",
    lastMessage: "Paul: Don't forget our meeting Saturday!",
    time: "Yesterday",
    unread: 3,
    messages: [
      { id: "m10", text: "Brothers, what a powerful Bible study today!", sender: "other", time: "Yesterday 8:00 AM" },
      { id: "m11", text: "Amen! The lesson on David was really inspiring.", sender: "me", time: "Yesterday 8:15 AM" },
      { id: "m12", text: "Don't forget our meeting Saturday!", sender: "other", time: "Yesterday 8:30 AM" },
    ],
  },
  {
    id: "4",
    name: "Ruth Adebayo",
    initials: "RA",
    lastMessage: "Thank you for your prayers!",
    time: "Mon",
    unread: 0,
    messages: [
      { id: "m13", text: "Sister Ruth, praying for your ministry event this weekend.", sender: "me", time: "Mon 6:00 PM" },
      { id: "m14", text: "Thank you for your prayers!", sender: "other", time: "Mon 6:30 PM" },
    ],
  },
  {
    id: "5",
    name: "Deacon Paul Mensah",
    initials: "PM",
    lastMessage: "I'll send you the details soon.",
    time: "Sun",
    unread: 0,
    messages: [
      { id: "m15", text: "Deacon Paul, do you have info about the outreach day?", sender: "me", time: "Sun 2:00 PM" },
      { id: "m16", text: "I'll send you the details soon.", sender: "other", time: "Sun 2:30 PM" },
    ],
  },
]

export default function MessagesPage() {
  const [convos, setConvos] = useState(conversations)
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [search, setSearch] = useState("")

  const activeConvo = convos.find((c) => c.id === selectedConvo)

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConvo) return
    setConvos((prev) =>
      prev.map((c) =>
        c.id === selectedConvo
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `m${Date.now()}`,
                  text: messageInput,
                  sender: "me" as const,
                  time: "Just now",
                },
              ],
              lastMessage: messageInput,
              time: "Just now",
            }
          : c
      )
    )
    setMessageInput("")
  }

  const filteredConvos = convos.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectConvo = (id: string) => {
    setSelectedConvo(id)
    setConvos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">Private conversations with church members.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[calc(100vh-220px)] lg:h-[calc(100vh-200px)]">
          {/* Conversation List */}
          <div
            className={cn(
              "w-full sm:w-[320px] border-r flex flex-col",
              selectedConvo && "hidden sm:flex"
            )}
          >
            <div className="p-3 border-b space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 shrink-0"
                  onClick={() => toast.info("New conversation feature coming soon")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {filteredConvos.map((convo) => (
                <button
                  key={convo.id}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left border-b",
                    selectedConvo === convo.id && "bg-accent"
                  )}
                  onClick={() => handleSelectConvo(convo.id)}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={convo.avatar} />
                    <AvatarFallback className="text-xs">{convo.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{convo.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {convo.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {convo.lastMessage}
                    </p>
                  </div>
                  {convo.unread > 0 && (
                    <Badge className="h-5 min-w-[20px] justify-center px-1.5 text-[10px] shrink-0">
                      {convo.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={cn(
              "flex-1 flex flex-col",
              !selectedConvo && "hidden sm:flex"
            )}
          >
            {activeConvo ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-3 border-b">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:hidden"
                    onClick={() => setSelectedConvo(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activeConvo.avatar} />
                    <AvatarFallback className="text-xs">{activeConvo.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{activeConvo.name}</p>
                    <p className="text-[11px] text-muted-foreground">Active now</p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {activeConvo.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.sender === "me" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2",
                            msg.sender === "me"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={cn(
                              "text-[10px] mt-1",
                              msg.sender === "me"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Send className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
