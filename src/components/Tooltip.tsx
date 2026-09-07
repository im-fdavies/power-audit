import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  label: string;
  children: React.ReactNode;
  /** Set when the trigger is already interactive and should not take a second tab stop. */
  inert?: boolean;
  /**
   * Wraps a control rather than a run of text: lays out as a block and drops
   * the dotted underline, which has nothing to underline.
   */
  wrapsControl?: boolean;
}

const MARGIN = 8;

/**
 * The bubble is portalled to the body rather than positioned inside the
 * trigger, because the device table sits in an overflow-x-auto container that
 * would otherwise clip it.
 */
export function Tooltip({ label, children, inert = false, wrapsControl = false }: Props) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const clampedRef = useRef(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const id = useId();
  const isOpen = position !== null;

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    clampedRef.current = false;
    setPosition({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
  }, []);

  const hide = useCallback(() => setPosition(null), []);

  // Keep the bubble on screen once it has rendered and its width is known.
  // This corrects at most once per placement: re-measuring after the correction
  // would find the same overflow again whenever the bubble cannot fit, and spin.
  useEffect(() => {
    if (!position || clampedRef.current || !bubbleRef.current) return;
    clampedRef.current = true;
    const rect = bubbleRef.current.getBoundingClientRect();
    const overflowRight = rect.right - (window.innerWidth - MARGIN);
    const overflowLeft = MARGIN - rect.left;
    const shift = overflowRight > 0 ? -overflowRight : overflowLeft > 0 ? overflowLeft : 0;
    if (shift !== 0) setPosition(p => (p ? { ...p, left: p.left + shift } : p));
  }, [position]);

  // Follow the trigger rather than dismissing. Moving focus to a trigger inside
  // the scrollable device table scrolls it into view, so dismissing on scroll
  // would close the tooltip the instant a keyboard user reached it.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') hide();
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [isOpen, hide, place]);

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={inert ? undefined : 0}
        aria-describedby={isOpen ? id : undefined}
        onMouseEnter={place}
        onMouseLeave={hide}
        onFocus={place}
        onBlur={hide}
        className={wrapsControl ? 'tooltip-shell' : 'tooltip-trigger'}
      >
        {children}
      </span>

      {position &&
        createPortal(
          <span
            ref={bubbleRef}
            role="tooltip"
            id={id}
            className="tooltip-bubble"
            style={{ top: position.top, left: position.left }}
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  );
}
