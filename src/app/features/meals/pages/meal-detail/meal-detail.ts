import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { Meal, MealIngredient } from '../../../../core/models/meal.model';
import { FavoritesService } from '../../../../core/services/favorites';
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
  private readonly favoritesService = inject(FavoritesService);

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

    return this.formatInstructionSteps(instructions);
  }

  get youtubeUrl(): string {
    return this.meal()?.strYoutube || '';
  }

  get sourceUrl(): string {
    return this.meal()?.strSource || '';
  }

  isFavorite(): boolean {
    const id = this.meal()?.idMeal;

    if (!id) {
      return false;
    }

    return this.favoritesService.isFavorite(id);
  }

  toggleFavorite(): void {
    const id = this.meal()?.idMeal;

    if (!id) {
      return;
    }

    this.favoritesService.toggleFavorite(id);
  }

  private formatInstructionSteps(instructions: string): string[] {
    const normalizedInstructions = instructions
      .replace(/\r/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim();

    const lineSteps = normalizedInstructions
      .split('\n')
      .map((step) => step.trim())
      .filter(Boolean);

    if (lineSteps.length > 1) {
      return lineSteps;
    }

    const sentenceSteps =
      normalizedInstructions.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [];

    return sentenceSteps
      .map((step) => step.trim())
      .filter((step) => step.length > 3);
  }
}