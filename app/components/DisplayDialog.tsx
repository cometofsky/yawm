'use client';

import { useLayoutEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DisplayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function DisplayDialog({ isOpen, onClose, title, children, className = '' }: DisplayDialogProps) {
  const titleId = useId();
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useLayoutEffect(() => {
    if (!isOpen || !panel.current || !overlay.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const hidden: { node: Element; value: string | null }[] = [];
    // aria-modal is not supported by every target screen reader; hide the background too.
    let branch: Element = overlay.current;
    while (branch.parentElement) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (sibling !== branch && sibling.tagName !== 'SCRIPT' && sibling.tagName !== 'STYLE') {
          hidden.push({ node: sibling, value: sibling.getAttribute('aria-hidden') });
          sibling.setAttribute('aria-hidden', 'true');
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    panel.current.focus();
    const focusables = () => Array.from(panel.current!.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((node) => node.getClientRects().length > 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault();
        close.current();
      } else if (event.key === 'Tab') {
        const items = focusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) {
          event.preventDefault();
          panel.current?.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (panel.current && !panel.current.contains(event.target as Node)) panel.current.focus();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', containFocus);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', containFocus);
      document.body.style.overflow = oldOverflow;
      for (const { node, value } of hidden) {
        if (value === null) node.removeAttribute('aria-hidden');
        else node.setAttribute('aria-hidden', value);
      }
      if (previous && document.documentElement.contains(previous)) previous.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div ref={overlay} className="ui-dialog-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={`ui-dialog ${className}`}>
        <header className="ui-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="ui-icon-button" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}><X size={20} aria-hidden="true" /></button>
        </header>
        {children}
      </div>
    </div>
  );
}
