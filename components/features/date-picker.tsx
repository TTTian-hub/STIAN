'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = '选择日期',
  className,
  disabled = false,
  fromYear = 1900,
  toYear = 2100,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(date || new Date());
  const [isOpen, setIsOpen] = useState(false);

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelect(newDate);
    setIsOpen(false);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            'bg-card border-border hover:bg-muted hover:border-primary/30',
            'text-foreground',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {date ? (
            format(date, 'yyyy年MM月dd日', { locale: zhCN })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-4 bg-card border-border"
        align="start"
      >
        {/* Year and Month Selectors */}
        <div className="flex items-center gap-2 mb-4">
          <Select
            value={year.toString()}
            onValueChange={(value) => {
              setCurrentMonth(new Date(parseInt(value), month, 1));
            }}
          >
            <SelectTrigger className="w-[100px] bg-muted border-border text-foreground">
              <SelectValue placeholder="年份" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border max-h-[200px]">
              {years.map((y) => (
                <SelectItem
                  key={y}
                  value={y.toString()}
                  className="text-foreground hover:bg-muted"
                >
                  {y}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={month.toString()}
            onValueChange={(value) => {
              setCurrentMonth(new Date(year, parseInt(value), 1));
            }}
          >
            <SelectTrigger className="w-[90px] bg-muted border-border text-foreground">
              <SelectValue placeholder="月份" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {months.map((m) => (
                <SelectItem
                  key={m}
                  value={m.toString()}
                  className="text-foreground hover:bg-muted"
                >
                  {m + 1}月
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="w-[280px]">
          {/* Week Headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isSelected =
                date &&
                date.getDate() === day &&
                date.getMonth() === month &&
                date.getFullYear() === year;
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    'h-9 w-9 rounded-md text-sm font-medium transition-colors',
                    'hover:bg-muted',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    isToday && !isSelected && 'bg-muted text-primary',
                    !isSelected && !isToday && 'text-foreground'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
