import { Component, Directive, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { Location } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet, Routes } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthState, Icon, Plant, RequestLog, SensorService } from './shared';

/* =========================================================
   The "გაუშვი" demos, one per topic. Each becomes a custom element
   (main.ts), and the page drops it into the topic's output box.
   The running example: a greenhouse ("სათბური").
   ========================================================= */

/* ---------- 1. Components ---------- */

@Component({
    selector: 'app-plant-card',
    imports: [Icon],
    template: `
        <span class="r-leaf-card">
            <app-icon [size]="size()" />
            {{ name() }}
        </span>`,
})
export class PlantCard {
    readonly name = input.required<string>();
    readonly size = input(26);
}

@Component({
    selector: 'demo-components',
    imports: [PlantCard],
    template: `
        <p class="demo-note">ეს ნამდვილი Angular-ია: ერთი PlantCard კომპონენტი სამჯერ, სამი სხვადასხვა input-ით.</p>
        <section class="r-garden" aria-label="სათბური">
            <app-plant-card name="პიტნა" />
            <app-plant-card name="ბაზილიკი" [size]="36" />
            <app-plant-card name="რეჰანი" [size]="20" />
        </section>
        <p class="demo-note">&lt;app-plant-card&gt; selector-ით ჩაჯდა. კლასში ცხოვრობს მონაცემი, შაბლონში მისი ხედი.</p>`,
})
export class DemoComponents {}

/* ---------- 2. Bindings ---------- */

@Component({
    selector: 'demo-bindings',
    imports: [FormsModule, Icon],
    template: `
        <div class="demo-form">
            <label>მცენარე [(ngModel)]
                <input [(ngModel)]="name" placeholder="პიტნა" />
            </label>
            <label>ტემპერატურა: {{ temp() }}°C
                <input type="range" min="5" max="40" [value]="temp()" (input)="onSlide($event)" />
            </label>
        </div>
        <div class="r-card ng-preview" [class.is-hot]="temp() > 30" [class.is-cold]="temp() < 12">
            <app-icon [name]="temp() > 30 ? 'sun' : 'sprout'" />
            <b>{{ name() || 'უსახელო' }}</b>
            <span>{{ temp() }}°C</span>
            <button type="button" class="btn btn--sm" [disabled]="temp() > 35" (click)="water()">მორწყვა</button>
        </div>
        <p class="demo-note">{{ note() }}</p>`,
})
export class DemoBindings {
    readonly name = signal('პიტნა');
    readonly temp = signal(22);
    readonly note = signal('ჩაწერე სახელი და გაწიე სლაიდერი: 30°-ზე მეტზე [class.is-hot], 35°-ზე მეტზე [disabled].');

    onSlide(event: Event) {
        this.temp.set(Number((event.target as HTMLInputElement).value));
    }

    water() {
        this.note.set(`(click)="water()" → ${this.name() || 'უსახელო'} მოირწყა`);
    }
}

/* ---------- 3. Signals ---------- */

@Component({
    selector: 'demo-signals',
    template: `
        <div class="demo-btns">
            <button type="button" class="btn btn--sm" (click)="temp.update(t => t - 1)">update(−1)</button>
            <button type="button" class="btn btn--sm btn--primary" (click)="temp.update(t => t + 1)">update(+1)</button>
            <button type="button" class="btn btn--sm" (click)="temp.set(21)">set(21)</button>
        </div>
        <div class="ng-graph" aria-label="სიგნალების გრაფი">
            <span class="ng-node">temp <b>{{ temp() }}°C</b></span>
            <span class="ng-edge" aria-hidden="true"></span>
            <span class="ng-node">fahrenheit <b>{{ fahrenheit() }}°F</b></span>
            <span class="ng-edge" aria-hidden="true"></span>
            <span class="ng-node" [class.is-warn]="status() !== 'კომფორტული'">status <b>{{ status() }}</b></span>
        </div>
        <pre class="demo-console">{{ lines().join('\n') }}</pre>
        <p class="demo-note">computed თავიდან მხოლოდ მაშინ ითვლება, როცა temp იცვლება. effect ცვლილების შემდეგ ერთხელ ეშვება.</p>`,
})
export class DemoSignals {
    readonly temp = signal(21);
    readonly fahrenheit = computed(() => Math.round((this.temp() * 9) / 5 + 32));
    readonly status = computed(() => (this.temp() > 28 ? 'ცხელა' : this.temp() < 15 ? 'ცივა' : 'კომფორტული'));
    readonly lines = signal<string[]>([]);

