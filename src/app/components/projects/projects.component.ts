
import {
  Component, ElementRef, ViewChild, ViewChildren, QueryList,
  AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  color: string;
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
   templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('projectsSection', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChildren('cardEl') cardRefs!: QueryList<ElementRef<HTMLElement>>;

  projects: Project[] = [
{
  title: 'Trello Clone — Gestion de projets collaborative',
  description: 'Clone de Trello full-stack avec tableaux Kanban, chat en temps réel entre développeurs et tech leads, et un assistant IA générant des roadmaps personnalisées pour guider les développeurs dans l\'avancement de leurs tâches.',
  image: 'assets/images/image.png',
  tags: ['Angular', 'Spring Boot', 'MySQL', 'WebSocket', 'IA'],
  color: '#6366f1',
  githubUrl: 'https://github.com/AlaAydi/Trello_Clone',
  liveUrl: 'https://trello-clone-ashy.vercel.app/',
  featured: true
},
{
  title: 'Gestion de Clinique — Plateforme de gestion médicale',
  description: 'Application full-stack de gestion de clinique permettant l’administration des patients, médecins, rendez-vous et dossiers médicaux. La plateforme intègre un tableau de bord administrateur, la gestion des consultations et une architecture moderne facilitant le suivi des activités médicales.',
  image: 'assets/images/clinique.png',
tags: ['Angular', 'Django REST Framework', 'MySQL', 'JWT', 'REST API'],
  color: '#6366f1',
  githubUrl: 'https://github.com/AlaAydi/Gestion_Clinique',
  liveUrl: 'https://gestion-clinique.vercel.app/',
  featured: true
},
   {
  title: 'Analytix — Tableau de bord analytique interactif',
  description: 'Application Angular de visualisation de données offrant un tableau de bord interactif avec graphiques dynamiques (Chart.js) pour l’analyse de métriques en temps réel. La plateforme permet l’export des rapports et graphiques au format PDF, ainsi que la capture des vues du dashboard, dans une interface SPA moderne et responsive.',
  image: 'assets/images/analatix.png',
  tags: ['Angular', 'Chart.js', 'TypeScript', 'jsPDF', 'RxJS'],
  color: '#3b82f6',
  githubUrl: 'https://github.com/AlaAydi/analytix',
  liveUrl: 'https://analytix-delta.vercel.app/',
  featured: true
},
{
  title: 'Ashion — Site E-commerce de mode',
  description: 'Site e-commerce multi-pages dédié à la vente de vêtements et accessoires, développé en HTML, CSS et JavaScript. La plateforme propose une navigation par catégories (Homme, Femme, Enfant, Accessoires), des pages produits détaillées, un panier d’achat, un système de connexion utilisateur ainsi qu’une section blog, le tout avec une interface responsive et une mise en page soignée.',
  image: 'assets/images/commerce.png',
  tags: ['HTML', 'CSS', 'JavaScript'],
  color: '#f59e0b',
  githubUrl: 'https://github.com/AlaAydi/e-commerce',
  liveUrl: 'https://e-commerce-beta-nine.vercel.app/',
  featured: true
}
  ];

  private revealObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.setupRevealAnimations();
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }

  onCardMouseMove(event: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 10;
    const rotateY = (x - 0.5) * 10;

    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--mouse-x', `${x * 100}%`);
    card.style.setProperty('--mouse-y', `${y * 100}%`);
  }

  onCardMouseLeave(card: HTMLElement): void {
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
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
    }, { threshold: 0.15 });

    elements.forEach((el) => this.revealObserver?.observe(el));
  }
}
