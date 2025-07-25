import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Call onComplete when all 6 digits are entered
    if (value.length === 6 && onComplete) {
      onComplete(value);
    }
  }, [value, onComplete]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow numeric input
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) {
      // Handle paste scenario
      const pastedCode = numericValue.slice(0, 6);
      onChange(pastedCode);
      
      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(pastedCode.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
        setFocusedIndex(nextIndex);
      }
      return;
    }

    // Single character input
    const newValue = value.split('');
    newValue[index] = numericValue;
    const updatedValue = newValue.join('').slice(0, 6);
    
    onChange(updatedValue);

    // Auto-focus next input
    if (numericValue && index < 5) {
      const nextIndex = index + 1;
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
        setFocusedIndex(nextIndex);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newValue = value.split('');
      
      if (newValue[index]) {
        // Clear current input
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        const prevIndex = index - 1;
        newValue[prevIndex] = '';
        onChange(newValue.join(''));
        
        if (inputRefs.current[prevIndex]) {
          inputRefs.current[prevIndex].focus();
          setFocusedIndex(prevIndex);
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevIndex = index - 1;
      if (inputRefs.current[prevIndex]) {
        inputRefs.current[prevIndex].focus();
        setFocusedIndex(prevIndex);
      }
    } else if (e.key === 'ArrowRight' && index < 5) {
      const nextIndex = index + 1;
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
        setFocusedIndex(nextIndex);
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    
    if (pastedData) {
      onChange(pastedData);
      
      // Focus the last input or next empty one
      const nextIndex = Math.min(pastedData.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
        setFocusedIndex(nextIndex);
      }
    }
  };

  return (
    <div className={cn("flex gap-3 justify-center", className)}>
      {Array.from({ length: 6 }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-xl font-bold border-2 transition-all duration-200",
            "focus:ring-2 focus:ring-offset-2",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : focusedIndex === index
              ? "border-blue-500 focus:border-blue-500 focus:ring-blue-500"
              : value[index]
              ? "border-green-500 bg-green-50"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}; 