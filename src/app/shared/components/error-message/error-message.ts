import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-message',
  imports: [MatIconModule],
  templateUrl: './error-message.html',
  styleUrl: './error-message.scss'
})
export class ErrorMessage {
  @Input() message = 'Ha ocurrido un error inesperado.';
}