    constructor() {
        effect(() => {
            const t = this.temp();
            const s = this.status();
            untracked(() => this.lines.update(l => [...l.slice(-5), `effect: temp = ${t}, status = '${s}'`]));
        });
    }
}

/* ---------- 4. Control flow ---------- */

const NAMES = ['ლავანდა', 'როზმარინი', 'ტარხუნა', 'ქონდარი', 'კამა', 'ნიახური'];

@Component({
    selector: 'demo-control',
    template: `
        <div class="demo-btns">
            <button type="button" class="btn btn--sm btn--primary" (click)="add()">+ მცენარე</button>
            <button type="button" class="btn btn--sm" (click)="plants.set([])">გასუფთავება</button>
            @for (f of filters; track f.id) {
                <button type="button" class="chip" [attr.aria-pressed]="filter() === f.id" (click)="filter.set(f.id)">{{ f.label }}</button>
            }
        </div>
        <ul class="r-list">
            @for (p of visible(); track p.id; let i = $index) {
                <li class="ng-row">
                    <span>{{ i + 1 }}. {{ p.name }}</span>
                    @switch (state(p)) {
                        @case ('dry') { <span class="demo-pill demo-pill--bad">მშრალია</span> }
                        @case ('ok') { <span class="demo-pill">კარგადაა</span> }
                        @default { <span class="demo-pill demo-pill--warn">ზედმეტი წყალი</span> }
                    }
                    <button type="button" class="btn btn--sm" (click)="remove(p.id)">წაშლა</button>
                </li>
            } @empty {
                <li>სათბური ცარიელია: ეს &#64;empty ბლოკია.</li>
            }
        </ul>
        @if (dryCount() > 0) {
            <p class="demo-note">&#64;if: მოსარწყავია {{ dryCount() }} მცენარე.</p>
        } @else {
            <p class="demo-note">&#64;else: ყველა მცენარე კარგადაა.</p>
        }`,
})
export class DemoControl {
    private nextId = 4;
    readonly filters = [{ id: 'all', label: 'ყველა' }, { id: 'dry', label: 'მშრალი' }] as const;
    readonly filter = signal<'all' | 'dry'>('all');
    readonly plants = signal<Plant[]>([
        { id: 1, name: 'პიტნა', water: 20 },
        { id: 2, name: 'ბაზილიკი', water: 60 },
        { id: 3, name: 'რეჰანი', water: 95 },
    ]);
    readonly visible = computed(() => this.plants().filter(p => this.filter() === 'all' || this.state(p) === 'dry'));
    readonly dryCount = computed(() => this.plants().filter(p => this.state(p) === 'dry').length);

    state(p: Plant) {
        return p.water < 30 ? 'dry' : p.water > 90 ? 'wet' : 'ok';
    }

    add() {
        const name = NAMES[(this.nextId - 4) % NAMES.length];
        this.plants.update(list => [...list, { id: this.nextId++, name, water: Math.round(Math.random() * 100) }]);
    }

    remove(id: number) {
        this.plants.update(list => list.filter(p => p.id !== id));
    }
}

/* ---------- 5. input(), output(), model() ---------- */

@Component({
    selector: 'app-plant-row',
    template: `
        <div class="r-card ng-row">
            <b>{{ plant().name }}</b>
            <span class="ng-meter" aria-hidden="true"><span [style.width.%]="level()"></span></span>
            <span>{{ level() }}%</span>
            <button type="button" class="btn btn--sm" (click)="change(-10)">−10</button>
            <button type="button" class="btn btn--sm" (click)="change(10)">+10</button>
            <button type="button" class="btn btn--sm btn--primary" (click)="water()">მორწყვა</button>
        </div>`,
})
export class PlantRow {
    readonly plant = input.required<Plant>();
    readonly level = model(50);
    readonly watered = output<string>();

    change(by: number) {
        this.level.update(v => Math.min(100, Math.max(0, v + by)));
    }

    water() {
        this.level.set(100);
        this.watered.emit(this.plant().name);
    }
}

