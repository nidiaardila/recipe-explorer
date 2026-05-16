import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Meal } from '../../../../core/models/meal.model';

@Component({
  selector: 'app-meal-card',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './meal-card.html',
  styleUrl: './meal-card.scss'
})
export class MealCard {
  private readonly router = inject(Router);

  @Input({ required: true }) meal!: Meal;
  @Input() categoryFallback = '';
  @Input() areaFallback = '';
  @Input() favorite = false;

  @Output() toggleFavorite = new EventEmitter<string>();

  get category(): string {
    return this.meal.strCategory || this.categoryFallback || 'Receta';
  }

  get area(): string {
    return this.meal.strArea || this.areaFallback || 'Origen no disponible';
  }

  openDetail(): void {
    this.router.navigate(['/meal', this.meal.idMeal]);
  }

  onToggleFavorite(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.toggleFavorite.emit(this.meal.idMeal);
  }
}