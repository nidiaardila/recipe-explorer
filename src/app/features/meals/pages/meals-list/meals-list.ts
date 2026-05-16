import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  Meal,
  MealArea,
  MealCategory
} from '../../../../core/models/meal.model';
import { FavoritesService } from '../../../../core/services/favorites';
import { MealsService } from '../../../../core/services/meals';
import { MealCard } from '../../components/meal-card/meal-card';
import { MealsFilter } from '../../components/meals-filter/meals-filter';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { Loading } from '../../../../shared/components/loading/loading';

@Component({
  selector: 'app-meals-list',
  imports: [
    RouterLink,
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mealsService: MealsService = inject(MealsService);
  private readonly favoritesService = inject(FavoritesService);

  readonly meals = signal<Meal[]>([]);
  readonly favoriteMeals = signal<Meal[]>([]);
  readonly categories = signal<MealCategory[]>([]);
  readonly areas = signal<MealArea[]>([]);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly searchTerm = signal('');
  readonly selectedCategory = signal('all');
  readonly selectedArea = signal('all');
  readonly showOnlyFavorites = signal(false);

  readonly pageTitle = computed(() =>
    this.showOnlyFavorites()
      ? 'Tus recetas favoritas'
      : 'Explora recetas del mundo'
  );

  readonly pageDescription = computed(() =>
    this.showOnlyFavorites()
      ? 'Aquí verás las recetas que guardaste para preparar después.'
      : 'Busca recetas, descubre categorías y aprende a preparar platos de diferentes países.'
  );

  readonly totalFavoriteMeals = computed(
    () => this.favoritesService.favoriteMealIds().length
  );

  readonly emptyStateTitle = computed(() => {
  if (this.showOnlyFavorites()) {
    return this.totalFavoriteMeals() === 0
      ? 'Aún no tienes recetas favoritas'
      : 'No encontramos favoritas con esos filtros';
  }

  if (this.selectedArea() !== 'all') {
    return `No encontramos recetas para ${this.selectedArea()}`;
  }

  if (this.selectedCategory() !== 'all') {
    return `No encontramos recetas en ${this.selectedCategory()}`;
  }

  const term = this.searchTerm().trim();

  if (term) {
    return `No encontramos recetas para "${term}"`;
  }

  return 'No se encontraron recetas';
});

readonly emptyStateMessage = computed(() => {
  if (this.showOnlyFavorites()) {
    return this.totalFavoriteMeals() === 0
      ? 'Haz clic en el corazón de cualquier receta para guardarla aquí.'
      : 'Prueba limpiando los filtros o usando otra búsqueda dentro de tus favoritas.';
  }

  if (this.selectedArea() !== 'all') {
    return 'Este origen aparece en TheMealDB, pero actualmente no tiene recetas asociadas al filtro. Prueba con otra cocina o busca por nombre.';
  }

  if (this.selectedCategory() !== 'all') {
    return 'La API no devolvió recetas para esta categoría en este momento. Prueba con otra categoría o limpia los filtros.';
  }

  if (this.searchTerm().trim()) {
    return 'Prueba con otra palabra, por ejemplo chicken, pasta, beef o cake.';
  }

  return 'Prueba buscando otra palabra o seleccionando una categoría diferente.';
});

  ngOnInit(): void {
    this.loadCategories();
    this.loadAreas();

    this.route.data.subscribe((data) => {
      this.showOnlyFavorites.set(Boolean(data['onlyFavorites']));
      this.clearFilters(false);

      if (this.showOnlyFavorites()) {
        this.loadFavoriteMeals();
      } else {
        this.loadInitialMeals();
      }
    });
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

  loadAreas(): void {
    this.mealsService.getAreas().subscribe({
      next: (areas: MealArea[]) => {
        this.areas.set(areas);
      },
      error: () => {
        console.error('No se pudieron cargar los orígenes.');
      }
    });
  }

  loadInitialMeals(): void {
    this.loadMealsBySearch('');
  }

  searchMeals(): void {
    if (this.showOnlyFavorites()) {
      this.applyFavoriteFilters();
      return;
    }

    this.selectedCategory.set('all');
    this.selectedArea.set('all');
    this.loadMealsBySearch(this.searchTerm().trim());
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.searchTerm.set('');
    this.selectedArea.set('all');

    if (this.showOnlyFavorites()) {
      this.applyFavoriteFilters();
      return;
    }

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

  onAreaChange(area: string): void {
    this.selectedArea.set(area);
    this.searchTerm.set('');
    this.selectedCategory.set('all');

    if (this.showOnlyFavorites()) {
      this.applyFavoriteFilters();
      return;
    }

    if (area === 'all') {
      this.loadInitialMeals();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.mealsService.filterByArea(area).subscribe({
      next: (meals: Meal[]) => {
        this.meals.set(meals);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las recetas de este origen.');
        this.loading.set(false);
      }
    });
  }

  clearFilters(loadMeals = true): void {
    this.searchTerm.set('');
    this.selectedCategory.set('all');
    this.selectedArea.set('all');

    if (!loadMeals) {
      return;
    }

    if (this.showOnlyFavorites()) {
      this.applyFavoriteFilters();
    } else {
      this.loadInitialMeals();
    }
  }

  openRandomMeal(): void {
    this.loading.set(true);
    this.error.set('');

    this.mealsService.getRandomMeal().subscribe({
      next: (meal: Meal | undefined) => {
        this.loading.set(false);

        if (!meal) {
          this.error.set('No pudimos encontrar una receta sorpresa.');
          return;
        }

        this.router.navigate(['/meal', meal.idMeal]);
      },
      error: () => {
        this.error.set('No pudimos cargar una receta sorpresa.');
        this.loading.set(false);
      }
    });
  }

  loadFavoriteMeals(): void {
    const favoriteIds = this.favoritesService.favoriteMealIds();

    this.loading.set(true);
    this.error.set('');

    this.mealsService.getMealsByIds(favoriteIds).subscribe({
      next: (meals: Meal[]) => {
        this.favoriteMeals.set(meals);
        this.meals.set(meals);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar tus recetas favoritas.');
        this.loading.set(false);
      }
    });
  }

  applyFavoriteFilters(): void {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    const area = this.selectedArea();

    const filteredMeals = this.favoriteMeals().filter((meal) => {
      const matchesName =
        !term || meal.strMeal.toLowerCase().includes(term);

      const matchesCategory =
        category === 'all' || meal.strCategory === category;

      const matchesArea =
        area === 'all' || meal.strArea === area;

      return matchesName && matchesCategory && matchesArea;
    });

    this.meals.set(filteredMeals);
  }

  isFavorite(id: string): boolean {
    return this.favoritesService.isFavorite(id);
  }

  toggleFavorite(id: string): void {
    this.favoritesService.toggleFavorite(id);

    if (this.showOnlyFavorites()) {
      this.loadFavoriteMeals();
    }
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