import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatWorkspaceComponent } from './chat/chat-workspace.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: 'c/:id', component: ChatWorkspaceComponent },
      { path: '',       component: ChatWorkspaceComponent },
    ],
  },
  { path: '',   redirectTo: '/app', pathMatch: 'full' },
  { path: '**', redirectTo: '/app' },
];
