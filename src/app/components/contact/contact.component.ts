
import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
}

type SendState = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  @ViewChild('contactSection', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrap', { static: true }) canvasWrapRef!: ElementRef<HTMLDivElement>;

private readonly SERVICE_ID = environment.emailjs.serviceId;
private readonly TEMPLATE_ID = environment.emailjs.templateId;
private readonly PUBLIC_KEY = environment.emailjs.publicKey;

  form: FormGroup;
  sendState: SendState = 'idle';
  errorMessage = '';

  contactInfo = [
    { label: 'Email', value: 'contact.aydiala@gmail.com', href: 'mailto:contact.aydiala@gmail.com', icon: 'mail' },
    { label: 'Téléphone', value: '+216 27 983 973', href: 'tel:+21627983973', icon: 'phone' },
    { label: 'Localisation', value: 'Ariana, Tunisie', href: null, icon: 'pin' },
    { label: 'GitHub', value: 'AydiAla', href: 'https://github.com/AlaAydi', icon: 'github' },
    { label: 'LinkedIn', value: 'aydi-ala', href: 'https://linkedin.com/in/aydi-ala/', icon: 'linkedin' }
  ];

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouse = { x: -9999, y: -9999 };
  private rafId = 0;
  private width = 0;
  private height = 0;
  private dpr = Math.min(window.devicePixelRatio || 1, 2);

  private resizeObserver?: ResizeObserver;
  private revealObserver?: IntersectionObserver;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

ngAfterViewInit(): void {
  emailjs.init({
    publicKey: this.PUBLIC_KEY
  });

  this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
  this.initCanvas();
  this.loop();

  this.resizeObserver = new ResizeObserver(() => this.initCanvas());
  this.resizeObserver.observe(this.canvasWrapRef.nativeElement);

  this.setupRevealAnimations();
}

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.revealObserver?.disconnect();
  }

  onCanvasMouseMove(event: MouseEvent): void {
    const rect = this.canvasWrapRef.nativeElement.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  onCanvasMouseLeave(): void {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  get isInvalid() {
    return (field: string) => {
      const control = this.form.get(field);
      return !!control && control.invalid && control.touched;
    };
  }
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.sendState = 'sending';
    this.errorMessage = '';

    try {
      await emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, {
        from_name: this.form.value.name,
        from_email: this.form.value.email,
        subject: this.form.value.subject,
        message: this.form.value.message
      });

      this.sendState = 'success';
      this.form.reset();

      setTimeout(() => {
        if (this.sendState === 'success') this.sendState = 'idle';
      }, 5000);
    } catch (err) {
      console.error('EmailJS error:', err);
      this.sendState = 'error';
      this.errorMessage = 'Une erreur est survenue. Réessaie ou contacte-moi directement par email.';
    }
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

    const count = Math.round((this.width * this.height) / 9000);
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    }));
  }

  private loop = (): void => {
    this.rafId = requestAnimationFrame(this.loop);
    this.ctx.clearRect(0, 0, this.width, this.height);

    const maxDist = 130;
    const mouseRadius = 160;

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouseRadius) {
        const force = (1 - dist / mouseRadius) * 0.6;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }
    });

    // connexions entre particules proches
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.15;
          this.ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    // points
    this.particles.forEach(p => {
      const distToMouse = Math.hypot(p.x - this.mouse.x, p.y - this.mouse.y);
      const lit = distToMouse < mouseRadius;

      this.ctx.beginPath();
      this.ctx.fillStyle = lit ? 'rgba(244, 114, 182, 0.9)' : 'rgba(99, 102, 241, 0.5)';
      this.ctx.arc(p.x, p.y, lit ? 2.4 : 1.6, 0, Math.PI * 2);
      this.ctx.fill();
    });
  };

  private setupRevealAnimations(): void {
    const elements = this.sectionRef.nativeElement.querySelectorAll('.reveal');
    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.revealObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    elements.forEach((el) => this.revealObserver?.observe(el));
  }
}
