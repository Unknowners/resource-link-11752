import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Loader2, ExternalLink, Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface Source {
  id: string;
  name: string;
  type: string;
  integration: string;
  url?: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const SUGGESTED_PROMPTS = [
  "Які основні цінності компанії?",
  "Як налаштувати електронну пошту?",
  "Яка політика відпусток?",
  "Де знайти інструкцію для працівників?",
];

export default function KnowledgeBase() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MESSAGES_PER_PAGE = 2;

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!member) return;
      setOrganizationId(member.organization_id);

      const { data: convData } = await supabase
        .from('chat_conversations')
        .select('id, title, created_at, updated_at')
        .eq('organization_id', member.organization_id)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      setConversations(convData || []);
      
      if (convData && convData.length > 0) {
        loadConversation(convData[0].id);
      } else {
        setShowWelcome(true);
        setLoadingHistory(false);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoadingHistory(false);
    }
  };

  const loadConversation = async (convId: string, isInitial = true) => {
    try {
      setLoadingHistory(true);
      setConversationId(convId);
      setShowWelcome(false);

      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (error) throw error;

      if (messagesData && messagesData.length > 0) {
        const loadedMessages: Message[] = messagesData.reverse().map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          sources: msg.sources ? (msg.sources as any) : undefined,
        }));
        
        setMessages(loadedMessages);
        const oldestMsg = messagesData[messagesData.length - 1];
        setOldestMessageTimestamp(oldestMsg.created_at);
        setHasMoreMessages(messagesData.length === MESSAGES_PER_PAGE);
      } else {
        setMessages([]);
        setHasMoreMessages(false);
        setOldestMessageTimestamp(null);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error("Помилка завантаження розмови");
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!conversationId || !oldestMessageTimestamp || loadingMore || !hasMoreMessages) return;

    try {
      setLoadingMore(true);

      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .lt('created_at', oldestMessageTimestamp)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (error) throw error;

      if (messagesData && messagesData.length > 0) {
        const loadedMessages: Message[] = messagesData.reverse().map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          sources: msg.sources ? (msg.sources as any) : undefined,
        }));
        
        setMessages(prev => [...loadedMessages, ...prev]);
        const oldestMsg = messagesData[messagesData.length - 1];
        setOldestMessageTimestamp(oldestMsg.created_at);
        setHasMoreMessages(messagesData.length === MESSAGES_PER_PAGE);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast.error("Помилка завантаження повідомлень");
    } finally {
      setLoadingMore(false);
    }
  };


  const createNewConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !organizationId) return;

      const { data: newConversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          organization_id: organizationId,
          user_id: user.id,
          title: 'Нова розмова'
        })
        .select()
        .single();

      if (error) throw error;

      setConversations([newConversation, ...conversations]);
      setConversationId(newConversation.id);
      setMessages([]);
      setShowWelcome(true);
      toast.success("Створено нову розмову");
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error("Помилка створення розмови");
    }
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.from('chat_conversations').delete().eq('id', convId);
      
      const updatedConvs = conversations.filter(c => c.id !== convId);
      setConversations(updatedConvs);
      
      if (conversationId === convId) {
        if (updatedConvs.length > 0) {
          loadConversation(updatedConvs[0].id);
        } else {
          setConversationId(null);
          setMessages([]);
          setShowWelcome(true);
        }
      }
      
      toast.success("Розмову видалено");
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error("Помилка видалення розмови");
    }
  };

  const handlePromptClick = async (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSend(prompt), 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (promptText?: string) => {
    const messageText = promptText || input;
    if (!messageText.trim() || isLoading) return;

    if (!conversationId) {
      await createNewConversation();
      return;
    }

    const userMessageContent = messageText;
    const userMessage: Message = { role: "user", content: userMessageContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowWelcome(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Необхідна авторизація");
        setIsLoading(false);
        return;
      }

      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessageContent,
      });

      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      const { data, error } = await supabase.functions.invoke('knowledge-qa', {
        body: {
          question: userMessageContent,
          userId: user.id,
          organizationId: organizationId,
          conversationId: conversationId,
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        timestamp: data.timestamp,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      });
    } catch (error: any) {
      console.error('Error calling knowledge-qa:', error);
      
      if (error.message?.includes('429')) {
        toast.error("Перевищено ліміт запитів. Спробуйте пізніше.");
      } else if (error.message?.includes('402')) {
        toast.error("Недостатньо кредитів для AI запитів.");
      } else {
        toast.error("Помилка при обробці запиту");
      }
      
      const errorMessage: Message = {
        role: "assistant",
        content: "Вибачте, виникла помилка при обробці вашого запиту. Спробуйте ще раз.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-4rem)]">
      <ResizablePanel 
        defaultSize={20} 
        minSize={sidebarCollapsed ? 0 : 15} 
        maxSize={30}
        collapsible={true}
        onCollapse={() => setSidebarCollapsed(true)}
        onExpand={() => setSidebarCollapsed(false)}
      >
        <div className="h-full bg-gradient-to-b from-card to-card/50 border-r flex flex-col">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                {!sidebarCollapsed && <h2 className="font-semibold">Історія</h2>}
              </div>
            </div>
            
            {!sidebarCollapsed && (
              <Button 
                onClick={createNewConversation} 
                className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Нова розмова
              </Button>
            )}

            {sidebarCollapsed && (
              <Button 
                onClick={createNewConversation} 
                size="icon"
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Separator className="opacity-50" />

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`w-full text-left p-2 rounded-lg transition-all group flex items-center justify-between cursor-pointer ${
                    conversationId === conv.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare className={`h-4 w-4 flex-shrink-0 ${
                      conversationId === conv.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    {!sidebarCollapsed && (
                      <span className="text-sm truncate">{conv.title}</span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => deleteConversation(conv.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={80}>
        <div className="h-full flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 h-0 p-4 sm:p-6" ref={scrollAreaRef}>
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : showWelcome ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-3xl">Вітаємо у Базі знань</h2>
                <p className="text-muted-foreground">
                  Задайте будь-яке питання про вашу компанію. Я надам відповіді на основі завантажених ресурсів.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="h-auto py-4 px-4 text-left justify-start whitespace-normal"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {hasMoreMessages && (
                <div className="flex justify-center py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                    className="gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Завантаження...
                      </>
                    ) : (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Завантажити старіші
                      </>
                    )}
                  </Button>
                </div>
              )}

              {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[80%] space-y-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-wrap">
                    {message.content}
                  </p>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-xs font-semibold opacity-70">Джерела:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source) => (
                          <Badge
                            key={source.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {source.name}
                            {source.url && (
                              <ExternalLink className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold">Ви</span>
                  </div>
                )}
              </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-secondary flex items-center gap-1">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
          </ScrollArea>

          <div className="border-t p-4 bg-background">
            <div className="max-w-4xl mx-auto flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напишіть ваше питання..."
                disabled={isLoading}
                className="flex-1 h-12 text-base"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="h-12 px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
