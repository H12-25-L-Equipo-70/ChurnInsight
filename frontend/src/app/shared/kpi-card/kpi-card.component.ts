import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html'
})
export class KpiCardComponent {
  @Input() title: string = 'KPI Title';
  @Input() value: string | number = '0';
  @Input() unit: string = '';
  @Input() icon: string = '';
  @Input() color: string = 'text-gray-600';
}
