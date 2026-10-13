'use strict';

/* =========================================================
   PUZZLES — put the steps in order; the result runs as real Angular.

   Each step has a rank. Steps that may swap places share a rank,
   so any order where ranks never go down is accepted.
   explain: the short note on the back of the rolling line.
   ========================================================= */

const PUZZLES = [
    {
        title: 'მთვლელი',
        goal: 'კომპონენტი, რომლის ღილაკი დაჭერებს ითვლის.',
        topics: ['components', 'signals'],
        steps: [
            { rank: 1, code: '@Component({', explain: 'დეკორატორი: ქვემოთ მოცემული კლასი კომპონენტია.' },
            { rank: 2, code: "  selector: 'app-counter',", explain: 'სახელი, რომლითაც კომპონენტს სხვა შაბლონში ჩასვამ.' },
            { rank: 2, code: '  template: `<button (click)="inc()">{{ count() }}</button>`,', explain: 'შაბლონი: ღილაკი, რომელიც count-ს აჩვენებს და inc()-ს იძახებს.' },
            { rank: 3, code: '})', explain: 'ხურავს დეკორატორს.' },
            { rank: 4, code: 'export class Counter {', explain: 'კლასი: აქ ცხოვრობს მონაცემი და ქცევა.' },
            { rank: 5, code: '  count = signal(0);', explain: 'სიგნალი: მთვლელის მნიშვნელობა.' },
            { rank: 5, code: '  inc() { this.count.update(c => c + 1); }', explain: 'მეთოდი: ზრდის სიგნალს, Angular კი ღილაკს თავიდან ხატავს.' },
            { rank: 6, code: '}', explain: 'ხურავს კლასს.' },
        ],
        run(preview) {
            mountNg(preview, 'ng-puzzle-counter');
        },
    },
    {
        title: 'სიის შაბლონი',
        goal: 'მცენარეების სია; ცარიელ სიაზე შეტყობინება.',
        topics: ['control'],
        steps: [
            { rank: 1, code: '<ul>', explain: 'სიის კონტეინერი.' },
            { rank: 2, code: '  @for (plant of plants(); track plant.id) {', explain: 'ყოველი მცენარისთვის ერთხელ. track ელემენტებს id-ით ცნობს.' },
            { rank: 3, code: '    <li>{{ plant.name }}</li>', explain: 'ერთი მცენარე.' },
            { rank: 4, code: '  } @empty {', explain: 'ხურავს @for-ს და ხსნის ბლოკს ცარიელი სიისთვის.' },
            { rank: 5, code: '    <li>სათბური ცარიელია</li>', explain: 'ჩანს მხოლოდ მაშინ, როცა plants() ცარიელია.' },
            { rank: 6, code: '  }', explain: 'ხურავს @empty-ს.' },
            { rank: 7, code: '</ul>', explain: 'ხურავს სიას.' },
        ],
        run(preview) {
            mountNg(preview, 'ng-puzzle-list');
        },
    },
    {
        title: 'მორწყვა',
        goal: 'water(id) ერთ მცენარეს ავსებს წყლით, სიის ახალი ასლით.',
        topics: ['signals'],
        steps: [
            { rank: 1, code: 'water(id: number) {', explain: 'მეთოდი, რომელიც მცენარის id-ს იღებს.' },
            { rank: 2, code: '  this.plants.update(list =>', explain: 'update ძველი სიიდან ახალს ითვლის.' },
            { rank: 3, code: '    list.map(p => (p.id === id ? { ...p, water: 100 } : p)),', explain: 'map ახალ მასივს ქმნის: სწორ მცენარეს ახალი ობიექტი, დანარჩენები უცვლელად.' },
            { rank: 4, code: '  );', explain: 'ხურავს update-ს.' },
            { rank: 5, code: '}', explain: 'ხურავს მეთოდს.' },
        ],
        run(preview) {
            mountNg(preview, 'ng-puzzle-water');
        },
    },
    {
        title: 'სერვისი',
        goal: 'ერთი სენსორი მთელი სათბურისთვის.',
        topics: ['services', 'signals'],
        steps: [
            { rank: 1, code: "@Injectable({ providedIn: 'root' })", explain: 'DI-ს ეუბნება: ერთი ეგზემპლარი მთელ აპზე.' },
            { rank: 2, code: 'export class SensorService {', explain: 'სერვისის კლასი.' },
            { rank: 3, code: '  readonly temp = signal(21);', explain: 'მდგომარეობა სიგნალად: ყველა, ვინც inject-ს გააკეთებს, ამას დაინახავს.' },
            { rank: 3, code: '  warm() { this.temp.update(t => t + 1); }', explain: 'ქცევა: ტემპერატურის აწევა.' },
            { rank: 4, code: '}', explain: 'ხურავს კლასს.' },
        ],
        run(preview) {
            mountNg(preview, 'ng-puzzle-service');
        },
    },
    {
        title: 'დირექტივა',
        goal: 'ატრიბუტი, რომელიც ელემენტს მაუსის მიტანისას აანათებს.',
        topics: ['directives'],
        steps: [
            { rank: 1, code: '@Directive({', explain: 'დეკორატორი: ეს დირექტივაა, შაბლონის გარეშე.' },
            { rank: 2, code: "  selector: '[puzzleHighlight]',", explain: 'კვადრატული ფრჩხილები: ატრიბუტის selector.' },
            { rank: 2, code: "  host: { '(mouseenter)': 'on.set(true)', '(mouseleave)': 'on.set(false)', '[style.background]': \"on() ? '#fde68a' : null\" },", explain: 'host: ელემენტის ივენთები და სტილი.' },
            { rank: 3, code: '})', explain: 'ხურავს დეკორატორს.' },
            { rank: 4, code: 'export class PuzzleHighlight {', explain: 'დირექტივის კლასი.' },
            { rank: 5, code: '  on = signal(false);', explain: 'ანთებულია თუ არა.' },
            { rank: 6, code: '}', explain: 'ხურავს კლასს.' },
        ],
        run(preview) {
            mountNg(preview, 'ng-puzzle-directive');
        },
    },
    {
        title: 'მარშრუტები',
        goal: 'სამი გვერდი და 404 ყველაფრისთვის, რაც არ დაემთხვა.',
        topics: ['router'],
        steps: [
            { rank: 1, code: 'export const routes: Routes = [', explain: 'მარშრუტების მასივი.' },
            { rank: 2, code: "  { path: '', component: Home },", explain: 'მთავარი გვერდი.' },
            { rank: 2, code: "  { path: 'plants', component: PlantList },", explain: 'მცენარეების სია.' },
            { rank: 2, code: "  { path: 'plants/:id', component: PlantPage },", explain: 'ერთი მცენარე, :id პარამეტრით.' },
            { rank: 3, code: "  { path: '**', component: NotFound },", explain: 'ყველაფერი დანარჩენი. ბოლოს, რადგან Router პირველ დამთხვევას იღებს.' },
            { rank: 4, code: '];', explain: 'ხურავს მასივს.' },
        ],
        run(preview) {
            const routes = [['', 'Home'], ['plants', 'PlantList'], ['plants/:id', 'PlantPage'], ['**', 'NotFound']];
            const match = (url) => {
                const parts = url.split('/').filter(Boolean);
                for (const [path, component] of routes) {
                    if (path === '**') return `${component}`;
                    const segs = path.split('/').filter(Boolean);
                    if (segs.length !== parts.length) continue;
                    const params = {};
                    if (segs.every((s, i) => (s.startsWith(':') ? ((params[s.slice(1)] = parts[i]), true) : s === parts[i]))) {
                        return Object.keys(params).length ? `${component}  (id = '${params.id}')` : component;
                    }
                }
                return '';
            };
            preview.append(consoleBox(['/', '/plants', '/plants/7', '/plants/7/edit', '/about'].map(u => `${u.padEnd(16)} → ${match(u)}`)));
        },
    },
    {
        title: 'HTTP სერვისი',
        goal: 'სერვისი, რომელიც მცენარეებს სერვერიდან იღებს.',
        topics: ['http', 'services'],
        steps: [
            { rank: 1, code: "@Injectable({ providedIn: 'root' })", explain: 'სერვისი მთელი აპისთვის.' },
            { rank: 2, code: 'export class PlantApi {', explain: 'კლასი.' },
            { rank: 3, code: '  private http = inject(HttpClient);', explain: 'HttpClient ველის ინიციალიზაციაში: injection context.' },
            { rank: 4, code: '  getPlants() {', explain: 'მეთოდი.' },
            { rank: 5, code: "    return this.http.get<Plant[]>('/api/plants');", explain: 'Observable-ს აბრუნებს. მოთხოვნა subscribe-ის შემდეგ წავა.' },
            { rank: 6, code: '  }', explain: 'ხურავს მეთოდს.' },
            { rank: 7, code: '}', explain: 'ხურავს კლასს.' },
        ],
        run(preview) {
            mountNg(preview, 'ng-demo-http');
        },
    },
];
