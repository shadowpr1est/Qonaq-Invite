import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { useTranslation } from 'react-i18next';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      setSelectedHour(hours);
      setSelectedMinute(minutes);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleTimeSelect = (hour: number, minute: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedHour(hour);
    setSelectedMinute(minute);
    onChange(formatTime(hour, minute));
    setIsOpen(false);
  };

  const handleQuickTime = (time: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const [hours, minutes] = time.split(':').map(Number);
    handleTimeSelect(hours, minutes);
  };

  const quickTimes = useMemo(() => [
    { label: t('time.morning'), time: '09:00' },
    { label: t('time.noon'), time: '12:00' },
    { label: t('time.afternoon'), time: '15:00' },
    { label: t('time.evening'), time: '18:00' },
    { label: t('time.night'), time: '21:00' },
  ], [t, i18n.language]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className="w-full p-4 border-2 rounded-xl bg-background/50 backdrop-blur-sm text-lg transition-all cursor-pointer hover:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value ? formatDisplayTime(value) : placeholder || t('time.select_time')}
          </span>
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4 min-w-[280px]">
          {/* Quick time buttons */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('time.quick_select')}</h4>
            <div className="grid grid-cols-5 gap-2">
                             {quickTimes.map(({ label, time }) => (
                 <Button
                   key={time}
                   variant="outline"
                   size="sm"
                   onClick={(e) => handleQuickTime(time, e)}
                   className="text-xs py-1 px-2"
                 >
                   {label}
                 </Button>
               ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('time.custom_time')}</h4>
            
            <div className="flex items-center justify-center gap-4">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-gray-500 mb-2">{t('time.hours')}</div>
                <div className="relative">
                  <div className="h-32 overflow-y-auto scrollbar-hide border border-gray-200 rounded-lg bg-gray-50">
                                         {hours.map((hour) => (
                       <button
                         key={hour}
                         onClick={(e) => handleTimeSelect(hour, selectedMinute, e)}
                         className={`
                           w-12 h-8 flex items-center justify-center text-sm font-medium transition-all
                           ${selectedHour === hour
                             ? 'bg-indigo-500 text-white'
                             : 'text-gray-700 hover:bg-gray-200'
                           }
                         `}
                       >
                         {hour.toString().padStart(2, '0')}
                       </button>
                     ))}
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Separator */}
              <div className="text-2xl font-bold text-gray-400">:</div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-gray-500 mb-2">{t('time.minutes')}</div>
                <div className="relative">
                  <div className="h-32 overflow-y-auto scrollbar-hide border border-gray-200 rounded-lg bg-gray-50">
                                         {minutes.map((minute) => (
                       <button
                         key={minute}
                         onClick={(e) => handleTimeSelect(selectedHour, minute, e)}
                         className={`
                           w-12 h-8 flex items-center justify-center text-sm font-medium transition-all
                           ${selectedMinute === minute
                             ? 'bg-indigo-500 text-white'
                             : 'text-gray-700 hover:bg-gray-200'
                           }
                         `}
                       >
                         {minute.toString().padStart(2, '0')}
                       </button>
                     ))}
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Current selection display */}
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatTime(selectedHour, selectedMinute)}
              </div>
              <div className="text-sm text-gray-500">
                {selectedHour < 12 ? t('time.am') : t('time.pm')} ({selectedHour}:{selectedMinute.toString().padStart(2, '0')})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 