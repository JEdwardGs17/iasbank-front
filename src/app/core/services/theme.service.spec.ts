import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService (modo claro / oscuro)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'light');
  });

  it('alterna el tema, lo aplica al documento y lo recuerda', () => {
    const theme = TestBed.inject(ThemeService);

    theme.toggle();
    TestBed.tick();

    expect(theme.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('iasbank-theme')).toBe('dark');
  });
});
