import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PaletteItem {
  icon: string;
  label: string;
  description: string;
  action: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './command-palette.component.html',
  styleUrl: './command-palette.component.scss'
})
export class CommandPaletteComponent {
  isOpen = false;
  searchQuery = '';
  selectedIndex = 0;

  allItems: PaletteItem[] = [
    { icon: '🏠', label: 'Go to Home', description: 'Navigate to hero section', action: () => this.navigateTo('hero') },
    { icon: '👤', label: 'About Me', description: 'Navigate to about section', action: () => this.navigateTo('about') },
    { icon: '⚡', label: 'Skills', description: 'Navigate to skills section', action: () => this.navigateTo('skills') },
    { icon: '🚀', label: 'Projects', description: 'Navigate to projects section', action: () => this.navigateTo('projects') },
    { icon: '💼', label: 'Experience', description: 'Navigate to experience section', action: () => this.navigateTo('experience') },
    { icon: '✉️', label: 'Contact', description: 'Navigate to contact section', action: () => this.navigateTo('contact') },
    { icon: '📋', label: 'Copy Email', description: 'Copy email to clipboard', action: () => this.copyEmail() },
    { icon: '🐙', label: 'Open GitHub', description: 'View GitHub profile', action: () => this.openUrl('https://github.com/') },
    { icon: '💼', label: 'Open LinkedIn', description: 'View LinkedIn profile', action: () => this.openUrl('https://linkedin.com/') },
    { icon: '📄', label: 'Download CV', description: 'Download curriculum vitae', action: () => this.openUrl('assets/aydicv.pdf') },
  ];

  get filteredItems(): PaletteItem[] {
    if (!this.searchQuery.trim()) return this.allItems;
    const q = this.searchQuery.toLowerCase();
    return this.allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  }

  togglePalette(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchQuery = '';
      this.selectedIndex = 0;
    }
  }

  closePalette(): void {
    this.isOpen = false;
  }

  selectItem(index: number): void {
    this.selectedIndex = index;
  }

  executeSelected(): void {
    const item = this.filteredItems[this.selectedIndex];
    if (item) {
      item.action();
      this.closePalette();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.togglePalette();
      return;
    }
    if (!this.isOpen) return;
    if (event.key === 'Escape') { this.closePalette(); return; }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredItems.length - 1);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.executeSelected();
    }
  }

  private navigateTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private copyEmail(): void {
    navigator.clipboard.writeText('med.ala.aydi@gmail.com');
  }

  private openUrl(url: string): void {
    window.open(url, '_blank', 'noopener');
  }
}
