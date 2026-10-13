'use strict';

/* =========================================================
   PRACTICE DATA
   BUGS     — find the line with the bug
   OUTPUTS  — predict what happens
   (PUZZLES live in puzzles.js)
   ========================================================= */

/**
 * bug:  index of the line that causes the problem
 * fix:  the corrected version of that line
 */
const BUGS = [
    {
        topic: 'signals',
        goal: 'ეკრანზე ტემპერატურა უნდა ჩანდეს: 21°C',
        lines: [
            'export class Greenhouse {',
            '  temp = signal(21);',
            '}',
            '',
            '<!-- greenhouse.html -->',
            '<p>ტემპერატურა: {{ temp }}°C</p>',
        ],
        bug: 5,
        fix: '<p>ტემპერატურა: {{ temp() }}°C</p>',
        hint: 'სიგნალი მნიშვნელობაა თუ ფუნქცია, რომელიც მნიშვნელობას აბრუნებს?',
        explain: 'სიგნალი ფუნქციაა: მნიშვნელობის მისაღებად ის უნდა გამოიძახო. {{ temp }} რიცხვს არ აჩვენებს, {{ temp() }} კი აჩვენებს 21-ს.',
    },
    {
        topic: 'signals',
        goal: 'ღილაკი ტემპერატურას 1-ით უნდა ზრდიდეს',
        lines: [
            'temp = signal(21);',
            '',
            'warm() {',
            '  this.temp.set(this.temp + 1);',
            '}',
        ],
        bug: 3,
        fix: '  this.temp.update(t => t + 1);',
        hint: 'რა არის this.temp: რიცხვი თუ სიგნალი?',
        explain: 'this.temp თავად სიგნალია და არა რიცხვი, ამიტომ this.temp + 1 რიცხვს არ იძლევა. მნიშვნელობა ასე იკითხება: this.temp(), ან სულაც update(t => t + 1).',
    },
    {
        topic: 'signals',
        goal: 'ახალი მცენარე სიაში უნდა გამოჩნდეს',
        lines: [
            'plants = signal<Plant[]>([]);',
            '',
            'add(plant: Plant) {',
            '  this.plants().push(plant);',
            '}',
        ],
        bug: 3,
        fix: '  this.plants.update(list => [...list, plant]);',
        hint: 'შეიტყობს თუ არა სიგნალი, რომ მის მასივში რაღაც შეიცვალა?',
        explain: 'push ძველ მასივს ცვლის, სიგნალი კი ამის შესახებ არაფერს იგებს: set ან update არ გამოძახებულა. ახალი მასივი update-ით სიგნალს აცნობებს ცვლილებას.',
    },
    {
        topic: 'control',
        goal: 'შაბლონი უნდა დაკომპილირდეს და მცენარეები გამოჩნდეს',
        lines: [
            '<ul>',
            '  @for (plant of plants()) {',
            '    <li>{{ plant.name }}</li>',
            '  }',
            '</ul>',
        ],
        bug: 1,
        fix: '  @for (plant of plants(); track plant.id) {',
        hint: 'რა სჭირდება @for-ს ყოველთვის, რომ ელემენტები ერთმანეთისგან გაარჩიოს?',
        explain: '@for-ს track აუცილებლად სჭირდება: მის გარეშე შაბლონი არ კომპილირდება. track plant.id Angular-ს ეუბნება, რომელი li რომელ მცენარეს ეკუთვნის.',
    },
    {
        topic: 'bindings',
        goal: 'ღილაკზე დაჭერისას მცენარე უნდა მოირწყას',
        lines: [
            '<button (click)="water">',
            '  მორწყვა',
            '</button>',
        ],
        bug: 0,
        fix: '<button (click)="water()">',
        hint: '(click)-ში ფუნქციის სახელი წერია თუ მისი გამოძახება?',
        explain: '(click)="water" ფუნქციას მხოლოდ ასახელებს და არ იძახებს, ამიტომ არაფერი ხდება. ივენთზე მეთოდის გამოძახებაა საჭირო: water().',
    },
    {
        topic: 'bindings',
        goal: 'ველში აკრეფილი სახელი ქვემოთ უნდა ჩანდეს',
        lines: [
            '@Component({',
            "  selector: 'app-name',",
            '  imports: [],',
            '  template: `<input [(ngModel)]="name" /> {{ name() }}`,',
            '})',
            "export class NameField { name = signal('პიტნა'); }",
        ],
        bug: 2,
        fix: '  imports: [FormsModule],',
        hint: 'საიდან მოდის ngModel?',
        explain: 'ngModel FormsModule-ის დირექტივაა. imports-ში თუ არ წერია, Angular შეცდომას აგდებს: \'ngModel\' isn\'t a known property of \'input\'.',
    },
    {
        topic: 'bindings',
        goal: 'ღილაკი მხოლოდ შენახვის დროს უნდა იყოს გამორთული',
        lines: [
            'busy = signal(false);',
            '',
            '<!-- template -->',
            '<button disabled="{{ busy() }}">შენახვა</button>',
        ],
        bug: 3,
        fix: '<button [disabled]="busy()">შენახვა</button>',
        hint: 'რა ტიპის მნიშვნელობას აწვდის interpolation: ლოგიკურს თუ ტექსტს?',
        explain: 'interpolation ყველაფერს სტრიქონად აქცევს: disabled იღებს „false“-ს, ის კი truthy-ა და ღილაკი მუდამ გამორთულია. ლოგიკური მნიშვნელობისთვის property binding: [disabled]="busy()".',
    },
    {
        topic: 'services',
        goal: 'ორივე პანელმა ერთი სენსორი უნდა გამოიყენოს',
        lines: [
            '@Injectable()',
            'export class SensorService {',
            '  temp = signal(21);',
            '}',
            '',
            'export class Panel {',
            '  sensor = inject(SensorService);',
            '}',
        ],
        bug: 0,
        fix: "@Injectable({ providedIn: 'root' })",
        hint: 'ვინ უთხრა Angular-ს, სად შექმნას ეს სერვისი?',
        explain: '@Injectable() providedIn-ის გარეშე სერვისს არსად არეგისტრირებს, ამიტომ inject() აგდებს: NullInjectorError: No provider for SensorService. providedIn: \'root\' ერთ ეგზემპლარს მთელ აპზე ქმნის.',
    },
    {
        topic: 'services',
        goal: 'save() მცენარეს სერვერზე უნდა აგზავნიდეს',
        lines: [
            'export class PlantForm {',
            '  save(plant: Plant) {',
            '    const http = inject(HttpClient);',
            "    http.post('/api/plants', plant).subscribe();",
            '  }',
            '}',
        ],
        bug: 2,
        fix: '    this.http.post(\'/api/plants\', plant).subscribe();  // + ველი: private http = inject(HttpClient);',
        hint: 'სად შეიძლება inject()-ის გამოძახება?',
        explain: 'inject() მხოლოდ injection context-ში მუშაობს: ველის ინიციალიზაციაში ან constructor-ში. მეთოდში ის აგდებს NG0203-ს. HttpClient ველად აიღე: private http = inject(HttpClient).',
    },
    {
        topic: 'router',
        goal: 'აპი უნდა ჩაიტვირთოს და /plants გვერდი იმუშაოს',
        lines: [
            'export const routes: Routes = [',
            "  { path: '', component: Home },",
            "  { path: '/plants', component: PlantList },",
            "  { path: '**', component: NotFound },",
            '];',
        ],
        bug: 2,
        fix: "  { path: 'plants', component: PlantList },",
        hint: 'როგორ იწყება path მარშრუტების კონფიგურაციაში?',
        explain: 'path დახრილი ხაზით არ იწყება: Router მას არასწორ კონფიგურაციად თვლის და შეცდომას აგდებს. სწორია \'plants\', ბმულში კი routerLink="/plants".',
    },
    {
        topic: 'router',
        goal: 'მცენარეების გვერდზე გადასვლისას აპი არ უნდა გადაიტვირთოს',
        lines: [
            '<nav>',
            '  <a routerLink="/">მთავარი</a>',
            '  <a href="/plants">მცენარეები</a>',
            '</nav>',
        ],
        bug: 2,
        fix: '  <a routerLink="/plants">მცენარეები</a>',
        hint: 'რომელი ბმული ტვირთავს მთელ გვერდს თავიდან?',
        explain: 'href ბრაუზერს მთელ გვერდს თავიდან ატვირთვინებს: აპი ნულიდან იწყება და state იკარგება. routerLink გვერდს გადატვირთვის გარეშე ცვლის.',
    },
    {
        topic: 'http',
        goal: 'გვერდის გახსნისას მცენარეები სერვერიდან უნდა ჩაიტვირთოს',
        lines: [
            'export class PlantList {',
            '  private http = inject(HttpClient);',
            '  plants = signal<Plant[]>([]);',
            '',
            '  constructor() {',
            "    this.http.get<Plant[]>('/api/plants');",
            '  }',
            '}',
        ],
        bug: 5,
        fix: "    this.http.get<Plant[]>('/api/plants').subscribe(list => this.plants.set(list));",
        hint: 'როდის აგზავნის Observable მოთხოვნას?',
        explain: 'HttpClient Observable-ს აბრუნებს, Observable კი ზარმაცია: subscribe-ის გარეშე მოთხოვნა საერთოდ არ იგზავნება. subscribe (ან toSignal, ან httpResource) მას ამუშავებს.',
    },
];

