import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Meal } from '../../../../core/models/meal.model';

@Component({
  selector: 'app-meal-card',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './meal-card.html',
  styleUrl: './meal-card.scss'
})
export class MealCard {
  private readonly router = inject(Router);

  @Input({ required: true }) meal!: Meal;
  @Input() categoryFallback = '';

  get category(): string {
    return this.meal.strCategory || this.categoryFallback || 'Receta';
  }

  get area(): string {
    return this.meal.strArea || 'Origen no disponible';
  }

  openDetail(): void {
    this.router.navigate(['/meal', this.meal.idMeal]);
  }
}