
import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('footerEl', { static: true }) footerRef!: ElementRef<HTMLElement>;
  @ViewChild('waveCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrap', { static: true }) canvasWrapRef!: ElementRef<HTMLDivElement>;

  currentYear = new Date().getFullYear();
  showBackToTop = false;

  quickLinks = [
    { label: 'Accueil', href: '#home' },
    { label: 'Compétences', href: '#skills' },
    { label: 'Projets', href: '#projects' },
    { label: 'Expérience', href: '#experience' },
    { label: 'Contact', href: '#contact' }
  ];

  socials = [
    { label: 'GitHub', href: 'https://github.com/AydiAla', icon: 'github' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/aydi-ala/', icon: 'linkedin' },
    { label: 'Email', href: 'mailto:aydi.ala@etudiant-fst.utm.tn', icon: 'mail' }
  ];

  private ctx!: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = Math.min(window.devicePixelRatio || 1, 2);
  private time = 0;
  private rafId = 0;

  private resizeObserver?: ResizeObserver;
  private scrollHandler = () => {
    this.showBackToTop = window.scrollY > 600;
  };

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.initCanvas();
    this.loop();

    this.resizeObserver = new ResizeObserver(() => this.initCanvas());
    this.resizeObserver.observe(this.canvasWrapRef.nativeElement);

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    window.removeEventListener('scroll', this.scrollHandler);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private initCanvas(): void {
    const rect = this.canvasWrapRef.nativeElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width * this.dpr;
    canvas.height = this.height * this.dpr;
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private loop = (): void => {
    this.rafId = requestAnimationFrame(this.loop);
    this.time += 0.006;
    this.drawWaves();
  };

  private drawWaves(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const layers = [
      { color: 'rgba(99, 102, 241, 0.10)', amp: 14, freq: 0.012, speed: 1, offsetY: 0.3 },
      { color: 'rgba(168, 85, 247, 0.08)', amp: 18, freq: 0.009, speed: 1.4, offsetY: 0.5 },
      { color: 'rgba(244, 114, 182, 0.06)', amp: 12, freq: 0.015, speed: 0.7, offsetY: 0.7 }
    ];

    layers.forEach(layer => {
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.height);

      for (let x = 0; x <= this.width; x += 6) {
        const y =
          this.height * layer.offsetY +
          Math.sin(x * layer.freq + this.time * layer.speed) * layer.amp;
        this.ctx.lineTo(x, y);
      }

      this.ctx.lineTo(this.width, this.height);
      this.ctx.closePath();
      this.ctx.fillStyle = layer.color;
      this.ctx.fill();
    });
  }
}