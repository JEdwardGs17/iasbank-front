import { Component, input, output } from '@angular/core';
import { Page } from '../../../core/models/page.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-pagination',
  imports: [IconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly page = input.required<Page<unknown>>();
  readonly itemLabel = input('elementos');
  readonly pageChange = output<number>();
}
