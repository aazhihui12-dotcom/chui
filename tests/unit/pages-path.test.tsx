import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrandLogo } from '@/components/site/BrandLogo';
import { LanguageSwitch } from '@/components/site/LanguageSwitch';

afterEach(() => { cleanup(); vi.unstubAllEnvs(); window.history.replaceState({}, '', '/'); });

describe('GitHub Pages project paths', () => {
  it('loads the logo inside the project instead of the account root', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chui');
    render(<BrandLogo />);
    expect(screen.getByAltText('APOWER')).toHaveAttribute('src', '/chui/media/apower-logo.png');
  });

  it('switches the language without interpreting the project name as a locale', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chui');
    window.history.replaceState({}, '', '/chui/en/Contact_Us/');
    render(<LanguageSwitch locale="en" />);
    expect(screen.getByRole('link', { name: '中文' })).toHaveAttribute('href', '/chui/cn/Contact_Us');
  });

  it('retains root paths for local builds', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '');
    render(<BrandLogo />);
    expect(screen.getByAltText('APOWER')).toHaveAttribute('src', '/media/apower-logo.png');
  });
});
