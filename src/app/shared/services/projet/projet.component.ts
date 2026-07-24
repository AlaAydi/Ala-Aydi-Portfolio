
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

Injectable({
  providedIn: 'root'
})

export interface   Projet {

  title: string;
  description: string;

  technologies: string[];
  linkUrl?: string;
  codeUrl?: string;
}


export class ProjetService {
    private projets: Projet[] = [
    {
      title: 'Portfolio',
      description: 'A personal portfolio website built with Angular, showcasing my skills, projects, and experiences.',
      technologies: ['Angular', 'TypeScript', 'HTML', 'CSS'],
      linkUrl: 'https://example.com/portfolio',
      codeUrl: 'https://github.com/myusername/portfolio'},
    {
      title: 'E-commerce Platform',
      description: 'A full-featured e-commerce platform with user authentication, product catalog, and shopping cart functionality.',
      technologies: ['Angular', 'Node.js', 'Express', 'MongoDB'],
      linkUrl: 'https://example.com/ecommerce',
      codeUrl: ''},

      {
      title: 'Task Management App',
      description: 'A task management application that allows users to create, update, and track their tasks efficiently.',
      technologies: ['Angular', 'Firebase', 'Bootstrap'],
      linkUrl: 'https://example.com/taskmanager',
      codeUrl: 'https://github.com/myusername/taskmanager'



      } ,



    ]
    getProjets() {
      return of(this.projets);
    }
}
