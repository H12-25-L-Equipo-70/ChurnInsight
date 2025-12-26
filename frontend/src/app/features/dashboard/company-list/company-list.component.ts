import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlatCompanyRecord } from '../../../core/models/churn.interface';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-list.component.html'
})
export class CompanyListComponent {
  @Input() companies: FlatCompanyRecord[] = [];
}
