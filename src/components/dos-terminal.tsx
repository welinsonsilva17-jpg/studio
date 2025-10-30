
'use client';

import { parseAndExecuteDosCommand } from '@/ai/flows/parse-and-execute-dos-commands';
import { suggestDosCommands } from '@/ai/flows/suggest-dos-commands';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Folder, Terminal as TerminalIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Form, FormControl, FormField, FormItem } from './ui/form';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';

type HistoryItem = {
  id: number;
  type: 'command' | 'output';
  content: React.ReactNode;
};

const formSchema = z.object({
  command: z.string(),
});

export function DosTerminal() {
  const { toast } = useToast();
  const { currentPath, changeDirectory, listDirectory, readFile, writeFile, getAbsolutePath, startupCommandsExecuted, setStartupCommandsExecuted } = useFileSystem();
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorFile, setEditorFile] = useState({ path: '', content: '' });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { command: '' },
  });
  const commandValue = form.watch('command');

  const addHistory = useCallback((type: 'command' | 'output', content: React.ReactNode) => {
    setHistory(prev => [...prev, { id: prev.length, type, content }]);
  }, []);

  const clearHistory = () => setHistory([]);

  useEffect(() => {
    if (!startupCommandsExecuted) {
        addHistory('output', <div className="text-primary">Gerador Docs [Version 1.0.0]</div>);
        addHistory('output', <div>(c) Gerador Corporation. All rights reserved.</div>);
        addHistory('output', <div>&nbsp;</div>);
        
        const { content } = readFile('AUTOEXEC.BAT');
        if (content) {
            const lines = content.split('\n');
            lines.forEach(line => {
                if (line.toLowerCase().startsWith('echo ')) {
                    addHistory('output', line.substring(5));
                }
            });
        }
        setStartupCommandsExecuted(true);
    }
  }, [addHistory, readFile, startupCommandsExecuted, setStartupCommandsExecuted]);
  

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [history]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (commandValue.length > 0) {
        try {
          const result = await suggestDosCommands({ partialCommand: commandValue });
          setSuggestions(result.suggestions);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [commandValue]);

  const handleCommand = async (commandStr: string) => {
    const [command, ...args] = commandStr.trim().split(/\s+/);
    const lowerCommand = command.toLowerCase();

    switch (lowerCommand) {
      case 'cls':
        clearHistory();
        break;
      case 'dir':
        addHistory('output', <pre className="whitespace-pre-wrap">{listDirectory()}</pre>);
        break;
      case 'cd':
        const err = changeDirectory(args.join(' '));
        if (err) addHistory('output', <span className="text-destructive">{err}</span>);
        break;
      case 'type':
        if (args.length === 0) {
          addHistory('output', 'The syntax of the command is incorrect.');
        } else {
          const { content, error } = readFile(args[0]);
          if (error) addHistory('output', <span className="text-destructive">{error}</span>);
          else addHistory('output', <pre className="whitespace-pre-wrap">{content}</pre>);
        }
        break;
      case 'edit':
        if (args.length === 0) {
          addHistory('output', 'Please specify a file to edit.');
          break;
        }
        const filePath = getAbsolutePath(args[0]);
        const { content } = readFile(args[0]);
        setEditorFile({ path: filePath, content: content || '' });
        setIsEditorOpen(true);
        break;
      case 'help':
        const { content: helpContent } = readFile('C:\\DOCS\\README.TXT');
        addHistory('output', <pre className="whitespace-pre-wrap">{helpContent}</pre>);
        break;
      case 'date':
        addHistory('output', `Current date is: ${new Date().toLocaleDateString()}`);
        break;
      case 'time':
        addHistory('output', `Current time is: ${new Date().toLocaleTimeString()}`);
        break;
      case '':
        break;
      default:
        try {
          const result = await parseAndExecuteDosCommand({ dosCommand: commandStr });
          addHistory('output', <pre className="whitespace-pre-wrap">{result.output}</pre>);
        } catch (error) {
          console.error('Error executing command:', error);
          addHistory('output', <span className="text-destructive">Error executing command. See console for details.</span>);
        }
        break;
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isExecuting) return;
    setIsExecuting(true);
    addHistory('command', `${currentPath}>${data.command}`);
    await handleCommand(data.command);
    form.reset();
    setSuggestions([]);
    setIsExecuting(false);
  };
  
  const handleSaveEditor = (newContent: string) => {
    const error = writeFile(editorFile.path, newContent);
    if (error) {
      toast({ title: 'Error saving file', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'File saved', description: `Saved ${editorFile.path}` });
      addHistory('output', `Saved ${editorFile.path}`);
    }
    setIsEditorOpen(false);
  };
  
  const applySuggestion = (suggestion: string) => {
    form.setValue('command', suggestion + ' ');
    setSuggestions([]);
    inputRef.current?.focus();
  }

  return (
    <Card className="w-full max-w-4xl h-[70vh] flex flex-col shadow-2xl bg-background/80 backdrop-blur-sm border-primary/20">
      <CardHeader className="flex-row items-center justify-between p-4 border-b border-primary/20">
        <CardTitle className="flex items-center gap-2 text-primary">
          <TerminalIcon size={20} />
          Gerador Docs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} onClick={() => inputRef.current?.focus()}>
          <div className="flex flex-col gap-2">
            {history.map(item => (
              <div key={item.id} className="font-mono text-sm leading-6 animate-fade-in">
                {item.content}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t border-primary/20">
          {suggestions.length > 0 && (
            <div className="flex items-center gap-2 px-2 pb-2 text-xs text-muted-foreground">
              Suggestions:
              {suggestions.slice(0, 5).map(s => (
                <Button key={s} size="sm" variant="ghost" className="h-6 px-2 text-accent" onClick={() => applySuggestion(s)}>{s}</Button>
              ))}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
              <label htmlFor="command-input" className="font-mono text-sm text-primary">{currentPath}&gt;</label>
              <FormField
                control={form.control}
                name="command"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        ref={inputRef}
                        id="command-input"
                        autoComplete="off"
                        className="w-full p-0 bg-transparent border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm"
                        disabled={isExecuting}
                        onKeyDown={(e) => {
                            if (e.key === 'Tab' && suggestions.length > 0) {
                                e.preventDefault();
                                applySuggestion(suggestions[0]);
                            }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </CardContent>
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-slate-100 dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">EDIT: {editorFile.path}</DialogTitle>
          </DialogHeader>
          <Textarea
            className="flex-1 font-mono text-base bg-white dark:bg-black text-gray-900 dark:text-gray-100 resize-none"
            value={editorFile.content}
            onChange={(e) => setEditorFile(prev => ({ ...prev, content: e.target.value }))}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button onClick={() => handleSaveEditor(editorFile.content)}>Save & Exit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
