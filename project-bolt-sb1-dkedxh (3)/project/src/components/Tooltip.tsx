import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  className?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export default function Tooltip({ content, className = '', position = 'right' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && iconRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const iconRect = iconRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 20;

      // Find the closest scrollable parent
      let element = iconRef.current.parentElement;
      let scrollContainer = null;
      while (element) {
        const { overflow, overflowY } = window.getComputedStyle(element);
        if (overflow === 'auto' || overflow === 'scroll' || 
            overflowY === 'auto' || overflowY === 'scroll') {
          scrollContainer = element;
          break;
        }
        element = element.parentElement;
      }

      // Get container boundaries if we found a scrollable container
      const containerRect = scrollContainer ? 
        scrollContainer.getBoundingClientRect() : 
        { top: 0, right: viewportWidth, bottom: viewportHeight, left: 0 };

      let newPosition = position;

      // Check if tooltip would overflow in current position
      if (position === 'right' && iconRect.right + tooltipRect.width + padding > containerRect.right) {
        newPosition = 'left';
      } else if (position === 'left' && iconRect.left - tooltipRect.width - padding < containerRect.left) {
        newPosition = 'right';
      } else if (position === 'bottom' && iconRect.bottom + tooltipRect.height + padding > containerRect.bottom) {
        newPosition = 'top';
      } else if (position === 'top' && iconRect.top - tooltipRect.height - padding < containerRect.top) {
        newPosition = 'bottom';
      }

      setTooltipPosition(newPosition);
    }
  }, [isVisible, position]);

  const getTooltipStyles = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-full right-0 mb-2';
      case 'left':
        return 'right-full top-0 mr-2';
      case 'bottom':
        return 'top-full right-0 mt-2';
      default: // right
        return 'left-full top-0 ml-2';
    }
  };

  const getArrowStyles = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-[-4px] right-3 rotate-[225deg]';
      case 'left':
        return 'right-[-4px] top-3 rotate-[135deg]';
      case 'bottom':
        return 'top-[-4px] right-3 rotate-45';
      default: // right
        return 'left-[-4px] top-3 rotate-[-45deg]';
    }
  };

  return (
    <div className="relative inline-flex items-center" ref={iconRef}>
      <HelpCircle
        className={`h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help ml-1 ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-64 px-3 py-2 text-sm text-left text-white bg-gray-800 rounded-lg shadow-lg whitespace-normal ${getTooltipStyles()}`}
          style={{ minWidth: '16rem', maxWidth: '20rem' }}
        >
          <div className={`absolute w-2 h-2 bg-gray-800 transform ${getArrowStyles()}`} />
          <div className="break-words">{content}</div>
        </div>
      )}
    </div>
  );
}