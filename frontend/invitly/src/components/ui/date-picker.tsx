import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { useTranslation } from 'react-i18next';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  onBlur?: () => void;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  onBlur,
  error = false,
  placeholder,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? (() => {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    })() : null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => [
    t('calendar.january'), t('calendar.february'), t('calendar.march'),
    t('calendar.april'), t('calendar.may'), t('calendar.june'),
    t('calendar.july'), t('calendar.august'), t('calendar.september'),
    t('calendar.october'), t('calendar.november'), t('calendar.december')
  ], [t, i18n.language]);

  const weekDays = useMemo(() => [
    t('calendar.mon'), t('calendar.tue'), t('calendar.wed'),
    t('calendar.thu'), t('calendar.fri'), t('calendar.sat'), t('calendar.sun')
  ], [t, i18n.language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    // Adjust for Monday as first day of week
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    return { daysInMonth, adjustedFirstDay };
  };

  const generateCalendarDays = (date: Date) => {
    const { daysInMonth, adjustedFirstDay } = getDaysInMonth(date);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }
    
    return days;
  };

  const handleDateSelect = (date: Date, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedDate(date);
    // Исправляем проблему с часовыми поясами
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Используем наши переводы вместо встроенного toLocaleDateString
    const monthName = months[date.getMonth()];
    const dayNum = date.getDate();
    const yearNum = date.getFullYear();
    
    return `${monthName} ${dayNum}, ${yearNum}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`w-full p-4 border-2 rounded-xl bg-background/50 backdrop-blur-sm text-lg transition-all cursor-pointer hover:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 ${
          error ? "border-destructive" : "border-border"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value ? formatDisplayDate(value) : placeholder || t('calendar.select_date')}
          </span>
          <Calendar className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4 min-w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
                         {generateCalendarDays(currentDate).map((date, index) => (
               <button
                 key={index}
                 onClick={(e) => date && !isPast(date) && handleDateSelect(date, e)}
                 disabled={!date || isPast(date)}
                 className={`
                   w-10 h-10 rounded-lg text-sm font-medium transition-all
                   ${!date
                     ? 'invisible'
                     : isPast(date)
                     ? 'text-gray-300 cursor-not-allowed'
                     : isSelected(date)
                     ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                     : isToday(date)
                     ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                     : 'text-gray-700 hover:bg-gray-100'
                   }
                 `}
               >
                 {date?.getDate()}
               </button>
             ))}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                         <Button
               variant="outline"
               size="sm"
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 const today = new Date();
                 handleDateSelect(today);
               }}
               className="flex-1 text-xs"
             >
               {t('calendar.today')}
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 const tomorrow = new Date();
                 tomorrow.setDate(tomorrow.getDate() + 1);
                 handleDateSelect(tomorrow);
               }}
               className="flex-1 text-xs"
             >
               {t('calendar.tomorrow')}
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 