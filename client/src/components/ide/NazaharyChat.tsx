import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Settings, Bot, User, ChevronDown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/lib/ide-store";
import { sendChatMessage } from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";
import type { AIModel } from "@shared/schema";

const modelInfo: Record<AIModel, { name: string; icon: string; color: string }> = {
  "gpt-4": { name: "GPT-4", icon: "O", color: "text-green-400" },
  "claude-3": { name: "Claude 3", icon: "A", color: "text-amber-400" },
  "gemini-pro": { name: "Gemini Pro", icon: "G", color: "text-blue-400" },
};

export default function NazaharyChat() {
  const {
    isChatOpen,
    toggleChat,
    chatMessages,
    addChatMessage,
    aiModel,
    setAIModel,
    apiKeys,
    setApiKey,
    isListening,
    setIsListening,
    knowledgeEntries,
  } = useIDEStore();

  const [message, setMessage] = useState("");
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const userMessage = message.trim();
    setMessage("");
    setIsSending(true);

    // Create user message object
    const userMessageObj = {
      role: "user" as const,
      content: userMessage,
      model: aiModel,
    };
    
    addChatMessage(userMessageObj);

    // Check if API key is configured
    const keyMap = { "gpt-4": "openai", "claude-3": "anthropic", "gemini-pro": "google" } as const;
    const requiredKey = keyMap[aiModel];
    
    if (!apiKeys[requiredKey]) {
      addChatMessage({
        role: "assistant",
        content: `I am Nazahary, your AI assistant in The Black Star Forge. I received your message: "${userMessage}"\n\nTo use my full capabilities, please configure your API key for ${modelInfo[aiModel].name} in the settings (gear icon above).`,
        model: aiModel,
      });
      setIsSending(false);
      return;
    }

    // Build conversation history including the new message for API call
    const conversationForAPI = [...chatMessages, { id: "", role: "user" as const, content: userMessage, timestamp: Date.now() }];
    try {
      const response = await sendChatMessage(aiModel, apiKeys, conversationForAPI, knowledgeEntries);
      
      if (response.error) {
        toast({
          title: "AI Error",
          description: response.error,
          variant: "destructive",
        });
        addChatMessage({
          role: "assistant",
          content: `Error: ${response.error}`,
          model: aiModel,
        });
      } else {
        addChatMessage({
          role: "assistant",
          content: response.content,
          model: aiModel,
        });
      }
    } catch (error) {
      addChatMessage({
        role: "assistant",
        content: "An unexpected error occurred. Please try again.",
        model: aiModel,
      });
    }

    setIsSending(false);
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      // Start listening
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          
          // Check for voice commands
          if (transcript.toLowerCase().includes("deploy")) {
            addChatMessage({
              role: "user",
              content: transcript,
            });
            addChatMessage({
              role: "assistant",
              content: "Initiating deployment sequence... Opening deployment modal.",
            });
          }
          
          setIsListening(false);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.start();
        setIsListening(true);
      } else {
        addChatMessage({
          role: "assistant",
          content: "Voice recognition is not supported in this browser.",
        });
      }
    } else {
      setIsListening(false);
    }
  };

  if (!isChatOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full glow-teal shadow-lg z-50"
        size="icon"
        data-testid="button-open-chat"
      >
        <Bot className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-card border border-card-border rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="h-12 flex items-center justify-between gap-2 px-4 border-b border-card-border bg-muted/30 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-mono text-sm font-semibold text-glow-teal">Nazahary</span>
            <Badge variant="outline" className="ml-2 text-[10px] h-4">
              {modelInfo[aiModel].name}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="button-api-settings">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Settings - War Room Mode</DialogTitle>
                <DialogDescription>
                  Configure your API keys for different AI models. Your keys are stored locally.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={apiKeys.openai || ""}
                    onChange={(e) => setApiKey("openai", e.target.value)}
                    data-testid="input-openai-key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                    value={apiKeys.anthropic || ""}
                    onChange={(e) => setApiKey("anthropic", e.target.value)}
                    data-testid="input-anthropic-key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="google-key">Google AI API Key</Label>
                  <Input
                    id="google-key"
                    type="password"
                    placeholder="..."
                    value={apiKeys.google || ""}
                    onChange={(e) => setApiKey("google", e.target.value)}
                    data-testid="input-google-key"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button size="icon" variant="ghost" onClick={toggleChat} data-testid="button-close-chat">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chatMessages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Welcome to Nazahary</p>
              <p className="text-xs text-muted-foreground">
                Your AI coding assistant. Say "Deploy" to trigger deployment.
              </p>
            </div>
          )}
          
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] px-3 py-2 rounded-lg text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {msg.content}
              </div>
              
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-accent" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-3 border-t border-card-border space-y-2">
        {/* Model selector */}
        <div className="flex items-center gap-2">
          <Select value={aiModel} onValueChange={(v) => setAIModel(v as AIModel)}>
            <SelectTrigger className="h-7 text-xs" data-testid="select-ai-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4" data-testid="select-gpt4">
                <span className={modelInfo["gpt-4"].color}>GPT-4</span>
              </SelectItem>
              <SelectItem value="claude-3" data-testid="select-claude">
                <span className={modelInfo["claude-3"].color}>Claude 3</span>
              </SelectItem>
              <SelectItem value="gemini-pro" data-testid="select-gemini">
                <span className={modelInfo["gemini-pro"].color}>Gemini Pro</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Message input */}
        <div className="flex items-center gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Nazahary..."
            className="min-h-[40px] max-h-[100px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            data-testid="input-chat-message"
          />
          
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              variant={isListening ? "destructive" : "ghost"}
              onClick={handleVoiceToggle}
              data-testid="button-voice"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button size="icon" onClick={handleSend} disabled={!message.trim() || isSending} data-testid="button-send">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
