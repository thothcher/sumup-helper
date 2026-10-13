'use strict';

/* Quiz: which topic does this snippet belong to?
   explain may contain HTML (write < as &lt;). */

const QUIZ = [
    { code: "@Component({\n  selector: 'app-plant-card',\n  templateUrl: './plant-card.html',\n})", answer: 'components', explain: '@Component კლასს შაბლონს და selector-ს უკავშირებს.' },
    { code: '<app-plant-card name="პიტნა" />', answer: 'components', explain: 'selector-ით კომპონენტი სხვა შაბლონში ჩაჯდა.' },
    { code: 'imports: [PlantCard, FormsModule],', answer: 'components', explain: 'standalone კომპონენტი იმას იყენებს, რაც imports-ში წერია.' },
    { code: 'bootstrapApplication(App, appConfig);', answer: 'components', explain: 'აპი ერთი root კომპონენტიდან იწყება.' },

    { code: '<input [(ngModel)]="name" />', answer: 'bindings', explain: '„ბანანი ყუთში“: ორმხრივი binding.' },
    { code: '<button [disabled]="busy()" (click)="save()">შენახვა</button>', answer: 'bindings', explain: '[ ] კლასიდან ელემენტში, ( ) ელემენტიდან კლასში.' },
    { code: '<div [class.hot]="temp() > 30">', answer: 'bindings', explain: 'class binding: კლასი პირობით.' },
    { code: '<p>{{ name() }}: {{ temp() }}°C</p>', answer: 'bindings', explain: 'interpolation: მნიშვნელობა ტექსტად.' },

    { code: 'temp = signal(21);', answer: 'signals', explain: 'signal: მნიშვნელობა, რომელიც ცვლილებაზე Angular-ს ატყობინებს.' },
    { code: 'fahrenheit = computed(() => this.temp() * 9 / 5 + 32);', answer: 'signals', explain: 'computed სხვა სიგნალებიდან ითვლება.' },
    { code: 'this.temp.update(t => t + 1);', answer: 'signals', explain: 'update წინა მნიშვნელობიდან ახალს ითვლის.' },
    { code: "effect(() => localStorage.setItem('temp', String(this.temp())));", answer: 'signals', explain: 'effect სიგნალის ცვლილებაზე გარე სამყაროს ეხება.' },

    { code: '@for (p of plants(); track p.id) {\n  <li>{{ p.name }}</li>\n}', answer: 'control', explain: '@for სიას ხატავს, track ელემენტებს ცნობს.' },
    { code: '} @empty {\n  <li>ცარიელია</li>\n}', answer: 'control', explain: '@empty: ცარიელი სიის ბლოკი.' },
    { code: "@switch (season()) {\n  @case ('winter') { <p>ცივა</p> }\n}", answer: 'control', explain: '@switch: ერთი მნიშვნელობა, ბევრი ვარიანტი.' },
    { code: '@defer (on viewport) {\n  <app-chart />\n}', answer: 'control', explain: '@defer ნაწილს მოგვიანებით ტვირთავს.' },

    { code: 'plant = input.required<Plant>();', answer: 'io', explain: 'input(): მონაცემი მშობლიდან.' },
    { code: 'watered = output<string>();', answer: 'io', explain: 'output(): ივენთი მშობლისთვის.' },
    { code: 'level = model(50);', answer: 'io', explain: 'model(): ორმხრივი input, [(level)].' },
    { code: '<app-plant-row (watered)="log($event)" />', answer: 'io', explain: 'მშობელი შვილის output-ს უსმენს.' },

    { code: "@Directive({ selector: '[appHighlight]' })", answer: 'directives', explain: 'ატრიბუტის დირექტივა: ელემენტს ქცევას ამატებს.' },
    { code: "host: { '(mouseenter)': 'on.set(true)' },", answer: 'directives', explain: 'host: ელემენტის ივენთები დირექტივიდან.' },
    { code: '<li [appHighlight]="\'gold\'">პიტნა</li>', answer: 'directives', explain: 'დირექტივის input alias-ით.' },
    { code: 'private el = inject(ElementRef);', answer: 'directives', explain: 'ElementRef: წვდომა თავად host ელემენტზე.' },

    { code: "@Injectable({ providedIn: 'root' })\nexport class SensorService {}", answer: 'services', explain: 'სერვისი: ერთი ეგზემპლარი მთელ აპზე.' },
    { code: 'private sensor = inject(SensorService);', answer: 'services', explain: 'inject() DI-ს სთხოვს სერვისს.' },
    { code: 'providers: [SensorService],', answer: 'services', explain: 'კომპონენტის providers: საკუთარი ეგზემპლარი.' },
    { code: "export const API_URL = new InjectionToken<string>('API_URL');", answer: 'services', explain: 'InjectionToken: არა-კლასი მნიშვნელობა DI-სთვის.' },

    { code: "{ path: 'plants/:id', component: PlantPage }", answer: 'router', explain: 'მარშრუტი დინამიური :id პარამეტრით.' },
    { code: '<a routerLink="/plants">მცენარეები</a>', answer: 'router', explain: 'routerLink გვერდს გადატვირთვის გარეშე ცვლის.' },
    { code: '<router-outlet />', answer: 'router', explain: 'ადგილი, სადაც არჩეული გვერდი ჩაჯდება.' },
    { code: "canActivate: [authGuard],", answer: 'router', explain: 'guard წყვეტს, შეიძლება თუ არა გვერდზე შესვლა.' },

    { code: 'provideHttpClient(withInterceptors([authInterceptor])),', answer: 'http', explain: 'HttpClient-ის ჩართვა interceptor-ით.' },
    { code: "this.http.get<Plant[]>('/api/plants')", answer: 'http', explain: 'HttpClient Observable-ს აბრუნებს.' },
    { code: 'plant = httpResource<Plant>(() => `/api/plants/${this.id()}`);', answer: 'http', explain: 'httpResource: მოთხოვნა, რომელიც სიგნალს მიჰყვება.' },
    { code: 'this.query$.pipe(debounceTime(300), switchMap(q => this.api.search(q)))', answer: 'http', explain: 'RxJS: დაელოდე აკრეფას, ძველი მოთხოვნა გააუქმე.' },
];

const QUIZ_LENGTH = 12;
