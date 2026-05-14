import { Routes } from '@angular/router';
import { MealDetail } from './features/meals/pages/meal-detail/meal-detail';
import { MealsList } from './features/meals/pages/meals-list/meals-list';

export const routes: Routes = [
  {
    path: '',
    component: MealsList
  },
  {
    path: 'meal/:id',
    component: MealDetail
  },
  {
    path: 'favorites',
    redirectTo: ''
  },
  {
    path: '**',
    redirectTo: ''
  }
];