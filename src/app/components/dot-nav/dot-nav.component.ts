import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavDot {
  id: string;
  label: string;
}

@Component({
  selector: 'app-dot-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dot-nav.component.html',
  styleUrl: './dot-nav.component.scss'
})
export class DotNavComponent implements OnInit, OnDestroy {
  sections: NavDot[] = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' }
  ];

  activeSection = 'hero';
  hoveredSection: string | null = null;

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.initObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private initObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            this.activeSection = entry.target.id;
          }
        });
      },
      { threshold: [0.4] }
    );

    setTimeout(() => {
      this.sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) this.observer!.observe(el);
      });
    }, 500);
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setHovered(id: string | null): void {
    this.hoveredSection = id;
  }
}
