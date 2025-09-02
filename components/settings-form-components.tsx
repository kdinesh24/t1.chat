import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';

interface TraitInputProps {
  value: string[];
  onChange: (traits: string[]) => void;
  suggestions: string[];
}

export function TraitInput({ value, onChange, suggestions }: TraitInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTrait = useCallback(
    (trait: string) => {
      const trimmedTrait = trait.trim();
      if (trimmedTrait && !value.includes(trimmedTrait) && value.length < 50) {
        onChange([...value, trimmedTrait]);
      }
    },
    [value, onChange],
  );

  const removeTrait = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        addTrait(inputValue);
        setInputValue('');
      }
    },
    [inputValue, addTrait],
  );

  return (
    <div>
      <div className="relative mb-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a trait and press Enter or Tab..."
          className="bg-[#1a1419] border-[#322028] text-white placeholder:text-zinc-500 pr-12"
          maxLength={100}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
          {value.length}/50
        </span>
      </div>

      {/* Current traits */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {value.map((trait, index) => (
            <button
              key={`${trait}-${index}`}
              onClick={() => removeTrait(index)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm transition-colors"
            >
              {trait} ×
            </button>
          ))}
        </div>
      )}

      {/* Suggested traits */}
      <div className="flex flex-wrap gap-2">
        {suggestions
          .filter((trait) => !value.includes(trait))
          .map((trait) => (
            <button
              key={trait}
              onClick={() => addTrait(trait)}
              className="px-3 py-1 bg-[#322028] hover:bg-[#4a2f38] text-zinc-300 rounded-full text-sm transition-colors"
            >
              {trait} +
            </button>
          ))}
      </div>
    </div>
  );
}

interface SettingsFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsField({
  label,
  description,
  children,
}: SettingsFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-white font-medium">{label}</label>
      {description && <p className="text-sm text-zinc-400">{description}</p>}
      {children}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-12 h-6 rounded-full relative transition-colors ${
        checked ? 'bg-blue-600' : 'bg-[#322028]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div
        className={`size-5 bg-white rounded-full absolute top-0.5 transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

interface CharacterCountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  className?: string;
}

export function CharacterCountInput({
  value,
  onChange,
  placeholder,
  maxLength,
  className = '',
}: CharacterCountInputProps) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-[#1a1419] border-[#322028] text-white placeholder:text-zinc-500 pr-12 ${className}`}
        maxLength={maxLength}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

interface CharacterCountTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  className?: string;
}

export function CharacterCountTextarea({
  value,
  onChange,
  placeholder,
  maxLength,
  className = '',
}: CharacterCountTextareaProps) {
  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-[#1a1419] border-[#322028] text-white placeholder:text-zinc-500 min-h-[120px] resize-none ${className}`}
        maxLength={maxLength}
      />
      <span className="absolute right-3 bottom-3 text-xs text-zinc-500">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}
