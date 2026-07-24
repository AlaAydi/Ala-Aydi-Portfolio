import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('visual', { static: true }) visualRef!: ElementRef<HTMLDivElement>;
  @ViewChild('heroSection', { static: true }) heroSectionRef!: ElementRef<HTMLElement>;

  // --- Data ---
  name = 'Ala';
  displayedName = '';
  tagline = "Je conçois et développe des expériences web rapides, élégantes et sur-mesure — du concept à la mise en ligne.";

  // Animated counters
  animatedProjectCount = 0;
  animatedExpYears = 0;
  private targetProjectCount = 20;
  private targetExpYears = 2;

  // 3D tilt
  tiltX = 0;
  tiltY = 0;

  // Reveal state
  isRevealed = false;

  // --- Three.js ---
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private ring1!: THREE.Mesh;
  private ring2!: THREE.Mesh;
  private ring3!: THREE.Mesh;
  private icosahedron!: THREE.Mesh;
  private octahedron!: THREE.Mesh;
  private particles!: THREE.Points;
  private connectingLines!: THREE.LineSegments;
  private clock = new THREE.Clock();
  private frameId = 0;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private isInView = true;

  // Mouse tracking for parallax
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;

  // Typewriter
  private typewriterTimeout?: ReturnType<typeof setTimeout>;
  private counterInterval?: ReturnType<typeof setInterval>;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    // Start typewriter effect
    this.typewriterEffect();
  }

  ngAfterViewInit(): void {
    // Run Three.js outside Angular zone for performance
    this.zone.runOutsideAngular(() => {
      this.initThree();
      this.animate();
    });

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.heroSectionRef.nativeElement);

    // Intersection observer for pausing animation when not in view
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.isInView = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    this.intersectionObserver.observe(this.heroSectionRef.nativeElement);

    // Trigger reveal animation after a short delay
    setTimeout(() => {
      this.isRevealed = true;
      this.animateCounters();
    }, 200);

    // Global mouse listener for subtle parallax
    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onGlobalMouseMove);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    window.removeEventListener('mousemove', this.onGlobalMouseMove);
    if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
    if (this.counterInterval) clearInterval(this.counterInterval);
    this.disposeScene();
    this.renderer?.dispose();
  }

  // =====================================================
  // PUBLIC METHODS
  // =====================================================

  scrollToContact(): void {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onVisualMouseMove(event: MouseEvent): void {
    const rect = this.visualRef.nativeElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    this.tiltX = y * -12;
    this.tiltY = x * 12;
  }

  onVisualMouseLeave(): void {
    this.tiltX = 0;
    this.tiltY = 0;
  }

  // =====================================================
  // TYPEWRITER EFFECT
  // =====================================================

  private typewriterEffect(): void {
    const fullName = this.name;
    let i = 0;
    const speed = 150;

    const type = () => {
      if (i < fullName.length) {
        this.displayedName = fullName.substring(0, i + 1);
        i++;
        this.typewriterTimeout = setTimeout(type, speed);
      }
    };

    // Delay start for reveal
    this.typewriterTimeout = setTimeout(type, 800);
  }

  // =====================================================
  // ANIMATED COUNTERS
  // =====================================================

  private animateCounters(): void {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    this.counterInterval = setInterval(() => {
      currentStep++;
      const progress = this.easeOutQuart(currentStep / steps);

      this.animatedProjectCount = Math.round(progress * this.targetProjectCount);
      this.animatedExpYears = Math.round(progress * this.targetExpYears);

      if (currentStep >= steps) {
        this.animatedProjectCount = this.targetProjectCount;
        this.animatedExpYears = this.targetExpYears;
        if (this.counterInterval) clearInterval(this.counterInterval);
      }
    }, stepDuration);
  }

  private easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
  }



  private onGlobalMouseMove = (event: MouseEvent): void => {
    this.targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  };



  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const section = this.heroSectionRef.nativeElement;
    const width = section.clientWidth;
    const height = section.clientHeight;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 10);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    this.ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(4.0, 0.015, 6, 100),
      ringMat1
    );
    this.ring1.rotation.x = Math.PI / 2.2;
    this.group.add(this.ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(4.8, 0.01, 6, 120),
      ringMat2
    );
    this.ring2.rotation.x = Math.PI / 1.6;
    this.ring2.rotation.y = Math.PI / 5;
    this.group.add(this.ring2);

    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    this.ring3 = new THREE.Mesh(
      new THREE.TorusGeometry(5.5, 0.005, 6, 160),
      ringMat3
    );
    this.ring3.rotation.x = Math.PI / 3;
    this.ring3.rotation.z = Math.PI / 4;
    this.group.add(this.ring3);

    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.icosahedron = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5, 0),
      icoMat
    );
    this.icosahedron.position.set(-4.0, 2.5, 1);
    this.group.add(this.icosahedron);

    const octaMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    this.octahedron = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4, 0),
      octaMat
    );
    this.octahedron.position.set(3.5, -2.0, 0.5);
    this.group.add(this.octahedron);

    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x6366f1), 
      new THREE.Color(0xa855f7),  
      new THREE.Color(0x22d3ee), 
      new THREE.Color(0x8b8ff7),  
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi) * 0.5;
      sizes[i] = Math.random() * 0.06 + 0.01;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(particlesGeo, particlesMat);
    this.group.add(this.particles);

    this.createConstellationLines();
  }

  private createConstellationLines(): void {
    const lineCount = 30;
    const linePositions = new Float32Array(lineCount * 6); 

    for (let i = 0; i < lineCount; i++) {
      const r1 = 3 + Math.random() * 4;
      const t1 = Math.random() * Math.PI * 2;
      const p1 = Math.acos(Math.random() * 2 - 1);

      const r2 = r1 + (Math.random() - 0.5) * 2;
      const t2 = t1 + (Math.random() - 0.5) * 0.5;
      const p2 = p1 + (Math.random() - 0.5) * 0.5;

      linePositions[i * 6]     = r1 * Math.sin(p1) * Math.cos(t1);
      linePositions[i * 6 + 1] = r1 * Math.sin(p1) * Math.sin(t1);
      linePositions[i * 6 + 2] = r1 * Math.cos(p1) * 0.5;
      linePositions[i * 6 + 3] = r2 * Math.sin(p2) * Math.cos(t2);
      linePositions[i * 6 + 4] = r2 * Math.sin(p2) * Math.sin(t2);
      linePositions[i * 6 + 5] = r2 * Math.cos(p2) * 0.5;
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.connectingLines = new THREE.LineSegments(lineGeo, lineMat);
    this.group.add(this.connectingLines);
  }



  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);

    if (!this.isInView) return;

    const t = this.clock.getElapsedTime();

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    this.ring1.rotation.z = t * 0.08;
    this.ring2.rotation.z = -t * 0.06;
    this.ring3.rotation.z = t * 0.04;
    this.ring3.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.1;

    this.icosahedron.rotation.x = t * 0.35;
    this.icosahedron.rotation.y = t * 0.5;
    this.icosahedron.position.y = 2.5 + Math.sin(t * 0.8) * 0.3;

    this.octahedron.rotation.x = t * 0.4;
    this.octahedron.rotation.z = t * 0.3;
    this.octahedron.position.y = -2.0 + Math.sin(t * 0.6 + 1) * 0.25;

    this.particles.rotation.y = t * 0.02;
    this.particles.rotation.x = Math.sin(t * 0.1) * 0.05;

    this.connectingLines.rotation.y = t * 0.015;

    this.group.rotation.y += (this.mouseX * 0.15 - this.group.rotation.y) * 0.03;
    this.group.rotation.x += (this.mouseY * 0.08 - this.group.rotation.x) * 0.03;

    this.camera.position.z = 10 + Math.sin(t * 0.3) * 0.15;

    this.renderer.render(this.scene, this.camera);
  };


  private onResize(): void {
    const section = this.heroSectionRef.nativeElement;
    const width = section.clientWidth;
    const height = section.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private disposeScene(): void {
    this.group?.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
        obj.geometry?.dispose();
        const mat = obj.material as THREE.Material | THREE.Material[];
        Array.isArray(mat) ? mat.forEach(m => m.dispose()) : mat?.dispose();
      }
    });
  }
}
