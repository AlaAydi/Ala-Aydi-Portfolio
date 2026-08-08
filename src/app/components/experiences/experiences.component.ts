
import {
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
  color: string;

  // FIX:
  // 'work' a été ajouté car il est utilisé dans le HTML.
  icon: 'web' | 'education' | 'work';
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.scss'
})
export class ExperiencesComponent implements AfterViewInit, OnDestroy {

  // FIX:
  // #experienceSection existe maintenant dans le HTML.
  @ViewChild('experienceSection', { static: true })
  sectionRef!: ElementRef<HTMLElement>;

  @ViewChild('timelineWrap', { static: true })
  timelineWrapRef!: ElementRef<HTMLDivElement>;

  @ViewChild('lineCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @ViewChildren('itemEl')
  itemRefs!: QueryList<ElementRef<HTMLElement>>;


  experiences: ExperienceItem[] = [

    {
      role: 'Développeur Web — Stage de fin d\'études',

      company: 'Plateforme d\'éducation en ligne',

      period: 'Février 2024 – Mai 2024',

      description:
        'Conception et développement d\'une plateforme d\'éducation en ligne interactive permettant aux utilisateurs d\'accéder à des cours, d\'interagir avec les enseignants et de collaborer entre étudiants en temps réel.',

      tags: [
        'React',
        'Express.js',
        'Node.js',
        'MongoDB'
      ],

      color: '#6366f1',

      icon: 'education'
    },

    {
      role: 'Développeur Web — Stage d\'été',

      company: 'Application de gestion d\'employés',

      period: 'Juin 2023 – Juillet 2023',

      description:
        'Développement d\'une application web de gestion d\'employés, couvrant la gestion des données RH et des flux internes côté front et back-end.',

      tags: [
        'Angular',
        'Spring Boot'
      ],

      color: '#a855f7',

      icon: 'web'
    }

  ];


  private ctx!: CanvasRenderingContext2D;

  private progress = 0;

  private targetProgress = 0;

  private rafId = 0;

  private dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );


  private resizeObserver?: ResizeObserver;

  private revealObserver?: IntersectionObserver;


  private scrollHandler = () =>
    this.updateTargetProgress();


  ngAfterViewInit(): void {

    // Get Canvas 2D context
    const context =
      this.canvasRef.nativeElement.getContext('2d');

    if (!context) {
      console.error(
        'Impossible de récupérer le contexte 2D du canvas.'
      );

      return;
    }

    this.ctx = context;


    // Initial canvas setup
    this.resizeCanvas();


    // Start animation loop
    this.loop();


    // Observe timeline size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });

    this.resizeObserver.observe(
      this.timelineWrapRef.nativeElement
    );


    // Listen to page scrolling
    window.addEventListener(
      'scroll',
      this.scrollHandler,
      { passive: true }
    );


    // Initial progress calculation
    this.updateTargetProgress();


    // Setup reveal animations
    this.setupRevealAnimations();
  }


  ngOnDestroy(): void {

    // Stop animation
    cancelAnimationFrame(this.rafId);


    // Disconnect ResizeObserver
    this.resizeObserver?.disconnect();


    // Disconnect IntersectionObserver
    this.revealObserver?.disconnect();


    // Remove scroll listener
    window.removeEventListener(
      'scroll',
      this.scrollHandler
    );
  }


  /**
   * Resize Canvas according to the timeline dimensions.
   */
  private resizeCanvas(): void {

    const wrap =
      this.timelineWrapRef.nativeElement;

    const canvas =
      this.canvasRef.nativeElement;


    const {
      width,
      height
    } = wrap.getBoundingClientRect();


    canvas.width =
      width * this.dpr;

    canvas.height =
      height * this.dpr;


    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;


    this.ctx.setTransform(
      this.dpr,
      0,
      0,
      this.dpr,
      0,
      0
    );
  }


  /**
   * Calculate the timeline animation progress.
   */
  private updateTargetProgress(): void {

    const wrap =
      this.timelineWrapRef.nativeElement;

    const rect =
      wrap.getBoundingClientRect();

    const viewportH =
      window.innerHeight;


    /*
     * Progression:
     *
     * 0 → timeline starts entering viewport
     * 1 → timeline reaches the bottom of viewport
     */

    const total =
      rect.height +
      viewportH * 0.6;


    const covered =
      viewportH * 0.85 -
      rect.top;


    this.targetProgress =
      Math.max(
        0,
        Math.min(
          1,
          covered / total
        )
      );
  }


  /**
   * Animation loop.
   */
  private loop = (): void => {

    this.rafId =
      requestAnimationFrame(
        this.loop
      );


    this.progress +=
      (
        this.targetProgress -
        this.progress
      ) * 0.08;


    this.drawLine();
  };


  /**
   * Draw animated timeline line.
   */
  private drawLine(): void {

    const wrap =
      this.timelineWrapRef.nativeElement;


    const {
      width,
      height
    } = wrap.getBoundingClientRect();


    // Align with timeline icon column
    const x = 28;


    // Clear canvas
    this.ctx.clearRect(
      0,
      0,
      width,
      height
    );


    // --------------------------------
    // Background rail
    // --------------------------------

    this.ctx.strokeStyle =
      'rgba(255,255,255,0.08)';

    this.ctx.lineWidth = 2;


    this.ctx.beginPath();

    this.ctx.moveTo(
      x,
      0
    );

    this.ctx.lineTo(
      x,
      height
    );

    this.ctx.stroke();


    // --------------------------------
    // Animated progress
    // --------------------------------

    const drawnHeight =
      height * this.progress;


    if (drawnHeight <= 0) {
      return;
    }


    // Gradient
    const gradient =
      this.ctx.createLinearGradient(
        0,
        0,
        0,
        drawnHeight
      );


    gradient.addColorStop(
      0,
      'rgba(99, 102, 241, 0.9)'
    );


    gradient.addColorStop(
      1,
      'rgba(244, 114, 182, 0.9)'
    );


    this.ctx.save();


    this.ctx.shadowColor =
      'rgba(168, 85, 247, 0.6)';

    this.ctx.shadowBlur = 12;

    this.ctx.strokeStyle =
      gradient;

    this.ctx.lineWidth = 2.5;

    this.ctx.lineCap =
      'round';


    this.ctx.beginPath();

    this.ctx.moveTo(
      x,
      0
    );

    this.ctx.lineTo(
      x,
      drawnHeight
    );

    this.ctx.stroke();


    this.ctx.restore();


    // --------------------------------
    // Moving light point
    // --------------------------------

    this.ctx.save();


    this.ctx.shadowColor =
      'rgba(255, 255, 255, 0.9)';

    this.ctx.shadowBlur = 14;

    this.ctx.fillStyle =
      '#fff';


    this.ctx.beginPath();


    this.ctx.arc(
      x,
      drawnHeight,
      4,
      0,
      Math.PI * 2
    );


    this.ctx.fill();


    this.ctx.restore();
  }


  /**
   * Reveal timeline cards when they enter viewport.
   */
  private setupRevealAnimations(): void {

    const elements =
      this.sectionRef.nativeElement
        .querySelectorAll('.reveal');


    this.revealObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                'visible'
              );


              this.revealObserver?.unobserve(
                entry.target
              );
            }

          });

        },
        {
          threshold: 0.2
        }
      );


    elements.forEach((element) => {

      this.revealObserver?.observe(
        element
      );

    });
  }
}
