import {
  Component, ElementRef, ViewChild, ViewChildren, QueryList,
  AfterViewInit, OnDestroy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

interface SkillCategory {
  name: string;
  color: string;
  icon: string;
  skills: string[];
}

interface SkillNode {
  label: string;
  color: string;
  anchor: THREE.Object3D;
  sprite?: THREE.Sprite;
  scale: number;
  opacity: number;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('visual', { static: true }) visualRef!: ElementRef<HTMLDivElement>;
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('skillsSection', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChildren('label') labelRefs!: QueryList<ElementRef<HTMLSpanElement>>;

  categories: SkillCategory[] = [
    { name: 'Frontend', color: '#22d3ee', icon: '🎨', skills: ['Angular', 'TypeScript', 'HTML5', 'SCSS', 'RxJS', 'Three.js'] },
    { name: 'Backend', color: '#a855f7', icon: '⚙️', skills: ['Node.js', 'NestJS', 'Express', 'REST API', 'GraphQL', 'JWT'] },
    { name: 'Mobile', color: '#f59e0b', icon: '📱', skills: ['Flutter', 'Dart', 'Cross-Platform'] },
    { name: 'Databases', color: '#34d399', icon: '🗄️', skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Mongoose', 'Prisma'] },
    { name: 'DevOps', color: '#6366f1', icon: '🚀', skills: ['Git', 'GitHub', 'Docker', 'Vercel', 'Postman', 'Figma'] },
    { name: 'AI/Cloud', color: '#f472b6', icon: '🤖', skills: ['Python', 'Llama 3.3', 'OpenAI API', 'Langchain', 'REST AI'] }
  ];

  flatSkills: { label: string; color: string }[] =
    this.categories.flatMap(cat => cat.skills.map(skill => ({ label: skill, color: cat.color })));

  activeFilter = 'all';

  get filteredCategories(): SkillCategory[] {
    if (this.activeFilter === 'all') return this.categories;
    return this.categories.filter(c => c.name === this.activeFilter);
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  private nodes: SkillNode[] = [];
  private labelEls: HTMLSpanElement[] = [];

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private clock = new THREE.Clock();
  private frameId = 0;

  private tiltX = 0;
  private tiltY = 0;

  private hoveredIndex = -1;
  private raycaster = new THREE.Raycaster();
  private pointerNDC = new THREE.Vector2(-10, -10);

  private resizeObserver?: ResizeObserver;
  private revealObserver?: IntersectionObserver;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.labelEls = this.labelRefs.toArray().map(ref => ref.nativeElement);

    this.zone.runOutsideAngular(() => {
      this.initThree();
      this.animate();
    });

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.visualRef.nativeElement);

    this.setupRevealAnimations();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.revealObserver?.disconnect();
    this.renderer?.dispose();
  }

  onVisualMouseMove(event: MouseEvent): void {
    const rect = this.visualRef.nativeElement.getBoundingClientRect();
    this.tiltX = ((event.clientY - rect.top) / rect.height - 0.5) * -0.5;
    this.tiltY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.5;

    this.pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNDC.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  onVisualMouseLeave(): void {
    this.tiltX = 0;
    this.tiltY = 0;
    this.pointerNDC.set(-10, -10);
    this.hoveredIndex = -1;
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const { clientWidth: width, clientHeight: height } = this.visualRef.nativeElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.buildNodes();
    this.buildVisualMesh();
  }

  private buildNodes(): void {
    const radius = 3.2;
    const n = this.flatSkills.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    this.nodes = this.flatSkills.map((item, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;

      const anchor = new THREE.Object3D();
      anchor.position.set(
        Math.cos(theta) * radiusAtY * radius,
        y * radius,
        Math.sin(theta) * radiusAtY * radius
      );
      this.group.add(anchor);

      return { label: item.label, color: item.color, anchor, scale: 1, opacity: 1 };
    });
  }

  private createGlowTexture(): THREE.Texture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  private buildVisualMesh(): void {
    const glowTex = this.createGlowTexture();

    this.nodes.forEach((node) => {
      const mat = new THREE.SpriteMaterial({
        map: glowTex,
        color: node.color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.55, 0.55, 1);
      node.anchor.add(sprite);
      node.sprite = sprite;
    });

    this.buildCategoryConnections();

    const scaffold = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.04 })
    );
    this.group.add(scaffold);
  }

  private buildCategoryConnections(): void {
    let offset = 0;
    this.categories.forEach((cat) => {
      const catNodes = this.nodes.slice(offset, offset + cat.skills.length);
      offset += cat.skills.length;

      for (let i = 0; i < catNodes.length; i++) {
        const a = catNodes[i];
        const b = catNodes[(i + 1) % catNodes.length];

        const mid = a.anchor.position.clone().add(b.anchor.position).multiplyScalar(0.5);
        mid.multiplyScalar(1.15);

        const curve = new THREE.QuadraticBezierCurve3(a.anchor.position, mid, b.anchor.position);
        const points = curve.getPoints(20);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: cat.color,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending
        });
        this.group.add(new THREE.Line(geo, mat));
      }
    });
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    this.group.rotation.y = t * 0.08 + this.tiltY;
    this.group.rotation.x += (this.tiltX - this.group.rotation.x) * 0.06;

    // Respiration idle + agrandissement au survol
    this.nodes.forEach((node, i) => {
      const breathe = Math.sin(t * 1.4 + i * 0.6) * 0.06;
      if (node.sprite) {
        const base = i === this.hoveredIndex ? 0.85 : 0.55;
        node.sprite.scale.setScalar(base + breathe);
      }
    });

    this.camera.updateMatrixWorld();
    this.camera.matrixWorldInverse.copy(this.camera.matrixWorld).invert();

    this.updateHover();
    this.updateLabelPositions();
    this.renderer.render(this.scene, this.camera);
  };

  private updateHover(): void {
    this.raycaster.setFromCamera(this.pointerNDC, this.camera);
    const sprites = this.nodes.map(n => n.sprite).filter(Boolean) as THREE.Sprite[];
    const hits = this.raycaster.intersectObjects(sprites);
    this.hoveredIndex = hits.length ? this.nodes.findIndex(n => n.sprite === hits[0].object) : -1;
  }

  private updateLabelPositions(): void {
    const rect = this.visualRef.nativeElement.getBoundingClientRect();
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    const worldPos = new THREE.Vector3();
    const camSpace = new THREE.Vector3();

    this.nodes.forEach((node, i) => {
      node.anchor.getWorldPosition(worldPos);
      camSpace.copy(worldPos).applyMatrix4(this.camera.matrixWorldInverse);

      const projected = worldPos.clone().project(this.camera);
      const screenX = projected.x * halfW + halfW;
      const screenY = -projected.y * halfH + halfH;

      const depth = THREE.MathUtils.clamp((camSpace.z + 8) / 6, 0, 1);
      node.scale = 0.65 + depth * 0.6;
      node.opacity = 0.3 + depth * 0.7;

      const el = this.labelEls[i];
      if (!el) return;

      const isHovered = i === this.hoveredIndex;
      const finalOpacity = this.hoveredIndex === -1
        ? node.opacity
        : (isHovered ? 1 : node.opacity * 0.25);
      const finalScale = isHovered ? node.scale * 1.25 : node.scale;

      el.style.transform =
        `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${finalScale})`;
      el.style.opacity = `${finalOpacity}`;
      el.style.zIndex = `${isHovered ? 9999 : Math.round(node.scale * 100)}`;
      el.classList.toggle('is-active', isHovered);
    });
  }

  private onResize(): void {
    const { clientWidth: width, clientHeight: height } = this.visualRef.nativeElement;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
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
    }, { threshold: 0.2 });

    elements.forEach((el) => this.revealObserver?.observe(el));
  }
}