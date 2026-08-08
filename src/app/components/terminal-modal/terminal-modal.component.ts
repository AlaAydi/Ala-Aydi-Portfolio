import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../shared/services/theme.service';

interface TerminalOutput {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

@Component({
  selector: 'app-terminal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './terminal-modal.component.html',
  styleUrl: './terminal-modal.component.scss'
})
export class TerminalModalComponent {
  @ViewChild('terminalInput') inputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('terminalBody') bodyRef!: ElementRef<HTMLDivElement>;

  isOpen = false;
  inputCommand = '';
  history: TerminalOutput[] = [
    { type: 'system', content: 'Welcome to Ala Aydi Interactive Shell v2.4 (ala.sh)' },
    { type: 'system', content: 'Type "help" to view all available commands.\n' }
  ];

  constructor(private themeService: ThemeService) {}

  toggleTerminal(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        this.inputRef?.nativeElement?.focus();
      }, 100);
    }
  }

  closeTerminal(): void {
    this.isOpen = false;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.executeCommand();
    }
  }

  executeCommand(): void {
    const cmd = this.inputCommand.trim();
    if (!cmd) return;

    this.history.push({ type: 'input', content: `ala@aydi-portfolio:~$ ${cmd}` });
    this.inputCommand = '';

    const parts = cmd.toLowerCase().split(' ');
    const mainCmd = parts[0];

    switch (mainCmd) {
      case 'help':
        this.history.push({
          type: 'output',
          content: `Available commands:
  • whoami     - Learn more about Ala Aydi
  • skills     - Print full tech stack
  • projects   - View highlighted projects
  • experience - View work history & background
  • contact    - Get email & social links
  • theme      - Toggle Dark / Light mode
  • clear      - Clear terminal history
  • sudo       - Execute superuser action
  • exit       - Close this terminal`
        });
        break;

      case 'whoami':
        this.history.push({
          type: 'output',
          content: `Ala Aydi — Full Stack Developer & Software Engineer.
Specialized in building fast, elegant web and mobile applications using Angular, NestJS, React, TypeScript, and AI integrations.`
        });
        break;

      case 'skills':
        this.history.push({
          type: 'output',
          content: `[Backend]: NestJS, Node.js, Express, REST APIs, GraphQL, JWT, Microservices
[Frontend]: Angular, React, TypeScript, SCSS, RxJS, Three.js, HTML5/CSS3
[Mobile]: Flutter, Dart, Cross-Platform Mobile Dev
[Databases]: MongoDB, PostgreSQL, MySQL, Mongoose, Prisma
[DevOps & Tools]: Git, GitHub, Docker, Vercel, Postman, Figma`
        });
        break;

      case 'projects':
        this.history.push({
          type: 'output',
          content: `• E-Commerce Web & Mobile App (NestJS + Angular + Flutter)
• WEDNEX IoT & E-Commerce Platform (NestJS + Llama 3.3 AI)
• NeuraPulse - Smart Health & Monitoring System
• Leader Travel Agency Platform (Angular + REST API)
• TunisiaFlicks - Movie Discovery App`
        });
        break;

      case 'experience':
        this.history.push({
          type: 'output',
          content: `• Full Stack Developer / Software Engineer (2+ Years Exp)
• Delivered 20+ projects across web, mobile, and cloud environments.
• Winner & Contender in multiple Hackathons & Tech events.`
        });
        break;

      case 'contact':
        this.history.push({
          type: 'output',
          content: `Email: med.ala.aydi@gmail.com
Location: Tunisia
GitHub: https://github.com/
LinkedIn: https://linkedin.com/`
        });
        break;

      case 'theme':
        this.themeService.toggleTheme();
        this.history.push({
          type: 'output',
          content: `Theme switched to: ${this.themeService.currentTheme().toUpperCase()}`
        });
        break;

      case 'clear':
        this.history = [];
        break;

      case 'sudo':
        this.history.push({
          type: 'output',
          content: `[Permission Granted]: Superuser access unlocked. You now possess unlimited coding energy ⚡`
        });
        break;

      case 'exit':
        this.closeTerminal();
        break;

      default:
        this.history.push({
          type: 'error',
          content: `Command not found: "${cmd}". Type "help" for a list of valid commands.`
        });
        break;
    }

    setTimeout(() => {
      if (this.bodyRef?.nativeElement) {
        this.bodyRef.nativeElement.scrollTop = this.bodyRef.nativeElement.scrollHeight;
      }
    }, 50);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closeTerminal();
    }
  }
}
