import {
  Component,
  OnInit,
  HostListener
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';

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
  tiltX: number = 0;
  tiltY: number = 0;
navItems: NavItem[] = [
  { label: 'Home', targetId: 'hero' },
  { label: 'About', targetId: 'about' },
  { label: 'Skills', targetId: 'skills' },
  { label: 'Projects', targetId: 'projects' },
  { label: 'Experiences', targetId: 'experience' },
  { label: 'Contact', targetId: 'contact' }
];

  isMenuOpen: boolean = false;
  activeSection: string = 'hero';
  isScrolled: boolean = false;
  onHeaderMouseMove(event: MouseEvent): void {
    const header = event.currentTarget as HTMLElement;
    const rect = header.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    this.tiltX = y * -8;
    this.tiltY = x * 8;
  }

  onHeaderMouseLeave(): void {
    this.tiltX = 0;
    this.tiltY = 0;
  }
  ngOnInit(): void {
    this.observeSections();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    this.isMenuOpen = false;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;

    this.isScrolled = scrollTop > 0;
  }

  private observeSections(): void {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          this.activeSection = entry.target.id;
        }
      });
    }, options);

    setTimeout(() => {
      const sections = document.querySelectorAll('section[id]');

      sections.forEach((section) => {
        observer.observe(section);
      });
    }, 300);


  }
}
