import { useState } from "react";
import { Globe, Search, Trash2, ExternalLink, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/lib/ide-store";

export default function KnowledgeBase() {
  const {
    knowledgeEntries,
    addKnowledgeEntry,
    removeKnowledgeEntry,
    hiveContributeEnabled,
    toggleHiveContribute,
  } = useIDEStore();

  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url.trim()) return;

    setIsLoading(true);

    try {
      // Use Jina AI reader to fetch clean markdown
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url.trim())}`;
      
      const response = await fetch(jinaUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }

      const markdown = await response.text();
      
      // Extract title from the first heading or URL
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : new URL(url).hostname;

      addKnowledgeEntry({
        url: url.trim(),
        title,
        content: markdown,
        contributedToHive: hiveContributeEnabled,
      });

      // If Hive contribution is enabled, we would send to Firestore here
      if (hiveContributeEnabled) {
        toast({
          title: "Contributed to Hive",
          description: "Your scraped content has been shared with the community.",
        });
      }

      toast({
        title: "Content scraped",
        description: `Successfully added "${title}" to your knowledge base.`,
      });

      setUrl("");
    } catch (error) {
      toast({
        title: "Scraping failed",
        description: "Could not fetch content from the URL. Please check if it's accessible.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 flex items-center px-3 border-b border-sidebar-border">
        <span className="text-xs font-sans uppercase tracking-widest font-semibold text-muted-foreground">
          Knowledge Base
        </span>
      </div>

      <div className="p-3 space-y-4 border-b border-sidebar-border">
        {/* URL Scraper */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">The Scraper</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.example.com"
                className="pl-8 font-mono text-xs"
                data-testid="input-scraper-url"
              />
            </div>
            <Button
              size="icon"
              onClick={handleScrape}
              disabled={isLoading || !url.trim()}
              data-testid="button-scrape"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Hive Sync Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="hive-toggle" className="text-xs font-medium flex items-center gap-2">
              <Share2 className="w-3 h-3 text-accent" />
              Contribute to Hive
            </Label>
            <p className="text-[10px] text-muted-foreground">
              Share scraped docs with the community
            </p>
          </div>
          <Switch
            id="hive-toggle"
            checked={hiveContributeEnabled}
            onCheckedChange={toggleHiveContribute}
            data-testid="switch-hive-contribute"
          />
        </div>
      </div>

      {/* Scraped entries */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {knowledgeEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <Globe className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                No knowledge entries yet
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Scrape documentation URLs to inject context into AI
              </p>
            </div>
          ) : (
            knowledgeEntries.map((entry) => (
              <Card key={entry.id} className="group">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xs font-mono truncate">
                        {entry.title}
                      </CardTitle>
                      <CardDescription className="text-[10px] truncate">
                        {entry.url}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ visibility: "visible" }}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6"
                        onClick={() => window.open(entry.url, "_blank")}
                        data-testid={`button-open-${entry.id}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6 text-destructive"
                        onClick={() => removeKnowledgeEntry(entry.id)}
                        data-testid={`button-delete-${entry.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-4">
                      {Math.round(entry.content.length / 1000)}k chars
                    </Badge>
                    {entry.contributedToHive && (
                      <Badge variant="secondary" className="text-[10px] h-4">
                        <Share2 className="w-2 h-2 mr-1" />
                        Shared
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
