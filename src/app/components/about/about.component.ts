import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

interface Stat {
  target: number;
  suffix: string;
  label: string;
  current: number;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('visual', { static: true }) visualRef!: ElementRef<HTMLDivElement>;
  @ViewChild('aboutSection', { static: true }) sectionRef!: ElementRef<HTMLElement>;

  bio = "Développeur passionné, je transforme des idées en interfaces rapides, soignées et mémorables. J'aime le détail qui fait la différence : une animation fluide, une micro-interaction bien placée, un code propre derrière tout ça.";

  tags = ['Angular', 'TypeScript', 'Three.js', 'Node.js', 'UI/UX'];

  stats: Stat[] = [
    { target: 3, suffix: '+', label: "années d'expérience", current: 0 },
    { target: 20, suffix: '+', label: 'projets livrés', current: 0 },
    { target: 12, suffix: '+', label: 'technologies maîtrisées', current: 0 },
    { target: 98, suffix: '%', label: 'clients satisfaits', current: 0 }
  ];

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private blob!: THREE.Mesh;
  private blobMaterial!: THREE.ShaderMaterial;
  private cage!: THREE.Mesh;
  private clock = new THREE.Clock();
  private frameId = 0;

  private tiltX = 0;
  private tiltY = 0;

  private resizeObserver?: ResizeObserver;
  private sectionObserver?: IntersectionObserver;
  private revealObserver?: IntersectionObserver;
  private statsAnimated = false;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initThree();
      this.animate();
    });

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.visualRef.nativeElement);

    this.setupRevealAnimations();
    this.setupStatsTrigger();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.sectionObserver?.disconnect();
    this.revealObserver?.disconnect();
    this.disposeScene();
    this.renderer?.dispose();
  }

  onVisualMouseMove(event: MouseEvent): void {
    const rect = this.visualRef.nativeElement.getBoundingClientRect();
    this.tiltX = ((event.clientY - rect.top) / rect.height - 0.5) * -0.6;
    this.tiltY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.6;
  }

  onVisualMouseLeave(): void {
    this.tiltX = 0;
    this.tiltY = 0;
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const { clientWidth: width, clientHeight: height } = this.visualRef.nativeElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    const geometry = new THREE.SphereGeometry(2, 128, 128);

    this.blobMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: 0.18 },
        uColorA: { value: new THREE.Color(0x6366f1) }, 
        uColorB: { value: new THREE.Color(0xa855f7) }, 
        uColorC: { value: new THREE.Color(0x22d3ee) }  
      },
      vertexShader: `
        uniform float uTime;
        uniform float uAmplitude;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normal;
          vec3 pos = position;
          float n =
            sin(pos.x * 2.2 + uTime * 0.6) *
            sin(pos.y * 2.2 + uTime * 0.45) *
            sin(pos.z * 2.2 + uTime * 0.5);
          pos += normal * n * uAmplitude;
          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          float fresnel = pow(1.0 - abs(normalize(vNormal).z), 2.4);
          vec3 base = mix(uColorA, uColorB, clamp((vPosition.y + 2.0) / 4.0, 0.0, 1.0));
          vec3 color = mix(base, uColorC, fresnel);
          gl_FragColor = vec4(color, 0.95);
        }
      `,
      transparent: true
    });

    this.blob = new THREE.Mesh(geometry, this.blobMaterial);
    this.group.add(this.blob);

    const cageGeo = new THREE.IcosahedronGeometry(3, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x8b8ff7,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    this.cage = new THREE.Mesh(cageGeo, cageMat);
    this.group.add(this.cage);
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    this.blobMaterial.uniforms['uTime'].value = t;
    this.cage.rotation.y = t * 0.08;
    this.cage.rotation.x = t * 0.05;
    this.blob.rotation.y = t * 0.05;

    this.group.rotation.y += (this.tiltY - this.group.rotation.y) * 0.05;
    this.group.rotation.x += (this.tiltX - this.group.rotation.x) * 0.05;

    this.renderer.render(this.scene, this.camera);
  };

  private onResize(): void {
    const { clientWidth: width, clientHeight: height } = this.visualRef.nativeElement;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private disposeScene(): void {
    this.group?.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        const mat = obj.material as THREE.Material | THREE.Material[];
        Array.isArray(mat) ? mat.forEach(m => m.dispose()) : mat?.dispose();
      }
    });
  }

  private setupRevealAnimations(): void {
    const elements = this.sectionRef.nativeElement.querySelectorAll('.reveal');
    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.revealObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    elements.forEach((el) => this.revealObserver?.observe(el));
  }

  private setupStatsTrigger(): void {
    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.statsAnimated) {
          this.statsAnimated = true;
          this.animateStats();
          this.sectionObserver?.disconnect();
        }
      });
    }, { threshold: 0.3 });

    this.sectionObserver.observe(this.sectionRef.nativeElement);
  }

  private animateStats(): void {
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      this.zone.run(() => {
        this.stats.forEach((stat) => {
          stat.current = Math.round(stat.target * eased);
        });
      });

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}