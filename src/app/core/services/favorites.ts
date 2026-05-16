import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly storageKey = 'recipe-explorer-favorites';

  readonly favoriteMealIds = signal<string[]>(this.loadFavorites());

  isFavorite(id: string): boolean {
    return this.favoriteMealIds().includes(id);
  }

  toggleFavorite(id: string): void {
    const currentFavorites = this.favoriteMealIds();

    const updatedFavorites = currentFavorites.includes(id)
      ? currentFavorites.filter((favoriteId) => favoriteId !== id)
      : [...currentFavorites, id];

    this.favoriteMealIds.set(updatedFavorites);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedFavorites));
  }

  private loadFavorites(): string[] {
    const savedFavorites = localStorage.getItem(this.storageKey);

    if (!savedFavorites) {
      return [];
    }

    try {
      const parsedFavorites = JSON.parse(savedFavorites);

      return Array.isArray(parsedFavorites) ? parsedFavorites : [];
    } catch {
      return [];
    }
  }
}