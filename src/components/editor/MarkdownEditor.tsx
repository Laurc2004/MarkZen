import React, { useEffect, useRef, useCallback } from 'react';
import { EditorView, lineNumbers } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap } from '@codemirror/search';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import type { EditorProps } from '../../types';

// Simplified Typora-style shortcuts
const typoraKeymap = keymap.of([
  {
    key: 'Ctrl-b',
    run: (view) => {
      const selection = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(selection.from, selection.to);
      const replacement = selectedText ? `**${selectedText}**` : '**Bold**';
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: replacement },
        selection: selectedText 
          ? { anchor: selection.from + replacement.length } 
          : { anchor: selection.from + 2, head: selection.from + 6 }
      });
      return true;
    }
  },
  {
    key: 'Ctrl-i',
    run: (view) => {
      const selection = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(selection.from, selection.to);
      const replacement = selectedText ? `*${selectedText}*` : '*Italic*';
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: replacement },
        selection: selectedText 
          ? { anchor: selection.from + replacement.length } 
          : { anchor: selection.from + 1, head: selection.from + 7 }
      });
      return true;
    }
  },
]);

// Create clean Notion-style theme
const createNotionTheme = (): Extension[] => {
  const theme = EditorView.theme({
    '&': {
      fontSize: '16px',
      fontFamily: 'var(--font-sans)',
      lineHeight: '1.6',
      height: '100%',
    },
    '.cm-content': {
      padding: '16px',
      minHeight: '100%',
      caretColor: 'var(--text-primary)',
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-primary)',
    },
    '.cm-focused': {
      outline: 'none',
    },
    '.cm-editor': {
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
    },
    '.cm-scroller': {
      overflow: 'auto !important',
      fontFamily: 'inherit',
    },
    '.cm-line': {
      padding: '2px 0',
      lineHeight: '1.7',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'var(--accent-blue) !important',
      opacity: '0.3 !important',
    },
    '.cm-focused .cm-selectionBackground': {
      backgroundColor: 'var(--accent-blue) !important',
      opacity: '0.4 !important',
    },
    // 显示行号
    '.cm-lineNumbers': {
      color: 'var(--text-tertiary)',
      backgroundColor: 'transparent',
      borderRight: '1px solid var(--border-light)',
      paddingRight: '12px',
      minWidth: '3em',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--bg-secondary)',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--bg-tertiary)',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--bg-secondary)',
    },
    '.cm-cursor': {
      borderLeftColor: 'var(--text-primary)',
      borderLeftWidth: '2px',
    },
    // Markdown语法高亮
    '.cm-line .cm-header1': {
      fontSize: '1.8em',
      fontWeight: '700',
      color: 'var(--text-primary)',
      lineHeight: '1.2',
    },
    '.cm-line .cm-header2': {
      fontSize: '1.5em',
      fontWeight: '600',
      color: 'var(--text-primary)',
      lineHeight: '1.3',
    },
    '.cm-line .cm-header3': {
      fontSize: '1.25em',
      fontWeight: '600',
      color: 'var(--text-primary)',
      lineHeight: '1.4',
    },
    '.cm-line .cm-strong': {
      fontWeight: '700',
      color: 'var(--text-primary)',
    },
    '.cm-line .cm-emphasis': {
      fontStyle: 'italic',
      color: 'var(--text-secondary)',
    },
    '.cm-line .cm-link': {
      color: 'var(--accent-blue)',
      textDecoration: 'underline',
    },
    '.cm-line .cm-code': {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      padding: '2px 6px',
      borderRadius: '3px',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.9em',
    },
    '.cm-line .cm-quote': {
      color: 'var(--text-secondary)',
      fontStyle: 'italic',
      borderLeft: '3px solid var(--border-medium)',
      paddingLeft: '12px',
      marginLeft: '4px',
    },
    '.cm-line .cm-math': {
      color: 'var(--accent-blue)',
      backgroundColor: 'var(--bg-tertiary)',
      padding: '2px 4px',
      borderRadius: '3px',
    },
  });

  return [theme];
};

export const MarkdownEditor: React.FC<EditorProps> = ({
  content,
  onChange,
  config,
  theme,
  onCursorChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const handleChange = useCallback((value: string) => {
    onChange(value);
  }, [onChange]);

  const handleCursorChange = useCallback((line: number, column: number) => {
    onCursorChange?.({ line, column });
  }, [onCursorChange]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const extensions: Extension[] = [
      basicSetup,
      lineNumbers(),
      markdown({ codeLanguages: languages }),
      ...createNotionTheme(),
      keymap.of([
        ...defaultKeymap,
        ...searchKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
      ]),
      typoraKeymap,
      autocompletion(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          handleChange(update.state.doc.toString());
        }
        
        if (update.selectionSet) {
          const cursor = update.state.selection.main.head;
          const line = update.state.doc.lineAt(cursor);
          handleCursorChange(line.number - 1, cursor - line.from);
        }
      }),
      EditorView.lineWrapping,
    ];

    if (config.typewriterMode) {
      extensions.push(EditorView.theme({
        '.cm-scroller': {
          paddingTop: '50vh',
          paddingBottom: '50vh',
        },
      }));
    }

    const state = EditorState.create({
      doc: content,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    view.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [theme, config.typewriterMode, handleChange, handleCursorChange]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== content) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: content,
        },
      });
    }
  }, [content]);

  return (
    <div 
      ref={editorRef} 
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    />
  );
};

export default MarkdownEditor;