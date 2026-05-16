import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MealArea, MealCategory } from '../../../../core/models/meal.model';

@Component({
  selector: 'app-meals-filter',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './meals-filter.html',
  styleUrl: './meals-filter.scss'
})
export class MealsFilter {
  @Input() searchTerm = '';
  @Input() selectedCategory = 'all';
  @Input() selectedArea = 'all';
  @Input() categories: MealCategory[] = [];
  @Input() areas: MealArea[] = [];

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() selectedCategoryChange = new EventEmitter<string>();
  @Output() selectedAreaChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();
}