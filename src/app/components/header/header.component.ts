import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../shared/services/theme.service';

interface NavItem {
  label: string;
  targetId: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  tiltX = 0;
  tiltY = 0;
  isMenuOpen = false;
  activeSection = 'hero';
  isScrolled = false;

  navItems: NavItem[] = [
    { label: 'Home', targetId: 'hero' },
    { label: 'About', targetId: 'about' },
    { label: 'Skills', targetId: 'skills' },
    { label: 'Projects', targetId: 'projects' },
    { label: 'Experience', targetId: 'experience' },
    { label: 'Contact', targetId: 'contact' }
  ];

  get isDark(): boolean { return this.themeService.isDark(); }

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.observeSections();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.isMenuOpen = false;
  }

  onHeaderMouseMove(event: MouseEvent): void {
    const header = event.currentTarget as HTMLElement;
    const rect = header.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    this.tiltX = y * -6;
    this.tiltY = x * 6;
  }

  onHeaderMouseLeave(): void {
    this.tiltX = 0;
    this.tiltY = 0;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 20;
  }

  private observeSections(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target.id) {
            this.activeSection = entry.target.id;
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.4 }
    );

    setTimeout(() => {
      document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
    }, 400);
  }
}
