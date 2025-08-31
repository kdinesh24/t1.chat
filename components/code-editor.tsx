'use client';

import { EditorView } from '@codemirror/view';
import { EditorState, Transaction, } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import React, { memo, useEffect, useRef } from 'react';
import type { Suggestion } from '@/lib/db/schema';

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Array<Suggestion>;
};

// Move scrollTheme outside component to prevent recreation
const scrollTheme = EditorView.theme({
  ".cm-scroller": {
    overflowX: "auto !important",
    overflowY: "auto !important"
  },
  ".cm-content": {
    minWidth: "max-content !important"
  },
  ".cm-editor": {
    overflowX: "auto !important"
  }
});

// Simple language detection based on content
const getLanguageExtension = (code: string) => {
  if (code.includes('import ') && (code.includes('def ') || code.includes('print('))) {
    return python();
  }
  if (code.includes('function ') || code.includes('const ') || code.includes('let ') || code.includes('=>')) {
    return javascript();
  }
  return python(); // Default to python
};

function PureCodeEditor({ content, onSaveContent, status }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const updateListenerRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const languageExtension = getLanguageExtension(content);
      
      // Create the update listener once
      updateListenerRef.current = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const transaction = update.transactions.find(
            (tr) => !tr.annotation(Transaction.remote),
          );

          if (transaction) {
            const newContent = update.state.doc.toString();
            onSaveContent(newContent, true);
          }
        }
      });
      
      const startState = EditorState.create({
        doc: content,
        extensions: [basicSetup, languageExtension, oneDark, scrollTheme, updateListenerRef.current],
      });

      editorRef.current = new EditorView({
        state: startState,
        parent: containerRef.current,
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, []);

  // Separate effect to handle content updates without recreating the entire state
  useEffect(() => {
    if (editorRef.current && content) {
      const currentContent = editorRef.current.state.doc.toString();

      if (status === 'streaming' || currentContent !== content) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
          annotations: [Transaction.remote.of(true)],
        });

        editorRef.current.dispatch(transaction);
      }
    }
  }, [content, status]);

  return (
    <div
      className="relative not-prose w-full pb-[calc(80dvh)] text-sm overflow-x-auto mb-6"
      ref={containerRef}
    />
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.suggestions !== nextProps.suggestions) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex)
    return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
  if (prevProps.status === 'streaming' && nextProps.status === 'streaming')
    return false;
  if (prevProps.content !== nextProps.content) return false;

  return true;
}

export const CodeEditor = memo(PureCodeEditor, areEqual);
