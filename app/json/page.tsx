"use client";

import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface HistoryItem {
  id: string;
  input: string;
  timestamp: string;
}

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const rawHistory = localStorage.getItem("json-history");
    if (rawHistory) {
      try {
        const arr = JSON.parse(rawHistory) as HistoryItem[];
        setHistory(arr);
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const saveHistory = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      if (history[0]?.input.trim() === trimmedContent) return;

      const item: HistoryItem = {
        id: uuidv4(),
        input: trimmedContent,
        timestamp: formatDateTime(new Date()),
      };

      setHistory(prev => {
        const next = [item, ...prev].slice(0, 100);
        localStorage.setItem("json-history", JSON.stringify(next));
        return next;
      });
    },
    [history]
  );

  const processJson = useCallback((formatter: (obj: any) => string) => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput("");
        return;
      }
      const obj = JSON.parse(input);
      const processedOutput = formatter(obj);
      setOutput(processedOutput);
      saveHistory(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format.");
      setOutput("");
    }
  }, [input, saveHistory]);

  const prettify = useCallback(() => {
    processJson((obj) => JSON.stringify(obj, null, 2));
  }, [processJson]);

  const minify = useCallback(() => {
    processJson((obj) => JSON.stringify(obj));
  }, [processJson]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const copyOutput = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const restoreHistory = useCallback((h: HistoryItem) => {
    setInput(h.input);
    setOutput("");
    setError(null);
    setShowHistory(false);
  }, []);

  const deleteHistory = useCallback(
    (id: string) => {
      setHistory(prev => {
        const next = prev.filter((it) => it.id !== id);
        localStorage.setItem("json-history", JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const clearAllHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("json-history");
  }, []);

  const themeClasses = "bg-white text-neutral-900 border-neutral-200";
  const buttonPrimary = "bg-neutral-900 hover:bg-neutral-800 text-white";

  return (
    <div className={`p-4 flex flex-col h-full gap-4 transition-colors ${themeClasses}`}>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button className={buttonPrimary} onClick={prettify} disabled={!input.trim()}>
            Prettify
          </Button>

          <Button variant="outline" onClick={minify} disabled={!input.trim()}>
            Minify
          </Button>

          <Button variant="outline" onClick={clear} disabled={!input.trim()}>
            Clear
          </Button>
        </div>

        <Button variant="ghost" onClick={() => setShowHistory(true)}>
          History
        </Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm opacity-70 font-mono">Input</label>
            <span className="text-xs opacity-70 font-mono">{input.length} chars</span>
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON here..."
            className="flex-1 p-4 font-mono resize-none"
          />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm opacity-70 font-mono">Output</label>

            {output && (
              <span
                className="text-xs opacity-70 font-mono cursor-pointer hover:opacity-100 transition-opacity"
                onClick={copyOutput}
              >
                {copied ? "Copied" : "Copy"}
              </span>
            )}
          </div>

          <Textarea
            readOnly
            value={output}
            placeholder="Result will appear here..."
            className={`flex-1 p-4 font-mono resize-none bg-neutral-50 ${error ? "border-red-500" : ""}`}
          />

          {error && (
            <div className="text-sm bg-red-100 text-red-600 p-2 rounded mt-2 border border-red-300 font-mono">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className={`max-w-lg ${themeClasses}`}>
          <DialogHeader>
            <DialogTitle className="font-semibold">History</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {history.length === 0 && (
              <div className="text-sm opacity-70">No history</div>
            )}

            {history.map((item) => (
              <Card key={item.id} className={`border ${themeClasses} p-3`}>
                <CardContent className="p-0 space-y-2">
                  <div className="text-xs opacity-70 font-mono">
                    {item.timestamp}
                  </div>

                  <pre className="text-xs font-mono whitespace-pre-wrap max-h-32 overflow-auto p-2 bg-neutral-50 rounded border border-neutral-200">
                    {item.input}
                  </pre>

                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreHistory(item)}
                    >
                      Restore
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteHistory(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {history.length > 0 && (
            <DialogFooter>
              <Button
                variant="destructive"
                className="w-full"
                onClick={clearAllHistory}
              >
                Clear All
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}