@Component({
    selector: 'demo-io',
    imports: [PlantRow],
    template: `
        <app-plant-row [plant]="mint" [(level)]="mintLevel" (watered)="onWatered($event)" />
        <app-plant-row [plant]="basil" [(level)]="basilLevel" (watered)="onWatered($event)" />
        <p class="r-card"><b>მშობელი ხედავს:</b> პიტნა {{ mintLevel() }}%, ბაზილიკი {{ basilLevel() }}%</p>
        <pre class="demo-console">{{ events().join('\n') || 'დააჭირე „მორწყვას“: შვილი output-ით შეატყობინებს მშობელს.' }}</pre>`,
})
export class DemoIo {
    readonly mint: Plant = { id: 1, name: 'პიტნა', water: 40 };
    readonly basil: Plant = { id: 2, name: 'ბაზილიკი', water: 70 };
    readonly mintLevel = signal(40);
    readonly basilLevel = signal(70);
    readonly events = signal<string[]>([]);

    onWatered(name: string) {
        this.events.update(e => [...e.slice(-4), `(watered) → მშობელმა მიიღო: '${name}'`]);
    }
}

/* ---------- 6. Directives ---------- */

@Directive({
    selector: '[appHighlight]',
    host: {
        '(mouseenter)': 'enter()',
        '(mouseleave)': 'on.set(false)',
        '[style.background]': "on() ? (color() || '#fde68a') : null",
        '[style.transition]': "'background .25s'",
    },
})
export class Highlight {
    readonly color = input('', { alias: 'appHighlight' });
    readonly lit = output<void>();
    readonly on = signal(false);

    enter() {
        this.on.set(true);
        this.lit.emit();
    }
}

@Component({
    selector: 'demo-directives',
    imports: [Highlight],
    template: `
        <ul class="r-list">
            <li appHighlight (lit)="count('ნაგულისხმევი')">appHighlight: ნაგულისხმევი ფერი</li>
            <li [appHighlight]="'#bbf7d0'" (lit)="count('მწვანე')">[appHighlight]="'#bbf7d0'"</li>
            <li [appHighlight]="'#fbcfe8'" (lit)="count('ვარდისფერი')">[appHighlight]="'#fbcfe8'"</li>
        </ul>
        <p class="demo-note">მიიტანე მაუსი ხაზებთან. დირექტივამ ჩვეულებრივ &lt;li&gt;-ს ახალი ქცევა შესძინა: {{ hovers() }} hover{{ last() ? ', ბოლო: ' + last() : '' }}.</p>`,
})
export class DemoDirectives {
    readonly hovers = signal(0);
    readonly last = signal('');

    count(name: string) {
        this.hovers.update(n => n + 1);
        this.last.set(name);
    }
}

/* ---------- 7. Services & DI ---------- */

@Component({
    selector: 'app-sensor-panel',
    imports: [Icon],
    template: `
        <div class="r-card ng-row">
            <app-icon name="thermometer" />
            <b>{{ title() }}</b>
            <span>{{ sensor.temp() }}°C</span>
            <button type="button" class="btn btn--sm" (click)="sensor.cool()">−1</button>
            <button type="button" class="btn btn--sm btn--primary" (click)="sensor.warm()">+1</button>
        </div>`,
})
export class SensorPanel {
    readonly title = input('');
    protected readonly sensor = inject(SensorService);
}

@Component({
    selector: 'app-own-sensor',
    imports: [SensorPanel],
    providers: [SensorService],
    template: `<app-sensor-panel title="სარდაფი (საკუთარი providers)" />`,
})
export class OwnSensor {}

@Component({
    selector: 'demo-services',
    imports: [SensorPanel, OwnSensor],
    template: `
        <app-sensor-panel title="ფანჯარა" />
        <app-sensor-panel title="კარი" />
        <app-own-sensor />
        <p class="demo-note">ფანჯარა და კარი ერთსა და იმავე SensorService-ს იყენებენ (providedIn: 'root'), ამიტომ ერთად იცვლებიან. სარდაფს თავისი ეგზემპლარი აქვს.</p>`,
})
export class DemoServices {}

/* ---------- 8. Router: the real Angular Router, inside a tiny browser ---------- */

@Component({ host: { class: 'ng-row' }, template: `<b>მთავარი</b> სათბურის მთავარი გვერდი.` })
export class HomePage {}

@Component({
    host: { class: 'ng-row' },
    imports: [RouterLink],
    template: `
        <b>მცენარეები</b>
        <a routerLink="/plants/1">პიტნა</a> · <a routerLink="/plants/2">ბაზილიკი</a> · <a routerLink="/plants/3">რეჰანი</a>`,
})
export class PlantListPage {}

