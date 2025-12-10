"use client";

import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

import { Copy, Check } from "lucide-react";

interface TimeResult {
  localFormat: string;
  unixSeconds: string;
  unixMilliseconds: string;
  rfc3339Format: string;
  error: string | null;
}

interface HistoryEntry {
  id: string;
  input: string;
  timestamp: string;
}

const INITIAL_RESULT: TimeResult = {
  localFormat: "",
  unixSeconds: "",
  unixMilliseconds: "",
  rfc3339Format: "",
  error: null,
};

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function timeConverter(input: string): TimeResult {
  if (!input) return INITIAL_RESULT;

  const trimmedInput = input.trim();
  const numericValue = Number(trimmedInput);
  let timestamp: number;
  let date: Date;

  if (!isNaN(numericValue) && trimmedInput !== "") {
    if (numericValue > 0) {
      const SECONDS_THRESHOLD = 100000000000;
      timestamp = numericValue < SECONDS_THRESHOLD ? numericValue * 1000 : numericValue;
      date = new Date(timestamp);
    } else {
      return { ...INITIAL_RESULT, error: "Timestamp must be a positive number." };
    }
  } else {
    timestamp = Date.parse(trimmedInput);
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) {
    const errorMsg = !isNaN(Number(trimmedInput))
      ? "Invalid timestamp (e.g., too large, too small, or non-integer)."
      : "Invalid date or time string format. Please check the examples below.";
    return { ...INITIAL_RESULT, error: errorMsg };
  }

  const isoString = date.toISOString();

  return {
    localFormat: formatDateTime(date),
    unixSeconds: String(Math.floor(date.getTime() / 1000)),
    unixMilliseconds: String(date.getTime()),
    rfc3339Format: isoString,
    error: null,
  };
}

interface TimeOutputFieldProps {
  label: string;
  value: string;
  fieldKey: string;
  placeholder: string;
  copyToClipboard: (v: string, fieldKey: string) => void;
  copiedFieldKey: string | null;
}

