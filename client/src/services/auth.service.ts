import { LoginDto, OnboardingDto, User } from "@/models/auth.model";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { catchError, Observable, of, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _endpoint = "/api/auth";

  public readonly currentUser = signal<User | null>(null);
  public readonly isLoaded = signal<boolean>(false);

  login(dto: LoginDto): Observable<User> {
    return this._http.post<User>(`${this._endpoint}/login/`, dto).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isLoaded.set(true);
      }),
    );
  }

  onboarding(dto: OnboardingDto): Observable<User> {
    return this._http.post<User>(`${this._endpoint}/onboarding/`, dto).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isLoaded.set(true);
      }),
    );
  }

  logout(): Observable<void> {
    return this._http.post<void>(`${this._endpoint}/logout/`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.isLoaded.set(true);
      }),
    );
  }

  me(): Observable<User> {
    return this._http.get<User>(`${this._endpoint}/me/`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isLoaded.set(true);
      }),
    );
  }

  loadCurrentUser(): Observable<User | null> {
    return this.me().pipe(
      catchError(() => {
        this.currentUser.set(null);
        this.isLoaded.set(true);
        return of(null);
      }),
    );
  }
}
