import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  standalone: true
})
export class AppComponent {
  title = 'studyjarviswebapp';
}
