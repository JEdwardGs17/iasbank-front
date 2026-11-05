import { Component, inject, signal } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './core/components/toast-container/toast-container.component';
import { ThemeService } from './core/services/theme.service';
import { IconComponent, IconName } from './shared/components/icon/icon.component';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly sidebarOpen = signal(false);

  /** A link is active only on its exact path, regardless of query params (e.g. ?ref=). */
  protected readonly activeLinkOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };

  protected readonly navigation: NavSection[] = [
    {
      title: 'Transferencias',
      items: [
        { label: 'Nueva transferencia', path: '/transfers/new', icon: 'transfer' },
        { label: 'Transferencias', path: '/transfers', icon: 'history' },
      ],
    },
    {
      title: 'Administración',
      items: [
        { label: 'Cuentas', path: '/accounts', icon: 'bank' },
        { label: 'Eventos', path: '/events', icon: 'activity' },
      ],
    },
  ];
}