/** answer: index into options. label: what the student predicts. */
const SCREEN = 'ეკრანზე გამოჩნდება:';
const CONSOLE = 'კონსოლში დაიბეჭდება:';

const OUTPUTS = [
    {
        code: 'const temp = signal(20);\nconst double = computed(() => temp() * 2);\n\ntemp.set(5);\nconsole.log(double());',
        label: CONSOLE,
        options: ['40', '10', '20', 'undefined'],
        answer: 1,
        explain: 'computed ყოველ წაკითხვაზე უახლეს temp-ს ხედავს: 5 * 2 = 10.',
    },
    {
        code: "const temp = signal(20);\nconst f = computed(() => {\n  console.log('ვითვლი');\n  return temp() * 9 / 5 + 32;\n});\n\ntemp.set(25);\ntemp.set(30);\n// f() არავის წაუკითხავს",
        label: 'რამდენჯერ დაიბეჭდება „ვითვლი“?',
        options: ['0', '1', '2', '3'],
        answer: 0,
        explain: 'computed ზარმაცია: ითვლება მხოლოდ მაშინ, როცა ვინმე წაიკითხავს. f() არავის გამოუძახებია, ამიტომ არც ერთხელ.',
    },
    {
        code: "effect(() => console.log('temp:', this.temp()));\n\n// ერთი დაჭერის დამმუშავებელში:\nthis.temp.set(22);\nthis.temp.set(23);\nthis.temp.set(24);",
        label: 'დაჭერის შემდეგ effect რამდენჯერ გაეშვება?',
        options: ['1, temp: 24', '3: 22, 23, 24', '0', '1, temp: 22'],
        answer: 0,
        explain: 'effect სინქრონულად არ ეშვება: Angular ცვლილებებს აგროვებს და effect-ს ერთხელ უშვებს, უკვე ბოლო მნიშვნელობით.',
    },
    {
        code: "const name = signal('ნინო');\neffect(() => console.log(name()));\n// effect ერთხელ უკვე გაეშვა\n\nname.set('ნინო');",
        label: 'set-ის შემდეგ effect კიდევ რამდენჯერ გაეშვება?',
        options: ['0', '1', '2', 'უსასრულოდ'],
        answer: 0,
        explain: 'იგივე მნიშვნელობის set სიგნალისთვის ცვლილება არ არის (Object.is), ამიტომ არავინ იღვიძებს.',
    },
    {
        code: "plants = signal<string[]>([]);\n\n<!-- template -->\n@for (p of plants(); track p) {\n  <li>{{ p }}</li>\n} @empty {\n  <li>ცარიელია</li>\n}",
        label: SCREEN, icon: 'monitor',
        options: ['არაფერი', 'ცარიელია', 'შეცდომა', 'undefined'],
        answer: 1,
        explain: 'სია ცარიელია, ამიტომ @for-ის ნაცვლად @empty ბლოკი იხატება.',
    },
    {
        code: "busy = signal(false);\n\n<!-- template -->\n<button disabled=\"{{ busy() }}\">შენახვა</button>",
        label: 'ღილაკი:', icon: 'monitor',
        options: ['ჩართულია', 'გამორთულია', 'არ ჩანს', 'შეცდომა'],
        answer: 1,
        explain: 'interpolation disabled-ს სტრიქონს „false“-ს აწვდის, არაცარიელი სტრიქონი კი truthy-ა. სწორია [disabled]="busy()".',
    },
    {
        code: "// ორივე კომპონენტი inject(SensorService)-ს იძახებს\n// SensorService: providedIn: 'root'\n\nwindowPanel.sensor.warm();   // 21 → 22\nconsole.log(doorPanel.sensor.temp());",
        label: CONSOLE,
        options: ['21', '22', 'undefined', 'შეცდომა'],
        answer: 1,
        explain: 'providedIn: \'root\' ერთ ეგზემპლარს ქმნის მთელ აპზე: ორივე პანელი ერთსა და იმავე სენსორს უყურებს.',
    },
    {
        code: "@Component({\n  selector: 'app-cellar',\n  providers: [SensorService],\n})\n// სარდაფი თავის სენსორს ათბობს: 21 → 25\n// root სენსორი იყო 21",
        label: 'root სენსორის temp():',
        options: ['21', '25', '46', 'შეცდომა'],
        answer: 0,
        explain: 'providers კომპონენტში ახალ, საკუთარ ეგზემპლარს ქმნის. სარდაფის სენსორი შეიცვალა, root-ისა კი ისევ 21-ია.',
    },
    {
        code: "// routes: { path: 'plants/:id', component: PlantPage }\n// withComponentInputBinding()\n// მისამართი: /plants/7\n\nid = input.required<string>();\nconsole.log(typeof this.id());",
        label: CONSOLE,
        options: ["'number'", "'string'", "'undefined'", "'object'"],
        answer: 1,
        explain: 'URL-ის ყოველი ნაწილი სტრიქონია: id არის \'7\'. რიცხვისთვის Number(id) ან transform: numberAttribute.',
    },
    {
        code: "export const routes: Routes = [\n  { path: '**', component: NotFound },\n  { path: 'plants', component: PlantList },\n];\n// მისამართი: /plants",
        label: 'რომელი კომპონენტი გამოჩნდება?',
        icon: 'route',
        options: ['PlantList', 'NotFound', 'ორივე', 'არცერთი'],
        answer: 1,
        explain: 'Router მარშრუტებს რიგით ამოწმებს და პირველ დამთხვევას იღებს. \'**\' ყველაფერს ემთხვევა, ამიტომ ის ბოლოს უნდა ეწეროს.',
    },
    {
        code: "constructor() {\n  this.http.get('/api/plants');\n}\n// subscribe არსად წერია",
        label: 'რამდენი მოთხოვნა წავა სერვერზე?',
        icon: 'globe',
        options: ['0', '1', '2', 'უსასრულოდ'],
        answer: 0,
        explain: 'Observable ზარმაცია: subscribe-ის (ან toSignal-ის, async pipe-ის) გარეშე მოთხოვნა არ იგზავნება.',
    },
    {
        code: "const plants$ = this.http.get('/api/plants');\n\nplants$.subscribe(a => console.log(a));\nplants$.subscribe(b => console.log(b));",
        label: 'რამდენი მოთხოვნა წავა სერვერზე?',
        icon: 'globe',
        options: ['1', '2', '0', '3'],
        answer: 1,
        explain: 'HttpClient-ის Observable ყოველ subscribe-ზე ახალ მოთხოვნას აგზავნის: ორი გამოწერა, ორი მოთხოვნა.',
    },
    {
        code: "level = model(50);\n\n<!-- მშობელი -->\n<app-plant-row [(level)]=\"mintLevel\" />\n// mintLevel = signal(40)\n// შვილი: this.level.set(100)",
        label: 'mintLevel() მშობელში:',
        options: ['40', '50', '100', 'შეცდომა'],
        answer: 2,
        explain: 'model() ორმხრივია: შვილი თავის მნიშვნელობას ცვლის და [(level)] მას მშობლის სიგნალშიც წერს.',
    },
];

/** Small fake console used by the puzzle demos. */
function consoleBox(lines) {
    const box = document.createElement('pre');
    box.className = 'demo-console';
    box.textContent = lines.join('\n');
    return box;
}
