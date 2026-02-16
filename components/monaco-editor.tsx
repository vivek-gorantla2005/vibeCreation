import Editor from '@monaco-editor/react';
import { useState, useRef, useEffect } from 'react';
import CustomCursor from './CustomCursor';

export default function MonacoEditor({ value, language = "typescript", onChange }: { value: string, language?: string, onChange?: (value: string) => void }) {
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleEditorChange = (newValue: string | undefined) => {
        setIsTyping(true);
        if (onChange) onChange(newValue || "");
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            // Optional: You could trigger an actual AI call here
            console.log("AI finished processing typing...");
        }, 1500);
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    return (
        <div className="relative h-full w-full group">
            <CustomCursor isTyping={isTyping} />
            <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace",
                    lineHeight: 22,
                    padding: { top: 20, bottom: 20 },
                    automaticLayout: true,
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    renderLineHighlight: "all",
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        useShadows: false,
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                    },
                    // Disable validation and clutter
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    fixedOverflowWidgets: true,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    renderWhitespace: "none",
                    scrollBeyondLastLine: false,
                    // Deeply disable validation
                    quickSuggestions: false,
                    parameterHints: { enabled: false },
                    suggestOnTriggerCharacters: false,
                    acceptSuggestionOnEnter: "off",
                    tabCompletion: "off",
                    snippetSuggestions: "none",
                    wordBasedSuggestions: "off",
                }}
                onMount={(editor, monaco) => {
                    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                        noSemanticValidation: true,
                        noSyntaxValidation: true,
                        noSuggestionDiagnostics: true,
                    });
                    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                        noSemanticValidation: true,
                        noSyntaxValidation: true,
                    });
                }}
                value={value}
                onChange={handleEditorChange}
            />
        </div>
    );
}
