import { Type, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideLocationMocks } from '@angular/common/testing';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { logRequests } from './app/shared';
import {
    DEMO_ROUTES, DemoBindings, DemoComponents, DemoControl, DemoDirectives,
    DemoHttp, DemoIo, DemoRouter, DemoServices, DemoSignals,
} from './app/topic-demos';
import { PuzzleCounter, PuzzleDirective, PuzzleList, PuzzleService, PuzzleWater } from './app/puzzle-demos';

/* =========================================================
   One small Angular application, no root component. Every demo is
   registered as a custom element (Angular Elements), so the plain
   page can drop <ng-demo-signals> wherever it wants one.
   The router uses location mocks: it never touches the page's URL.
   ========================================================= */

const ELEMENTS: Record<string, Type<unknown>> = {
    'ng-demo-components': DemoComponents,
    'ng-demo-bindings': DemoBindings,
    'ng-demo-signals': DemoSignals,
    'ng-demo-control': DemoControl,
    'ng-demo-io': DemoIo,
    'ng-demo-directives': DemoDirectives,
    'ng-demo-services': DemoServices,
    'ng-demo-router': DemoRouter,
    'ng-demo-http': DemoHttp,
    'ng-puzzle-counter': PuzzleCounter,
    'ng-puzzle-list': PuzzleList,
    'ng-puzzle-water': PuzzleWater,
    'ng-puzzle-service': PuzzleService,
    'ng-puzzle-directive': PuzzleDirective,
};

createApplication({
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([logRequests])),
        provideRouter(DEMO_ROUTES, withComponentInputBinding()),
        provideLocationMocks(),
    ],
})
    .then((app) => {
        for (const [tag, component] of Object.entries(ELEMENTS)) {
            customElements.define(tag, createCustomElement(component, { injector: app.injector }));
        }
        document.documentElement.dataset['ngDemos'] = 'ready';
    })
    .catch((err) => console.error(err));
