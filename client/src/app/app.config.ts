import { provideHttpClient, withXsrfConfiguration } from "@angular/common/http";
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideHlmDatePickerConfig } from "@spartan-ng/helm/date-picker";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: "csrftoken",
        headerName: "X-CSRFToken",
      }),
    ),
    provideHlmDatePickerConfig({
      formatDate: (date: unknown) => {
        if (date instanceof Date) {
          const d = String(date.getDate()).padStart(2, "0");
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const y = date.getFullYear();
          return `${d}/${m}/${y}`;
        }
        return date ? String(date) : "";
      },
      autoCloseOnSelect: true,
    }),
  ],
};
