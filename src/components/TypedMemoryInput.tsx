import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface TypedMemoryInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  storageKey: string;
  type?: 'text' | 'email' | 'tel' | 'number';
  disabled?: boolean;
  min?: string;
  step?: string;
}

export const TypedMemoryInput: React.FC<TypedMemoryInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  storageKey,
  type = 'text',
  disabled = false,
  min,
  step,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load saved values from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`typedMemory_${storageKey}`);
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        if (Array.isArray(parsedSaved)) {
          setSuggestions(parsedSaved);
        }
      } catch (error) {
        console.error('Error parsing saved suggestions:', error);
      }
    }
  }, [storageKey]);

  // Save value to localStorage when input changes
  const saveToMemory = (inputValue: string) => {
    if (!inputValue.trim()) return;

    const saved = localStorage.getItem(`typedMemory_${storageKey}`);
    let existingSuggestions: string[] = [];
    
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        if (Array.isArray(parsedSaved)) {
          existingSuggestions = parsedSaved;
        }
      } catch (error) {
        console.error('Error parsing existing suggestions:', error);
      }
    }

    // Add new value if it doesn't exist
    if (!existingSuggestions.includes(inputValue.trim())) {
      const newSuggestions = [inputValue.trim(), ...existingSuggestions].slice(0, 10); // Keep only 10 most recent
      localStorage.setItem(`typedMemory_${storageKey}`, JSON.stringify(newSuggestions));
      setSuggestions(newSuggestions);
    }
  };

  // Filter suggestions based on current input
  const getFilteredSuggestions = () => {
    if (!value.trim()) return [];
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(value.toLowerCase()) && 
      suggestion !== value
    ).slice(0, 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
    
    const filtered = getFilteredSuggestions();
    setShowSuggestions(filtered.length > 0 && newValue.trim().length > 0);
    setSelectedIndex(-1);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Save to memory when user finishes typing
    if (e.target.value.trim()) {
      saveToMemory(e.target.value);
    }
    
    // Hide suggestions after a short delay to allow clicking on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const handleInputFocus = () => {
    const filtered = getFilteredSuggestions();
    setShowSuggestions(filtered.length > 0 && value.trim().length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const filtered = getFilteredSuggestions();
    
    if (!showSuggestions || filtered.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? filtered.length - 1 : prev - 1);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < filtered.length) {
          e.preventDefault();
          handleSuggestionClick(filtered[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const deleteSuggestion = (suggestionToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSuggestions = suggestions.filter(s => s !== suggestionToDelete);
    setSuggestions(newSuggestions);
    localStorage.setItem(`typedMemory_${storageKey}`, JSON.stringify(newSuggestions));
  };

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        min={min}
        step={step}
        autoComplete="off"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between group ${
                index === selectedIndex
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-foreground'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="flex-1 text-sm">{suggestion}</span>
              <button
                onClick={(e) => deleteSuggestion(suggestion, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                title="Delete suggestion"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
