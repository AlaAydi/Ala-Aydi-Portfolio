import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.scss'
})
export class PreloaderComponent implements OnInit, OnDestroy {
  @Output() complete = new EventEmitter<void>();

  progress = 0;
  currentStepIndex = 0;
  isFadingOut = false;

  steps: string[] = [
    'Initializing kernel & virtual environment...',
    'Loading modules: Angular, NestJS, TypeScript, AI...',
    'Compiling assets & initializing 3D particle engine...',
    'Establishing secure websocket connection...',
    'Ready.'
  ];

  private timer: any;

  ngOnInit(): void {
    this.startLoading();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private startLoading(): void {
    const totalDuration = 2200; 
    const intervalTime = 30;
    const increment = 100 / (totalDuration / intervalTime);

    this.timer = setInterval(() => {
      this.progress += increment;

      if (this.progress >= 20 && this.currentStepIndex < 1) this.currentStepIndex = 1;
      if (this.progress >= 50 && this.currentStepIndex < 2) this.currentStepIndex = 2;
      if (this.progress >= 80 && this.currentStepIndex < 3) this.currentStepIndex = 3;
      if (this.progress >= 95 && this.currentStepIndex < 4) this.currentStepIndex = 4;

      if (this.progress >= 100) {
        this.progress = 100;
        clearInterval(this.timer);
        setTimeout(() => this.finish(), 300);
      }
    }, intervalTime);
  }

  skipIntro(): void {
    if (this.timer) clearInterval(this.timer);
    this.progress = 100;
    this.finish();
  }

  private finish(): void {
    this.isFadingOut = true;
    setTimeout(() => {
      this.complete.emit();
    }, 500);
  }
}
