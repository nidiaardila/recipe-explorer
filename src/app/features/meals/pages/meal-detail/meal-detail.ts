import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { Meal, MealIngredient } from '../../../../core/models/meal.model';
import { MealsService } from '../../../../core/services/meals';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { Loading } from '../../../../shared/components/loading/loading';

@Component({
  selector: 'app-meal-detail',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    Loading,
    ErrorMessage
  ],
  templateUrl: './meal-detail.html',
  styleUrl: './meal-detail.scss'
})
export class MealDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mealsService: MealsService = inject(MealsService);

  readonly meal = signal<Meal | undefined>(undefined);
  readonly ingredients = signal<MealIngredient[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.error.set('No se encontró el ID de la receta.');
        return;
      }

      this.loadMeal(id);
    });
  }

  loadMeal(id: string): void {
    this.loading.set(true);
    this.error.set('');

    this.mealsService.getMealById(id).subscribe({
      next: (meal: Meal | undefined) => {
        if (!meal) {
          this.error.set('No encontramos esta receta.');
          this.loading.set(false);
          return;
        }

        this.meal.set(meal);
        this.ingredients.set(this.mealsService.getIngredients(meal));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar el detalle de la receta.');
        this.loading.set(false);
      }
    });
  }

  get tags(): string[] {
    const tags = this.meal()?.strTags;

    if (!tags) {
      return [];
    }

    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  get instructionSteps(): string[] {
    const instructions = this.meal()?.strInstructions;

    if (!instructions) {
      return [];
    }

    return instructions
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter(Boolean);
  }

  get youtubeUrl(): string {
    return this.meal()?.strYoutube || '';
  }

  get sourceUrl(): string {
    return this.meal()?.strSource || '';
  }
}