@Component({
    host: { class: 'ng-row' },
    template: `<b>მცენარე #{{ id() }}</b> input-ში მოვიდა: '{{ id() }}' ({{ typeOf() }})`,
})
export class PlantPage {
    readonly id = input.required<string>();
    protected readonly typeOf = computed(() => typeof this.id());
}

@Component({ host: { class: 'ng-row' }, template: `<b>ადმინი</b> გამარჯობა, {{ auth.user() }}! canActivate გაგიშვა.` })
export class AdminPage {
    protected readonly auth = inject(AuthState);
}

@Component({
    host: { class: 'ng-row' },
    template: `<b>შესვლა</b> <button type="button" class="btn btn--sm btn--primary" (click)="login()">შესვლა (ნინო)</button>`,
})
export class LoginPage {
    private readonly auth = inject(AuthState);
    private readonly router = inject(Router);

    login() {
        this.auth.user.set('ნინო');
        this.router.navigateByUrl('/admin');
    }
}

@Component({ host: { class: 'ng-row' }, template: `<b>404</b> ასეთი გვერდი არ არსებობს: ეს '**' მარშრუტია.` })
export class NotFoundPage {}

export const DEMO_ROUTES: Routes = [
    { path: '', component: HomePage },
    { path: 'plants', component: PlantListPage },
    { path: 'plants/:id', component: PlantPage },
    {
        path: 'admin',
        component: AdminPage,
        canActivate: [() => (inject(AuthState).user() ? true : inject(Router).parseUrl('/login'))],
    },
    { path: 'login', component: LoginPage },
    { path: '**', component: NotFoundPage },
];

@Component({
    selector: 'demo-router',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    template: `
        <div class="browser">
            <div class="browser__bar">
                <button type="button" class="btn btn--sm" aria-label="უკან" (click)="location.back()">←</button>
                <span class="browser__url">greenhouse.ge{{ url() }}</span>
            </div>
            <div class="browser__body">
                <nav class="browser__nav" aria-label="routerLink">
                    <b>routerLink</b>
                    <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">/</a>
                    <a routerLink="/plants" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">/plants</a>
                    <a routerLink="/plants/2" routerLinkActive="is-active">/plants/2</a>
                    <a routerLink="/admin" routerLinkActive="is-active">/admin</a>
                    <a routerLink="/nope">/nope</a>
                </nav>
                <div class="r-card"><router-outlet /></div>
            </div>
        </div>
        <p class="demo-note">ეს ნამდვილი Angular Router-ია: მისამართი მხოლოდ ამ პატარა ბრაუზერში იცვლება. /admin-ზე guard ჯერ /login-ზე გადაგამისამართებს.</p>`,
})
export class DemoRouter {
    protected readonly location = inject(Location);
    private readonly router = inject(Router);
    protected readonly url = toSignal(
        this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url)),
        { initialValue: '/' },
    );

    constructor() {
        inject(AuthState).user.set(null);
        this.router.navigateByUrl('/');
    }
}

/* ---------- 9. HTTP ---------- */

interface User {
    id: number;
    name: string;
    email: string;
    address: { city: string };
}

@Component({
    selector: 'demo-http',
    template: `
        <div class="demo-btns">
            @for (id of ids; track id) {
                <button type="button" class="chip" [attr.aria-pressed]="userId() === id" (click)="userId.set(id)">მომხმარებელი {{ id }}</button>
            }
            <button type="button" class="btn btn--sm" (click)="user.reload()">reload()</button>
        </div>
        @if (user.isLoading()) {
            <p class="demo-note">იტვირთება... (isLoading)</p>
        } @else if (user.error()) {
            <p class="demo-error">ვერ ჩაიტვირთა. შეამოწმე ინტერნეტი. (error)</p>
        } @else if (user.hasValue()) {
            <div class="r-card"><b>{{ user.value().name }}</b><span>{{ user.value().email }}</span><span>{{ user.value().address.city }}</span></div>
        }
        <p class="pane__title">interceptor-ის ჟურნალი</p>
        <pre class="demo-console">{{ log.lines().join('\n') || '...' }}</pre>`,
})
export class DemoHttp {
    readonly ids = [1, 2, 3];
    readonly userId = signal(1);
    readonly user = httpResource<User>(() => `https://jsonplaceholder.typicode.com/users/${this.userId()}`);
    protected readonly log = inject(RequestLog);
}
