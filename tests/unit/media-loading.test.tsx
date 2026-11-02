import { imageSourcePath } from '../fixtures/image-source';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { VideoModal } from '@/components/interactive/VideoModal';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import { pages } from '@/content/pages';

let intersect: (visible: boolean, ratio?: number) => void;
let changeMotion: (reduced: boolean) => void;

beforeEach(() => {
  intersect = () => {};
  changeMotion = () => {};
  const preference = {
    matches: false,
    addEventListener: (_: string, listener: () => void) => {
      changeMotion = reduced => { preference.matches = reduced; listener(); };
    },
    removeEventListener() {},
  };
  vi.stubGlobal('matchMedia', () => preference);
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) {
      intersect = (visible, ratio = visible ? 1 : 0) => callback([{ isIntersecting: visible, intersectionRatio: ratio } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  });
  // jsdom has no media decoder; actual playback/pause is covered in Chrome.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function player() {
  return render(<VideoModal src="/media/preview.mp4" poster="/media/poster.webp" locale="en" videoId="our-video" background />);
}

it('shows a lazy original poster without mounting an offscreen video source', () => {
  const { container } = player();
  expect(container.querySelector('video[src]')).toBeNull();
  expect(imageSourcePath(container.querySelector('img'))).toBe('/media/poster.webp');
  expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy');
});

it('mounts the background video on entry and retains its source after leaving', () => {
  const { container } = player();
  expect(container.querySelector('video[src]')).toBeNull();
  act(() => intersect(true));
  const video = container.querySelector('video')!;
  expect(video).toHaveAttribute('src', '/media/preview.mp4');
  expect(imageSourcePath(video, 'poster')).toBe('/media/poster.webp');
  expect(video.muted).toBe(true);
  act(() => intersect(false));
  expect(container.querySelector('video')).toBe(video);
});

it('keeps a partially visible preview static until half its area is in view', () => {
  const {container}=player();
  act(()=>intersect(true,.49));
  expect(container.querySelector('video[src]')).toBeNull();
  act(()=>intersect(true,.5));
  const video=container.querySelector('video')!;
  expect(video).toHaveAttribute('src','/media/preview.mp4');
  act(()=>intersect(true,.49));
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  expect(container.querySelector('video')).toBe(video);
});

it('keeps the static poster for reduced motion, including preference changes', () => {
  const { container } = player();
  act(() => changeMotion(true));
  act(() => intersect(true));
  expect(container.querySelector('video[src]')).toBeNull();
  act(() => changeMotion(false));
  expect(container.querySelector('video')).toHaveAttribute('src', '/media/preview.mp4');
});

it('keeps the original click-to-open player usable before background activation', () => {
  const { container } = player();
  fireEvent.click(screen.getByRole('button', { name: 'Play manufacturing video' }));
  expect(container.querySelector('iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/our-video?autoplay=1');
  expect(container.querySelector('video[src]')).toBeNull();
});

it('keeps the poster usable when motion preferences are unsupported', () => {
  vi.stubGlobal('matchMedia', undefined);
  const { container } = player();
  act(() => intersect(true));
  expect(container.querySelector('video[src]')).toBeNull();
  expect(screen.getByRole('button', { name: 'Play manufacturing video' })).toBeEnabled();
});

it('preserves playback on old browsers without intersection observers', () => {
  vi.stubGlobal('IntersectionObserver', undefined);
  const { container } = player();
  expect(container.querySelector('video')).toHaveAttribute('src', '/media/preview.mp4');
});

it.each(['en', 'cn'] as const)('%s keeps the original sustainability photograph as a lazy decorative image', locale => {
  const { container } = render(<HomeTemplate page={pages.find(p => p.id === 'home' && p.locale === locale)!} />);
  const background = container.querySelector('.home-sustainability > img');
  expect(background).not.toBeNull();
  expect(imageSourcePath(background)).toBe('/media/51a97dab42ca11657877b8ccd8b420f4a8e002b2afd65dfda466975a828018c8.webp');
  expect(background).toHaveAttribute('loading', 'lazy');
  expect(background).toHaveAttribute('alt', '');
});
