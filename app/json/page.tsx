'use client';

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

function formatLocalTimestamp(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export default function Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("json-history");
    if (s) {
      try {
        const arr = JSON.parse(s) as HistoryItem[];
        setHistory(arr);
      } catch { }
    }
  }, []);

  const saveHistory = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      if (history[0]?.input.trim() === trimmedContent) return;

      const now = new Date();
      const timestamp = formatLocalTimestamp(now);

      const item: HistoryItem = {
        id: uuidv4(),
        input: trimmedContent,
        timestamp,
      };

      const next = [item, ...history].slice(0, 100);
      setHistory(next);
      localStorage.setItem("json-history", JSON.stringify(next));
    },
    [history]
  );

  const prettify = useCallback(() => {
    setError(null);
    try {
      const obj = JSON.parse(input);
      const pretty = JSON.stringify(obj, null, 2);
      setOutput(pretty);
      saveHistory(input);
    } catch (err) {
      setError((err as Error).message);
      setOutput("");
    }
  }, [input, saveHistory]);

  const minify = useCallback(() => {
    setError(null);
    try {
      const obj = JSON.parse(input);
      const m = JSON.stringify(obj);
      setOutput(m);
      saveHistory(input);
    } catch (err) {
      setError((err as Error).message);
      setOutput("");
    }
  }, [input, saveHistory]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const restoreHistory = useCallback((h: HistoryItem) => {
    setInput(h.input);
    setShowHistory(false);
  }, []);

  const deleteHistory = useCallback(
    (id: string) => {
      const next = history.filter((it) => it.id !== id);
      setHistory(next);
      localStorage.setItem("json-history", JSON.stringify(next));
    },
    [history]
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
          <Button className={buttonPrimary} onClick={prettify}>
            Prettify
          </Button>

          <Button variant="outline" onClick={minify}>
            Minify
          </Button>

          <Button variant="outline" onClick={clear}>
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

          {/* <div className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pr-1"> */}
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