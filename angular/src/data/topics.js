'use strict';

/* =========================================================
   1. DATA — the 9 Angular topics, chained in learning order.
      One running example flows through all of them: a greenhouse
      ("სათბური") with sensors, plants and watering.
      HTML is allowed in summary, more.title, more.points and more.tip
      (write < as &lt; there). The other text fields are escaped.
      The "გაუშვი" demos are real Angular (see demos-src/).
   ========================================================= */

const TOPICS = [
    {
        id: 'components',
        title: 'კომპონენტები',
        en: 'Component · Template',
        label: 'კომპონენტი',
        short: 'Components',
        icon: 'blocks',
        summary: 'Angular-ის კომპონენტი კლასი და შაბლონია ერთად: კლასში მონაცემი და ქცევა ცხოვრობს, შაბლონში მისი ხედი. <code>@Component</code> მათ აკავშირებს და selector-ს არქმევს, რომლითაც კომპონენტს სხვა შაბლონში ჩასვამ.',
        analogy: 'კომპონენტი სათბურის ქოთანს ჰგავს: ქოთანი (კლასი) მიწას და წყალს ინახავს, ეტიკეტი (შაბლონი) კი გარედან აჩვენებს, რა იზრდება შიგნით. selector ეტიკეტზე დაწერილი სახელია: <app-plant-card>.',
        keyPoints: [
            '@Component = selector + template + imports',
            'კლასის მონაცემი შაბლონში: {{ name() }}',
            'სხვა კომპონენტი გამოიყენება, თუ imports-შია',
        ],
        bridge: 'JS-ის ბაღი და React-ის სტუდია უკვე ვიცით. Angular-ში ბაღი სათბურად იქცევა: სენსორებით, მცენარეების სიით და მორწყვით.',
        code: `// plant-card.ts
@Component({
  selector: 'app-plant-card',
  templateUrl: './plant-card.html',
})
export class PlantCard {
  name = input.required<string>();
}

// plant-card.html
<span class="card">{{ name() }}</span>

// greenhouse.html: ერთი კომპონენტი, სამი ეგზემპლარი
<app-plant-card name="პიტნა" />
<app-plant-card name="ბაზილიკი" />
<app-plant-card name="რეჰანი" />`,
        more: {
            title: 'standalone, imports და ფაილები',
            points: [
                'Angular 17-დან კომპონენტები standalone-ია: NgModule აღარ სჭირდება',
                '<code>imports: [PlantCard, FormsModule]</code>: ყველაფერი, რასაც შაბლონი იყენებს',
                '<code>templateUrl</code> ცალკე ფაილით, ან <code>template</code> იქვე, ბექტიკებში',
                'Angular 20-ის სტილით კლასს სუფიქსი აღარ აქვს: <code>PlantCard</code>, ფაილი <code>plant-card.ts</code>',
                '<code>ng generate component plant-card</code>: ფაილებს CLI ქმნის',
                '<code>bootstrapApplication(App, appConfig)</code>: აპი ერთი root კომპონენტიდან იწყება',
                'კომპონენტის <code>styles</code> ნაგულისხმევად მხოლოდ მის შაბლონზე მოქმედებს',
            ],
            code: `@Component({
  selector: 'app-greenhouse',
  imports: [PlantCard],
  template: \`
    <h2>{{ title }}</h2>
    <app-plant-card name="პიტნა" />
  \`,
  styles: \`h2 { color: seagreen; }\`,
})
export class Greenhouse {
  title = 'ჩემი სათბური';
}`,
            tip: 'კომპონენტი, რომელიც imports-ში არ ჩაწერე, შაბლონში უცნობ ტეგად რჩება და build ჩავარდება: <code>NG8001: \'app-plant-card\' is not a known element</code>.',
        },
        run(out) {
            mountNg(out, 'ng-demo-components');
        },
    },
    {
        id: 'bindings',
        title: 'Binding-ები',
        en: '{{ }} · [ ] · ( ) · [( )]',
        label: 'Binding',
        short: 'Bindings',
        icon: 'link',
        summary: 'Binding მავთულია კლასსა და შაბლონს შორის. <code>{{ }}</code> მნიშვნელობას აჩვენებს, <code>[prop]</code> კლასიდან ელემენტს აწვდის, <code>(event)</code> ელემენტიდან კლასს ატყობინებს, <code>[(ngModel)]</code> კი ორივე მიმართულებით მუშაობს.',
        analogy: 'სათბურის თერმოსტატი: ეკრანი ტემპერატურას აჩვენებს ({{ }}), გამათბობელს ბრძანებას აწვდი ([ ]), ღილაკი კი გატყობინებს, რომ ვიღაცამ დააჭირა (( )). [( )], „ბანანი ყუთში“, ორივე ერთადაა: ხელს აწევ და ეკრანზეც მაშინვე ჩანს.',
        keyPoints: [
            '[ ]: მონაცემი კლასიდან შაბლონში',
            '( ): ივენთი შაბლონიდან კლასში',
            '[(ngModel)]: ორივე, FormsModule-ით',
        ],
        bridge: 'კომპონენტს კლასი და შაბლონი აქვს. ახლა მათ ვაკავშირებთ: სახელის ველი, ტემპერატურის სლაიდერი, მორწყვის ღილაკი.',
        code: `<h3>{{ name() }}: {{ temp() }}°C</h3>

<input [(ngModel)]="name" />
<input type="range" [value]="temp()" (input)="onSlide($event)" />

<div [class.hot]="temp() > 30" [style.opacity]="active() ? 1 : 0.5">
  <button [disabled]="temp() > 35" (click)="water()">მორწყვა</button>
</div>`,
        more: {
            title: 'ოთხი მიმართულება, ერთი წესი',
            points: [
                '<code>{{ expr }}</code>: interpolation, ტექსტად',
                '<code>[disabled]="busy()"</code>: property binding, ნებისმიერი ტიპით',
                '<code>[class.hot]</code>, <code>[style.width.%]</code>, <code>[attr.aria-label]</code>: კლასი, სტილი, ატრიბუტი',
                '<code>(click)="water()"</code>: ივენთი. <code>$event</code> თავად ივენთის ობიექტია',
                '<code>[(ngModel)]="name"</code>: ორმხრივი, საჭიროა <code>imports: [FormsModule]</code>',
                'ngModel სიგნალსაც იღებს: <code>name = signal(\'\')</code>, შაბლონში კი ფრჩხილების გარეშე',
                '<code>(keyup.enter)="save()"</code>: კლავიშის ფილტრი პირდაპირ შაბლონში',
            ],
            code: `export class Thermostat {
  name = signal('პიტნა');
  temp = signal(22);

  onSlide(event: Event) {
    this.temp.set(Number((event.target as HTMLInputElement).value));
  }

  water() {
    console.log(this.name(), 'მოირწყა');
  }
}`,
            tip: '<code>disabled="{{ busy() }}"</code> ელემენტს სტრიქონს „false“-ს აწვდის, ის კი truthy-ა და ღილაკი მუდამ გამორთულია. ლოგიკური მნიშვნელობისთვის: <code>[disabled]="busy()"</code>.',
        },
        run(out) {
            mountNg(out, 'ng-demo-bindings');
        },
    },
    {
        id: 'signals',
        title: 'Signals',
        en: 'signal · computed · effect',
        label: 'Signal',
        short: 'Signals',
        icon: 'zap',
        summary: 'სიგნალი მნიშვნელობაა, რომელიც Angular-ს თვითონ ეუბნება, როცა იცვლება. <code>computed</code> სხვა სიგნალებიდან ითვლება, ისიც მხოლოდ საჭიროებისას. <code>effect</code> ცვლილებისას გარე სამყაროში რაღაცას აკეთებს. შეინახე მინიმუმი, დანარჩენი გამოთვალე.',
        analogy: 'სიგნალი სათბურის სენსორია: ტემპერატურა იცვლება და ყველა ეკრანი, რომელიც მას უყურებს, თავისით ახლდება. computed ეკრანია, რომელიც ცელსიუსს ფარენჰაიტად თარგმნის. effect კი სიგნალიზაციაა: ცხელა? ფანჯარა იღება.',
        keyPoints: [
            'წაკითხვა ფრჩხილებით: temp()',
            'ცვლილება: set(v) ან update(v => …)',
            'computed მხოლოდ წასაკითხია და თავისით ახლდება',
        ],
        bridge: 'binding-ები სიგნალებს კითხულობს. ახლა ვნახავთ, რა ხდება შიგნით: ერთი სენსორი, რამდენიმე გამოთვლა და ერთი სიგნალიზაცია.',
        code: `export class Greenhouse {
  temp = signal(21);
  fahrenheit = computed(() => this.temp() * 9 / 5 + 32);
  status = computed(() => this.temp() > 28 ? 'ცხელა' : 'კომფორტული');

  constructor() {
    effect(() => {
      console.log('ტემპერატურა:', this.temp());
    });
  }

  warm() {
    this.temp.update(t => t + 1);
  }
}`,
        more: {
            title: 'set, update, computed და effect',
            points: [
                '<code>temp()</code>: წაკითხვა. შაბლონშიც ფრჩხილებით: <code>{{ temp() }}</code>',
                '<code>temp.set(25)</code>: ახალი მნიშვნელობა. <code>temp.update(t =&gt; t + 1)</code>: წინაზე დამოკიდებული',
                'მასივი და ობიექტი: ახალი ასლი, <code>list.update(l =&gt; [...l, plant])</code>, არა <code>push</code>',
                '<code>computed</code> ზარმაცია: ითვლება მხოლოდ წაკითხვისას და შედეგს იმახსოვრებს',
                '<code>effect</code> გარე სამყაროსთვისაა: localStorage, ლოგი, ანალიტიკა. სიგნალის გამოსათვლელად computed სჯობს',
                'ერთი და იგივე მნიშვნელობის <code>set</code> არავის აღვიძებს',
                '<code>linkedSignal</code>: ჩასაწერი სიგნალი, რომელიც სხვა სიგნალის შეცვლისას თავიდან ყენდება',
                '<code>toSignal(observable$)</code>: RxJS-ის ნაკადი სიგნალად',
            ],
            code: `plants = signal<Plant[]>([]);
dryCount = computed(() => this.plants().filter(p => p.water < 30).length);

addPlant(plant: Plant) {
  this.plants.update(list => [...list, plant]); // ახალი მასივი
}

// არჩეული მცენარე პირველზე ბრუნდება, როცა სია იცვლება
selected = linkedSignal(() => this.plants()[0]);`,
            tip: '<code>{{ temp }}</code> ფრჩხილების გარეშე რიცხვს არ აჩვენებს: სიგნალი ფუნქციაა და გამოძახება სჭირდება. Angular-ში ეს ყველაზე ხშირი შეცდომაა.',
        },
        run(out) {
            mountNg(out, 'ng-demo-signals');
        },
    },
    {
        id: 'control',
        title: 'Control Flow',
        en: '@if · @for · @switch',
        label: 'Control',
        short: 'Control',
        icon: 'list',
        summary: 'შაბლონს თავისი <code>@if</code>, <code>@for</code> და <code>@switch</code> აქვს: ეს შაბლონის სინტაქსია და არა დირექტივა, ამიტომ დაიმპორტება არ სჭირდება. <code>@for</code>-ს <code>track</code> აუცილებლად სჭირდება, <code>@empty</code> კი ცარიელ სიას აჩვენებს.',
        analogy: 'სათბურის დილის შემოვლა: ყოველ ქოთანთან ჩერდები (@for), ნომრით ცნობ (track), მშრალს რწყავ (@if), ცარიელ თაროზე კი ბარათი დევს: „აქ ჯერ არაფერია“ (@empty).',
        keyPoints: [
            '@for (p of plants(); track p.id)',
            '@empty: როცა სია ცარიელია',
            '@if / @else if / @else',
        ],
        bridge: 'სიგნალში უკვე მცენარეების მასივია. ახლა შაბლონში ვხატავთ: ყოველ მცენარეს, მის მდგომარეობას და ცარიელი სათბურის შეტყობინებას.',
        code: `<ul>
  @for (plant of plants(); track plant.id; let i = $index) {
    <li>
      {{ i + 1 }}. {{ plant.name }}
      @if (plant.water < 30) {
        <span class="dry">მოსარწყავია</span>
      }
    </li>
  } @empty {
    <li>სათბური ცარიელია</li>
  }
</ul>

@switch (season()) {
  @case ('winter') { <p>გამათბობელი ჩართულია</p> }
  @default { <p>ყველაფერი ნორმაშია</p> }
}`,
        more: {
            title: 'track, $index და @defer',
            points: [
                '<code>track plant.id</code>: Angular ელემენტებს id-ით ცნობს და სიის შეცვლისას DOM-ს მინიმალურად ეხება',
                '<code>track $index</code> მხოლოდ სიისთვის, რომელიც არ იცვლება',
                'ცვლადები: <code>$index</code>, <code>$first</code>, <code>$last</code>, <code>$even</code>, <code>$count</code>',
                '<code>@if (user(); as u)</code>: შედეგი ახალი სახელით',
                '<code>@defer (on viewport)</code>: ნაწილი მაშინ იტვირთება, როცა ეკრანზე გამოჩნდება',
                'ძველი <code>*ngIf</code> და <code>*ngFor</code> ძველ კოდში შეგხვდება; ახალში @-ბლოკები გამოიყენე',
                'შაბლონის ტექსტში @ სიმბოლო ასე იწერება: <code>&amp;#64;</code>',
            ],
            code: `@defer (on viewport) {
  <app-sensor-chart />
} @placeholder {
  <p>გრაფიკი გამოჩნდება, როცა აქამდე ჩამოხვალ</p>
} @loading (minimum 300ms) {
  <p>იტვირთება...</p>
}`,
            tip: '<code>@for</code> <code>track</code>-ის გარეშე არ კომპილირდება. სწორი track კი მხოლოდ სიჩქარეს არ ეხება: მის გარეშე input-ების შიგთავსი და ანიმაციები სხვა ელემენტს მიეწერება.',
        },
        run(out) {
            mountNg(out, 'ng-demo-control');
        },
    },
    {
        id: 'io',
        title: 'Input და Output',
        en: 'input() · output() · model()',
        label: 'Input',
        short: 'Inputs',
        icon: 'share',
        summary: 'მშობელი შვილს მონაცემს <code>input()</code>-ით აწვდის, შვილი მშობელს <code>output()</code>-ით ატყობინებს. <code>model()</code> ორივეს აკეთებს: შვილს თავისი „ბანანი ყუთში“ აქვს, <code>[(level)]</code>.',
        analogy: 'მებაღე (მშობელი) ქოთანს (შვილს) ეტიკეტს აკრავს: „პიტნა“. ეს input-ია. ქოთანს ზარი აქვს, რომელიც მიწის გაშრობისას რეკავს: ეს output-ია. წყლის მაჩვენებელი კი ორივე მხარეს ჩანს და ორივე ცვლის: ეს model-ია.',
        keyPoints: [
            'input.required<Plant>(): აუცილებელი input',
            'output<string>() და emit(...)',
            'model(): ორმხრივი, [(level)]',
        ],
        bridge: 'ერთ კომპონენტში ყველაფერი გვაქვს. ახლა სათბური ნაწილებად იყოფა: მშობელი სიაა, ყოველი მცენარე კი შვილი კომპონენტი.',
        code: `// plant-row.ts
export class PlantRow {
  plant = input.required<Plant>();
  level = model(50);
  watered = output<string>();

  water() {
    this.level.set(100);
    this.watered.emit(this.plant().name);
  }
}

// greenhouse.html
<app-plant-row [plant]="mint" [(level)]="mintLevel" (watered)="log($event)" />`,
        more: {
            title: 'მონაცემი ქვემოთ, ივენთები ზემოთ',
            points: [
                '<code>input()</code> სიგნალს აბრუნებს: <code>this.plant()</code>. შვილი მას ვერ ცვლის',
                '<code>input(50)</code>: ნაგულისხმევი მნიშვნელობით. <code>input.required()</code>: მის გარეშე build ჩავარდება',
                '<code>input(0, { transform: numberAttribute })</code>: სტრიქონი რიცხვად',
                '<code>output()</code> და <code>emit()</code>: მშობელი <code>(watered)="…"</code>-ით უსმენს, <code>$event</code> გაგზავნილი მნიშვნელობაა',
                '<code>model()</code> ჩასაწერი input-ია: <code>[(level)]="mintLevel"</code>',
                'ძველ კოდში: <code>@Input()</code> და <code>@Output() x = new EventEmitter()</code>',
                'ღრმად გადასაცემად input-ების ჯაჭვს სერვისი (DI) სჯობს',
            ],
            code: `// ძველი სტილი, რომელიც ძველ პროექტებში შეგხვდება
export class PlantRowLegacy {
  @Input({ required: true }) plant!: Plant;
  @Output() watered = new EventEmitter<string>();
}`,
            tip: 'input შვილში მხოლოდ წასაკითხია. თუ შვილს მისი შეცვლა სჭირდება, ან model() გამოიყენე, ან output-ით სთხოვე მშობელს.',
        },
        run(out) {
            mountNg(out, 'ng-demo-io');
        },
    },
    {
        id: 'directives',
        title: 'დირექტივები',
        en: '@Directive',
        label: 'დირექტივა',
        short: 'Directives',
        icon: 'bulb',
        summary: 'დირექტივა კლასია, რომელიც უკვე არსებულ ელემენტს ახალ ქცევას აძლევს, საკუთარი შაბლონის გარეშე. <code>appHighlight</code> ატრიბუტივით ეწერება ნებისმიერ ელემენტს, <code>host</code> კი ამ ელემენტის ივენთებს და სტილებს მართავს.',
        analogy: 'დირექტივა ქოთანზე დაკრული სტიკერია: ქოთანი იგივე რჩება, სტიკერი კი მას ახალ უნარს აძლევს, მაგალითად ანათებს, როცა ხელს მიუახლოებ. ერთი და იგივე სტიკერი ნებისმიერ ქოთანზე იკვრება.',
        keyPoints: [
            'კომპონენტი = დირექტივა + შაბლონი',
            'host: ელემენტის ივენთები და სტილები',
            'input alias-ით: [appHighlight]="\'gold\'"',
        ],
        bridge: 'კომპონენტები საკუთარ ხედს ხატავენ. ზოგჯერ ახალი ხედი არ გვინდა, მხოლოდ ქცევა: მაგალითად, მცენარე ანათდეს, როცა მასზე მაუსს მიიტან.',
        code: `@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'on.set(true)',
    '(mouseleave)': 'on.set(false)',
    '[style.background]': "on() ? color() || 'gold' : null",
  },
})
export class Highlight {
  color = input('', { alias: 'appHighlight' }); // <li appHighlight> → ''
  on = signal(false);
}

// გამოყენება
<li appHighlight>პიტნა</li>
<li [appHighlight]="'lightgreen'">ბაზილიკი</li>`,
        more: {
            title: 'ატრიბუტი, host და ჩაშენებული დირექტივები',
            points: [
                'selector კვადრატულ ფრჩხილებში, <code>\'[appHighlight]\'</code>, ნიშნავს „ატრიბუტი“',
                '<code>host</code>: ივენთები <code>(click)</code>, თვისებები <code>[class.on]</code>, ატრიბუტები <code>[attr.role]</code>',
                '<code>inject(ElementRef)</code>: წვდომა თავად ელემენტზე, როცა host საკმარისი არ არის',
                'ჩაშენებულები: <code>ngModel</code>, <code>routerLink</code>, <code>NgClass</code>, <code>NgStyle</code>',
                '<code>[ ]</code> ერთი სინტაქსია სამი სამიზნით: ელემენტის თვისება, კომპონენტის input, დირექტივის input',
                'დირექტივაც imports-ში იწერება, კომპონენტის მსგავსად',
                'ძველი <code>@HostListener</code> და <code>@HostBinding</code> ახლა <code>host</code> ობიექტით იწერება',
            ],
            code: `@Directive({ selector: '[appAutofocus]' })
export class Autofocus {
  private el = inject(ElementRef<HTMLInputElement>);

  constructor() {
    afterNextRender(() => this.el.nativeElement.focus());
  }
}

<input appAutofocus placeholder="მცენარის სახელი" />`,
            tip: 'დირექტივა imports-ში თუ არ ჩაწერე, Angular შეცდომას არ აგდებს: ატრიბუტი უბრალო HTML ატრიბუტად რჩება და არაფერი ხდება. ეს ჩუმი ბაგია.',
        },
        run(out) {
            mountNg(out, 'ng-demo-directives');
        },
    },
    {
        id: 'services',
        title: 'სერვისები და DI',
        en: 'inject() · providedIn',
        label: 'სერვისი',
        short: 'Services',
        icon: 'cpu',
        summary: 'სერვისი კლასია მონაცემისა და ლოგიკისთვის, რომელიც რამდენიმე კომპონენტს სჭირდება. Angular-ის Dependency Injection მას თვითონ ქმნის და აწვდის: <code>inject(SensorService)</code>. <code>providedIn: \'root\'</code> ნიშნავს: ერთი ეგზემპლარი მთელ აპზე.',
        analogy: 'სერვისი სათბურის ცენტრალური წყალსადენია: ყოველ ქოთანს საკუთარი ჭა არ სჭირდება, ყველა ერთ მილს უერთდება. DI სანტექნიკოსია: ეუბნები „წყალი მინდა“ (inject), ის კი სწორ მილს მიგიერთებს.',
        keyPoints: [
            "@Injectable({ providedIn: 'root' })",
            'private sensor = inject(SensorService)',
            'providers: [ … ] კომპონენტში = საკუთარი ეგზემპლარი',
        ],
        bridge: 'input-ით მონაცემი მხოლოდ მშობლიდან შვილს მიდის. სენსორი კი ყველა ოთახს სჭირდება: ფანჯარას, კარს, სარდაფს. ამისთვის სერვისია.',
        code: `@Injectable({ providedIn: 'root' })
export class SensorService {
  readonly temp = signal(21);
  warm() { this.temp.update(t => t + 1); }
}

export class SensorPanel {
  protected sensor = inject(SensorService);
}

// sensor-panel.html
<p>{{ sensor.temp() }}°C</p>
<button (click)="sensor.warm()">+1</button>`,
        more: {
            title: 'ინჟექტორები და providers',
            points: [
                '<code>providedIn: \'root\'</code>: singleton. თუ არავინ იყენებს, build-იდან ამოიჭრება',
                '<code>providers: [SensorService]</code> კომპონენტში: ამ კომპონენტს და მის შვილებს საკუთარი ეგზემპლარი აქვთ',
                '<code>inject()</code> მხოლოდ injection context-ში: ველის ინიციალიზაცია, constructor, factory',
                'მეთოდში გამოძახებული <code>inject()</code> შეცდომას აგდებს: NG0203',
                '<code>InjectionToken</code>: კონფიგურაცია და სხვა არა-კლასი მნიშვნელობები',
                'ტესტში სერვისის შეცვლა მარტივია: <code>{ provide: SensorService, useClass: FakeSensor }</code>',
                'სიგნალი სერვისში: მდგომარეობა, რომელსაც ბევრი კომპონენტი უყურებს',
            ],
            code: `export const API_URL = new InjectionToken<string>('API_URL');

// app.config.ts
providers: [{ provide: API_URL, useValue: 'https://api.greenhouse.ge' }],

// სერვისში
private apiUrl = inject(API_URL);`,
            tip: '<code>@Injectable()</code> <code>providedIn</code>-ის გარეშე თუ დაწერე და არსად დაარეგისტრირე, inject() გაგიგდებს: <code>NullInjectorError: No provider for SensorService</code>.',
        },
        run(out) {
            mountNg(out, 'ng-demo-services');
        },
    },
    {
        id: 'router',
        title: 'Routing',
        en: 'Routes · routerLink',
        label: 'Router',
        short: 'Router',
        icon: 'route',
        summary: 'Router URL-ს კომპონენტს უკავშირებს: <code>{ path: \'plants/:id\', component: PlantPage }</code>. <code>routerLink</code> გვერდს გადატვირთვის გარეშე ცვლის, <code>&lt;router-outlet /&gt;</code> კი ადგილია, სადაც არჩეული გვერდი ჩაჯდება.',
        analogy: 'Router სათბურის რუკაა შესასვლელთან: „ოთახი 2: ბაზილიკი“. მისამართი (URL) გეუბნება, რომელ ოთახში ხარ, routerLink კედელზე მიხატული ისარია, guard კი დარაჯი, რომელიც ადმინის ოთახში მხოლოდ ბარათით გიშვებს.',
        keyPoints: [
            'routes: path → component',
            'routerLink და არა href',
            ':id პირდაპირ input()-ში',
        ],
        bridge: 'სათბურს ახლა რამდენიმე გვერდი აქვს: მცენარეების სია, თითოეული მცენარე და ადმინის პანელი, რომელიც დაცული უნდა იყოს.',
        code: `export const routes: Routes = [
  { path: '', component: Home },
  { path: 'plants', component: PlantList },
  { path: 'plants/:id', component: PlantPage },
  { path: 'admin', component: Admin, canActivate: [authGuard] },
  { path: '**', component: NotFound },
];

// app.config.ts
provideRouter(routes, withComponentInputBinding()),

// plant-page.ts: :id პირდაპირ input-ში
export class PlantPage {
  id = input.required<string>();
}`,
        more: {
            title: 'guard-ები, lazy loading და ნავიგაცია',
            points: [
                '<code>routerLink="/plants"</code> ან <code>[routerLink]="[\'/plants\', plant.id]"</code>',
                '<code>routerLinkActive="active"</code>: კლასი აქტიურ ბმულზე',
                '<code>inject(Router).navigate([\'/plants\', id])</code>: გადასვლა კოდიდან',
                'path დახრილი ხაზით არ იწყება: <code>\'plants\'</code>, არა <code>\'/plants\'</code>',
                '<code>\'**\'</code> ბოლოს იწერება: Router პირველ დამთხვევას იღებს',
                'Functional guard: <code>() =&gt; inject(Auth).user() ? true : inject(Router).parseUrl(\'/login\')</code>',
                '<code>loadComponent: () =&gt; import(\'./admin/admin\')</code>: გვერდი ცალკე ფაილად, მხოლოდ საჭიროებისას',
                'Guard UI-ს იცავს, მონაცემს კი სერვერი',
            ],
            code: `export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.user() ? true : inject(Router).parseUrl('/login');
};

{ path: 'admin', loadComponent: () => import('./admin/admin'), canActivate: [authGuard] }`,
            tip: 'params ყოველთვის სტრიქონია: <code>/plants/2</code>-ზე id არის <code>\'2\'</code>. რიცხვთან შედარებამდე <code>Number(id)</code>, ან input-ს <code>transform: numberAttribute</code>.',
        },
        run(out) {
            mountNg(out, 'ng-demo-router');
        },
    },
    {
        id: 'http',
        title: 'HTTP და RxJS',
        en: 'HttpClient · httpResource',
        label: 'HTTP',
        short: 'HTTP',
        icon: 'globe',
        summary: 'HttpClient სერვერს ესაუბრება და Observable-ს აბრუნებს. Observable ზარმაცია: მოთხოვნას მხოლოდ subscribe-ის შემდეგ აგზავნის. <code>httpResource</code> იგივეს სიგნალებით აკეთებს: URL-ში სიგნალი იცვლება და მონაცემი თავისით ხელახლა იტვირთება.',
        analogy: 'Observable ამინდის ჟურნალის გამოწერაა: ჟურნალი არ მოვა, სანამ არ გამოიწერ (subscribe). httpResource კი სათბურის ჭკვიანი ეკრანია: ქალაქს შეცვლი და ის თვითონ ითხოვს ახალ პროგნოზს, თან გეუბნება, იტვირთება თუ შეცდომაა.',
        keyPoints: [
            'provideHttpClient() app.config-ში',
            'subscribe-ის გარეშე მოთხოვნა არ მიდის',
            'httpResource: value(), isLoading(), error()',
        ],
        bridge: 'მცენარეები აქამდე კოდში ეწერა. ნამდვილი სათბური მონაცემს სერვერიდან იღებს: სიას, სენსორების ჩვენებას, მორწყვის ისტორიას.',
        code: `export class PlantPage {
  id = input.required<string>();

  plant = httpResource<Plant>(() => \`/api/plants/\${this.id()}\`);
}

// plant-page.html
@if (plant.isLoading()) {
  <p>იტვირთება...</p>
} @else if (plant.error()) {
  <p>ვერ ჩაიტვირთა</p>
} @else if (plant.hasValue()) {
  <h1>{{ plant.value().name }}</h1>
}`,
        more: {
            title: 'HttpClient, Observable და interceptor',
            points: [
                '<code>http.get&lt;Plant[]&gt;(url)</code>: Observable. <code>post</code>, <code>put</code>, <code>delete</code> იგივენაირად',
                'Observable ზარმაცია: მას <code>subscribe</code>, <code>async</code> pipe ან <code>toSignal</code> ამუშავებს',
                '<code>toSignal(http.get(url))</code>: Observable სიგნალად, გამოწერა თავისით წყდება',
                'RxJS ოპერატორები: <code>map</code>, <code>filter</code>, <code>debounceTime</code>, <code>switchMap</code>',
                '<code>switchMap</code> ძველ მოთხოვნას აუქმებს, როცა ახალი იწყება: race condition-ის წამალი',
                'Interceptor ყოველ მოთხოვნას ერთ ადგილას ამუშავებს: ტოკენი, ლოგი, შეცდომები',
                'ხელით <code>subscribe</code>-ზე <code>takeUntilDestroyed()</code>, რომ მეხსიერება არ გაჟონოს',
            ],
            code: `export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(token ? req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } }) : req);
};

// app.config.ts
provideHttpClient(withInterceptors([authInterceptor])),

// ძებნა: დაელოდე აკრეფას, ძველი მოთხოვნა გააუქმე
results = toSignal(this.query$.pipe(debounceTime(300), switchMap(q => this.api.search(q))));`,
            tip: '<code>this.http.get(url)</code> subscribe-ის გარეშე არაფერს აკეთებს: Network ტაბში მოთხოვნაც კი არ ჩანს. Observable-ის ყველაზე ხშირი ხაფანგი ესაა.',
        },
        run(out) {
            mountNg(out, 'ng-demo-http');
        },
    },
];
