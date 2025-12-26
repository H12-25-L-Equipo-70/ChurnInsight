import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html'
})
export class NavigationComponent {
  // Navigation items can be defined here if they become dynamic
  navItems = [
    { path: '/prediction', icon: '🤖', label: 'Prediction' },
    { path: '/dashboard', icon: '📊', label: 'Dashboard' }
  ];
}
