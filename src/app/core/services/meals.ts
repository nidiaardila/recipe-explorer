import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CategoriesResponse,
  Meal,
  MealCategory,
  MealIngredient,
  MealResponse
} from '../models/meal.model';

@Injectable({
  providedIn: 'root'
})
export class MealsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://www.themealdb.com/api/json/v1/1';

  searchMeals(term: string): Observable<Meal[]> {
    return this.http
      .get<MealResponse>(`${this.apiUrl}/search.php`, {
        params: {
          s: term
        }
      })
      .pipe(map((response) => response.meals ?? []));
  }

  getMealById(id: string): Observable<Meal | undefined> {
    return this.http
      .get<MealResponse>(`${this.apiUrl}/lookup.php`, {
        params: {
          i: id
        }
      })
      .pipe(map((response) => response.meals?.[0]));
  }

  getCategories(): Observable<MealCategory[]> {
    return this.http
      .get<CategoriesResponse>(`${this.apiUrl}/categories.php`)
      .pipe(map((response) => response.categories));
  }

  filterByCategory(category: string): Observable<Meal[]> {
    return this.http
      .get<MealResponse>(`${this.apiUrl}/filter.php`, {
        params: {
          c: category
        }
      })
      .pipe(map((response) => response.meals ?? []));
  }

  getRandomMeal(): Observable<Meal | undefined> {
    return this.http
      .get<MealResponse>(`${this.apiUrl}/random.php`)
      .pipe(map((response) => response.meals?.[0]));
  }

  getIngredients(meal: Meal): MealIngredient[] {
    const ingredients: MealIngredient[] = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]?.trim();
      const measure = meal[`strMeasure${i}`]?.trim();

      if (ingredient) {
        ingredients.push({
          ingredient,
          measure: measure || ''
        });
      }
    }

    return ingredients;
  }
}