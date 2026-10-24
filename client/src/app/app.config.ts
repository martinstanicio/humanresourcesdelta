import { routes } from "./app.routes";
import { provideHttpClient, withXsrfConfiguration } from "@angular/common/http";
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: "csrftoken",
        headerName: "X-CSRFToken",
      }),
    ),
  ],
};
