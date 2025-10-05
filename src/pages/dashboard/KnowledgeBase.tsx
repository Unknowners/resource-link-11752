import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Loader2, ExternalLink, Plus, MessageSquare, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        .single();

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

  const loadConversation = async (convId: string) => {
    try {
      setLoadingHistory(true);
      setConversationId(convId);
      setShowWelcome(false);

      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (messagesData && messagesData.length > 0) {
        const loadedMessages: Message[] = messagesData.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          sources: msg.sources ? (msg.sources as any) : undefined,
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error("Помилка завантаження розмови");
    } finally {
      setLoadingHistory(false);
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
    // Auto-send after a brief delay
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

    // Create conversation if doesn't exist
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

      // Save user message
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessageContent,
      });

      // Update conversation timestamp
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

      // Save assistant message
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
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">База знань</h2>
        </div>
        
        <Button onClick={createNewConversation} className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          Нова розмова
        </Button>

        <Separator />

        <ScrollArea className="flex-1 -mr-4 pr-4">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg hover:bg-accent transition-colors group flex items-center justify-between ${
                  conversationId === conv.id ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">{conv.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => deleteConversation(conv.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
        <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
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
                  
                  {/* Sources */}
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

        {/* Input Area */}
        <div className="border-t p-4">
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
      </Card>
      </div>
    </div>
  );
}
