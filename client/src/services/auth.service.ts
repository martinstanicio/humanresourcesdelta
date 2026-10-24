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

  login(dto: LoginDto): Observable<User> {
    return this._http
      .post<User>(`${this._endpoint}/login/`, dto)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  onboarding(dto: OnboardingDto): Observable<User> {
    return this._http
      .post<User>(`${this._endpoint}/onboarding/`, dto)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  logout(): Observable<void> {
    return this._http
      .post<void>(`${this._endpoint}/logout/`, {})
      .pipe(tap(() => this.currentUser.set(null)));
  }

  me(): Observable<User> {
    return this._http
      .get<User>(`${this._endpoint}/me/`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  loadCurrentUser(): Observable<User | null> {
    return this.me().pipe(
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }
}
