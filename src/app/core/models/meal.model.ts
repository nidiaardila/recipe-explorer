export interface MealResponse {
  meals: Meal[] | null;
}

export interface CategoriesResponse {
  categories: MealCategory[];
}

export interface AreasResponse {
  meals: MealArea[] | null;
}

export interface MealCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealArea {
  strArea: string;
  strCountry?: string;
}

export interface MealIngredient {
  ingredient: string;
  measure: string;
}

export interface Meal {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string | null;
  strCategory?: string | null;
  strArea?: string | null;
  strInstructions?: string | null;
  strMealThumb: string;
  strTags?: string | null;
  strYoutube?: string | null;
  strSource?: string | null;
  strImageSource?: string | null;
  strCreativeCommonsConfirmed?: string | null;
  dateModified?: string | null;

  [key: string]: string | null | undefined;
}