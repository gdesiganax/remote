import { useEffect, useRef } from 'react';
import { SECTIONS } from './site';

export interface NavigateOptions {
  /** 'end' lands at the bottom of a section taller than the viewport (used when moving up). */
  align?: 'start' | 'end';
  /** Move keyboard focus to the section (default true). */
  focus?: boolean;
}

interface Options {
  enabled: boolean;
  transitionMs: number;
  isNavigating: () => boolean;
  navigate: (id: string, opts?: NavigateOptions) => void;
}

const EDGE = 4; // px tolerance for "at the edge of a section"
const SWIPE_MIN = 50; // px a touch swipe must travel past the edge
const MOMENTUM_GAP = 250; // ms of wheel silence that marks a new gesture

/** Index of the section the reader is in: the last one whose top has passed 40% of the viewport. */
export function currentSectionIndex(): number {
  const mark = window.innerHeight * 0.4;
  let index = 0;
  SECTIONS.forEach((s, i) => {
    const el = document.getElementById(s.id);
    if (el && el.getBoundingClientRect().top <= mark) index = i;
  });
  return index;
}

function sectionRect(index: number): DOMRect | null {
  return document.getElementById(SECTIONS[index].id)?.getBoundingClientRect() ?? null;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
}

/**
 * Turns scrolling past the edge of a section (wheel, touch swipe or keyboard)
 * into the same animated section transition used by the navigation.
 * Inside a section taller than the screen, scrolling stays native until its edge.
 */
export function useSectionScroll({ enabled, transitionMs, isNavigating, navigate }: Options) {
  const opts = useRef({ transitionMs, isNavigating, navigate });
  useEffect(() => {
    opts.current = { transitionMs, isNavigating, navigate };
  });

  useEffect(() => {
    if (!enabled) return;

    let lockUntil = 0;
    const menuOpen = () => document.body.style.overflow === 'hidden';

    /** Try to move one section in `dir`. Returns true if a transition started. */
    const go = (dir: 1 | -1): boolean => {
      const target = currentSectionIndex() + dir;
      if (target < 0 || target >= SECTIONS.length) return false;
      lockUntil = Date.now() + opts.current.transitionMs + 400;
      opts.current.navigate(SECTIONS[target].id, { align: dir < 0 ? 'end' : 'start', focus: false });
      return true;
    };

    /** Distance (px) left to scroll inside the current section in `dir`. */
    const remaining = (dir: 1 | -1): { left: number; index: number } | null => {
      const index = currentSectionIndex();
      const rect = sectionRect(index);
      if (!rect) return null;
      return { index, left: dir > 0 ? rect.bottom - window.innerHeight : -rect.top };
    };

    const canLeave = (dir: 1 | -1, index: number) => (dir > 0 ? index < SECTIONS.length - 1 : index > 0);

    // ───── wheel / trackpad ─────
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || menuOpen()) return;
      if (e.target instanceof Element && e.target.closest('textarea')) return;
      const now = Date.now();

      if (opts.current.isNavigating()) {
        e.preventDefault();
        lockUntil = Math.max(lockUntil, now + MOMENTUM_GAP);
        return;
      }

      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const dy = e.deltaY * scale;
      if (Math.abs(dy) < 1 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const dir: 1 | -1 = dy > 0 ? 1 : -1;
      const r = remaining(dir);
      if (!r || !canLeave(dir, r.index)) return; // first/last section: native scroll

      if (r.left > EDGE) {
        // Still inside the section. If this step would cross the edge, stop exactly at it.
        if (r.left < Math.abs(dy)) {
          e.preventDefault();
          window.scrollBy({ top: dir * r.left, behavior: 'instant' });
        }
        return;
      }

      // At the edge: transition, unless this is trailing momentum from the last gesture
      e.preventDefault();
      if (now < lockUntil) {
        lockUntil = now + MOMENTUM_GAP;
        return;
      }
      go(dir);
    };

    // ───── touch ─────
    let startY = 0;
    let pending: 1 | -1 | 0 = 0;
    let travel = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      pending = 0;
      travel = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (menuOpen() || e.touches.length > 1) return;
      if (opts.current.isNavigating()) {
        e.preventDefault();
        return;
      }
      if (e.target instanceof Element && e.target.closest('textarea')) return;
      const dy = startY - e.touches[0].clientY; // > 0 means scrolling down
      if (Math.abs(dy) < 2) return;
      const dir: 1 | -1 = dy > 0 ? 1 : -1;
      const r = remaining(dir);
      if (!r || !canLeave(dir, r.index)) return;
      if (r.left <= EDGE) {
        e.preventDefault();
        if (pending !== dir) {
          pending = dir;
          startY = e.touches[0].clientY; // measure the swipe from the edge
        }
        travel = Math.abs(startY - e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      if (pending && travel >= SWIPE_MIN && Date.now() >= lockUntil && !opts.current.isNavigating()) go(pending);
      pending = 0;
      travel = 0;
    };

    // ───── keyboard ─────
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || menuOpen() || isTypingTarget(e.target)) return;
      const space = e.key === ' ';
      if (space && e.target instanceof HTMLElement && e.target.closest('button, a, summary, [role="button"]')) return;

      let dir: 1 | -1 | 0 = 0;
      let page = false;
      if (e.key === 'PageDown' || (space && !e.shiftKey)) [dir, page] = [1, true];
      else if (e.key === 'PageUp' || (space && e.shiftKey)) [dir, page] = [-1, true];
      else if (e.key === 'ArrowDown') dir = 1;
      else if (e.key === 'ArrowUp') dir = -1;
      if (!dir) return;

      if (opts.current.isNavigating()) {
        e.preventDefault();
        return;
      }
      const r = remaining(dir);
      if (!r || !canLeave(dir, r.index)) return;

      if (r.left > EDGE) {
        // Would this key press jump past the edge? Stop at the edge instead.
        const step = page ? window.innerHeight * 0.85 : 60;
        if (r.left < step) {
          e.preventDefault();
          window.scrollBy({ top: dir * r.left, behavior: 'smooth' });
        }
        return;
      }
      e.preventDefault();
      go(dir);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled]);
}
