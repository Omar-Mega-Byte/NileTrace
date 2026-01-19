import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

// Dropdown / Select with custom styling
interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  label,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span
          className={cn(
            'flex items-center gap-2',
            selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400'
          )}
        >
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={cn(
            'h-5 w-5 text-slate-400 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg animate-slide-up max-h-64 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  option.value === value
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
              >
                {option.icon && (
                  <span className="flex-shrink-0">{option.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{option.label}</p>
                  {option.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {option.description}
                    </p>
                  )}
                </div>
                {option.value === value && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Checkbox
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  return (
    <label
      className={cn(
        'flex items-start gap-3 cursor-pointer',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <div className="flex-shrink-0 pt-0.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'h-5 w-5 rounded flex items-center justify-center border-2 transition-all',
            checked
              ? 'bg-primary-500 border-primary-500 text-white'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800',
            !disabled && 'hover:border-primary-400'
          )}
        >
          {checked && <Check className="h-3 w-3" />}
        </button>
      </div>
      {(label || description) && (
        <div>
          {label && (
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {label}
            </p>
          )}
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  );
};

// Toggle Switch
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
  className,
}) => {
  const sizeClasses = {
    sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { track: 'h-7 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7' },
  };

  const sizes = sizeClasses[size];

  return (
    <label
      className={cn(
        'flex items-center justify-between gap-4 cursor-pointer',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      {(label || description) && (
        <div>
          {label && (
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {label}
            </p>
          )}
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
          sizes.track,
          checked
            ? 'bg-primary-500'
            : 'bg-slate-200 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out',
            sizes.thumb,
            checked ? sizes.translate : 'translate-x-0.5'
          )}
          style={{ marginTop: '1px' }}
        />
      </button>
    </label>
  );
};

// Radio Group
interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  label,
  orientation = 'vertical',
  className,
}) => {
  return (
    <div className={className}>
      {label && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {label}
        </p>
      )}
      <div
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-wrap'
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <div className="flex-shrink-0 pt-0.5">
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                  option.value === value
                    ? 'border-primary-500'
                    : 'border-slate-300 dark:border-slate-600 group-hover:border-primary-400'
                )}
              >
                {option.value === value && (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                )}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {option.label}
              </p>
              {option.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {option.description}
                </p>
              )}
            </div>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
          </label>
        ))}
      </div>
    </div>
  );
};
