import { inject, Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { Observable, of, switchMap, throwError } from 'rxjs';
import {HttpService} from "@shared/services/http.service";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _http = inject(HttpService);
    private _userService = inject(UserService);
    private _jwtHelperService =  inject(JwtHelperService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { user: string; pass: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._http.post('auth/login', credentials).pipe(
            switchMap(({data}: any) => {
                // Store the access token in the local storage
                this.accessToken = data;

                // Set the authenticated flag to true
                this._authenticated = true;
                const dataToken = this._jwtHelperService.decodeToken(data);

                // Store the user on the user service
                this._userService.user = {
                    id: dataToken.sub,
                    name: dataToken.name,
                    email: dataToken.email
                };

                // Return a new observable with the response
                return of(data);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        if (this._authenticated) {
            return of(true);
        }
        if (!this._authenticated && this.accessToken) {
            this._authenticated = true;
            const dataToken = this._jwtHelperService.decodeToken(this.accessToken);

            // Store the user on the user service
            this._userService.user = {
                id: dataToken.sub,
                name: dataToken.name,
                email: dataToken.email
            };
            return of(true);
        }

        if (!this.accessToken) {
            return of(false);
        }

        return of(false);
    }
}
