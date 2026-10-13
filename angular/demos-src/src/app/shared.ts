import { Component, Injectable, computed, inject, input, signal } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

/* =========================================================
   Shared pieces for the demos: an icon, the greenhouse's services,
   and an interceptor that writes every HTTP request into a log.
   The demos use the page's own CSS classes (styles/base.css).
   ========================================================= */

const ICON_PATHS: Record<string, string> = {
    sprout: 'M7 20h10M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z',
    drop: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z',
    thermometer: 'M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
};

@Component({
    selector: 'app-icon',
    template: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             [attr.width]="size()" [attr.height]="size()" aria-hidden="true">
            <path [attr.d]="d()" />
        </svg>`,
    host: { class: 'ng-icon' },
})
export class Icon {
    readonly name = input('sprout');
    readonly size = input(22);
    protected readonly d = computed(() => ICON_PATHS[this.name()] ?? ICON_PATHS['sprout']);
}

export interface Plant {
    id: number;
    name: string;
    water: number;
}

/** One sensor for the whole greenhouse: every component that injects it sees the same temperature. */
@Injectable({ providedIn: 'root' })
export class SensorService {
    readonly temp = signal(21);
    warm() { this.temp.update(t => t + 1); }
    cool() { this.temp.update(t => t - 1); }
}

/** Who is logged in, for the router demo's guard. */
@Injectable({ providedIn: 'root' })
export class AuthState {
    readonly user = signal<string | null>(null);
}

/** The HTTP demo shows what the interceptor saw. */
@Injectable({ providedIn: 'root' })
export class RequestLog {
    readonly lines = signal<string[]>([]);
    add(line: string) { this.lines.update(l => [...l.slice(-7), line]); }
}

export const logRequests: HttpInterceptorFn = (req, next) => {
    const log = inject(RequestLog);
    const started = performance.now();
    log.add(`→ ${req.method} ${req.urlWithParams.replace('https://jsonplaceholder.typicode.com', '')}`);
    return next(req).pipe(tap({
        next: (event) => {
            if ('status' in event) log.add(`← ${event.status} · ${Math.round(performance.now() - started)} ms`);
        },
        error: () => log.add('← შეცდომა: ქსელი მიუწვდომელია'),
    }));
};