const TimeOutputField = ({
  label,
  value,
  fieldKey,
  placeholder,
  copyToClipboard,
  copiedFieldKey,
}: TimeOutputFieldProps) => (
  <div className="grid w-full items-center gap-2">
    <Label className="text-sm font-medium text-neutral-700">{label}</Label>
    <div className="flex w-full items-center gap-2">
      <Input
        type="text"
        placeholder={placeholder}
        readOnly
        value={value}
        className="font-mono flex-1 min-w-0"
      />
      <Button
        type="button"
        aria-label="Copy"
        title="Copy"
        variant="outline"
        size="icon"
        onClick={() => copyToClipboard(value, fieldKey)}
        disabled={!value}
      >
        {copiedFieldKey === fieldKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  </div>
);

export default function TimeConverterPage() {
  const [input, setInput] = useState(formatDateTime(new Date()));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedFieldKey, setCopiedFieldKey] = useState<string | null>(null);

  const [conversionResult, setConversionResult] = useState<TimeResult>(INITIAL_RESULT);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const themeClasses = "bg-white text-neutral-900 border-neutral-200";

  const currentFormattedTime = formatDateTime(new Date());
  const currentTsSec = Math.floor(Date.now() / 1000).toString();
  const currentTsMs = Date.now().toString();

  const copyToClipboard = useCallback((value: string, fieldKey: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedFieldKey(fieldKey);
    setTimeout(() => setCopiedFieldKey(null), 1200);
  }, []);

  const saveToHistory = useCallback((inputText: string, result: TimeResult) => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || result.error) return;

    setHistory(prev => {
      if (prev[0]?.input.trim() === trimmedInput) return prev;

      const record: HistoryEntry = {
        id: uuidv4(),
        input: trimmedInput,
        timestamp: formatDateTime(new Date()),
      };

      const next = [record, ...prev].slice(0, 100);
      localStorage.setItem("time-converter-history", JSON.stringify(next));
      return next;
    });
  }, []);

  const handleConvertTime = useCallback((value: string) => {
    const result = timeConverter(value);
    setConversionResult(result);
    setConversionError(result.error);

    if (result.error === null && value.trim()) {
      saveToHistory(value, result);
    }
  }, [saveToHistory]);

  const triggerConvert = useCallback(() => {
    handleConvertTime(input);
  }, [input, handleConvertTime]);

  const applyPreset = useCallback((value: string) => {
    setInput(value);
    handleConvertTime(value);
  }, [handleConvertTime]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("time-converter-history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      setHistory([]);
    }
    handleConvertTime(input);
  }, []);

  return (
    <div className={`p-4 flex flex-col h-full gap-4 transition-colors ${themeClasses}`}>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={() => applyPreset(currentFormattedTime)}>Use Current Date</Button>
          <Button variant="outline" onClick={() => applyPreset(currentTsSec)}>
            Use Timestamp (s)
          </Button>
          <Button variant="outline" onClick={() => applyPreset(currentTsMs)}>
            Use Timestamp (ms)
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
          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-neutral-50/50">
            <div className="flex w-full items-center gap-2">
              <Input
                type="text"
                className="px-3 py-2 border rounded-md font-mono text-sm flex-1"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setConversionResult(INITIAL_RESULT);
                  setConversionError(null);
                }}
                placeholder="Enter time, e.g., 2025-12-09 18:00:00 or 1765296135"
              />
              <Button type="button" variant="outline" onClick={triggerConvert} disabled={!input.trim()}>
                Convert
              </Button>
            </div>

            <div className="text-xs opacity-70 mt-1 space-y-1">
              <div>Example formats supported:</div>
              <div className="pl-3">• 2025-12-09 18:00:00 (Date Time)</div>
              <div className="pl-3">• 2025/12/09 18:00:00 (Date Time)</div>
              <div className="pl-3">• 1765296135 (Unix Timestamp - seconds)</div>
              <div className="pl-3">• 1765296135000 (Unix Timestamp - milliseconds)</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm opacity-70 font-mono">Output</label>
          </div>
          <div className="flex flex-col gap-3 p-4 border rounded-lg">
            <TimeOutputField
              label="Local Date Time"
              value={conversionResult.localFormat}
              fieldKey="out-local"
              placeholder="-"
              copyToClipboard={copyToClipboard}
              copiedFieldKey={copiedFieldKey}
            />
            <TimeOutputField
              label="Unix Timestamp (sec)"
              value={conversionResult.unixSeconds}
              fieldKey="out-sec"
              placeholder="0"
              copyToClipboard={copyToClipboard}
              copiedFieldKey={copiedFieldKey}
            />
            <TimeOutputField
              label="Unix Timestamp (ms)"
              value={conversionResult.unixMilliseconds}
              fieldKey="out-ms"
              placeholder="0"
              copyToClipboard={copyToClipboard}
              copiedFieldKey={copiedFieldKey}
            />
            <TimeOutputField
              label="RFC3339"
              value={conversionResult.rfc3339Format}
              fieldKey="out-rfc3339"
              placeholder="-"
              copyToClipboard={copyToClipboard}
              copiedFieldKey={copiedFieldKey}
            />

            <div className="mt-auto">
              {conversionError && (
                <div className="text-sm bg-red-100 text-red-600 p-2 rounded border border-red-300 font-mono mt-2">
                  Error: {conversionError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className={`max-w-lg ${themeClasses}`}>
          <DialogHeader>
            <DialogTitle>History</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {history.length === 0 && <div className="text-sm opacity-70">No history</div>}
            {history.map((entry) => (
              <Card key={entry.id} className={`border ${themeClasses} p-3`}>
                <CardContent className="p-0 space-y-2">
                  <div className="text-xs opacity-70 font-mono flex justify-between">
                    <span>{entry.timestamp}</span>
                  </div>
                  <pre className="text-xs font-mono whitespace-pre-wrap max-h-32 overflow-auto p-2 bg-neutral-50 rounded border border-neutral-200">
                    Input: {entry.input}
                  </pre>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        applyPreset(entry.input);
                        setShowHistory(false);
                      }}
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setHistory((prev) => {
                          const next = prev.filter((h) => h.id !== entry.id);
                          localStorage.setItem("time-converter-history", JSON.stringify(next));
                          return next;
                        });
                      }}
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
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem("time-converter-history");
                }}
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