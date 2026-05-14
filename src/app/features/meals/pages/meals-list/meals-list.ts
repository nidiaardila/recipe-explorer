import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Meal, MealCategory } from '../../../../core/models/meal.model';
import { MealsService } from '../../../../core/services/meals';
import { MealCard } from '../../components/meal-card/meal-card';
import { MealsFilter } from '../../components/meals-filter/meals-filter';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { Loading } from '../../../../shared/components/loading/loading';

@Component({
  selector: 'app-meals-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    MealsFilter,
    MealCard,
    Loading,
    ErrorMessage
  ],
  templateUrl: './meals-list.html',
  styleUrl: './meals-list.scss'
})
export class MealsList implements OnInit {
  private readonly mealsService: MealsService = inject(MealsService);

  readonly meals = signal<Meal[]>([]);
  readonly categories = signal<MealCategory[]>([]);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly searchTerm = signal('');
  readonly selectedCategory = signal('all');

  ngOnInit(): void {
    this.loadCategories();
    this.loadInitialMeals();
  }

  loadCategories(): void {
    this.mealsService.getCategories().subscribe({
      next: (categories: MealCategory[]) => {
        this.categories.set(categories);
      },
      error: () => {
        console.error('No se pudieron cargar las categorías.');
      }
    });
  }

  loadInitialMeals(): void {
    this.loadMealsBySearch('');
  }

  searchMeals(): void {
    this.selectedCategory.set('all');
    this.loadMealsBySearch(this.searchTerm().trim());
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.searchTerm.set('');

    if (category === 'all') {
      this.loadInitialMeals();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.mealsService.filterByCategory(category).subscribe({
      next: (meals: Meal[]) => {
        this.meals.set(meals);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las recetas de esta categoría.');
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('all');
    this.loadInitialMeals();
  }

  private loadMealsBySearch(term: string): void {
    this.loading.set(true);
    this.error.set('');

    this.mealsService.searchMeals(term).subscribe({
      next: (meals: Meal[]) => {
        this.meals.set(meals);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las recetas. Intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }
}