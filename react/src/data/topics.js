'use strict';

/* =========================================================
   1. DATA — the 8 React topics, chained in learning order.
      One running example flows through all of them: the leaf garden
      from the JS app, rebuilt with components.
      HTML is allowed in summary, more.title, more.points and more.tip
      (write < as &lt; there). The other text fields are escaped.
   ========================================================= */

const TOPICS = [
    {
        id: 'components',
        title: 'კომპონენტები',
        en: 'Components & Props',
        label: 'კომპონენტი',
        short: 'Components',
        icon: 'blocks',
        summary: 'კომპონენტი არის ფუნქცია, რომელიც UI-ის ნაწილს აბრუნებს. Props მისი პარამეტრებია: მშობელი გადასცემს, შვილი კითხულობს. მთელი აპლიკაცია ასეთი პატარა ნაწილებისგან იკრიბება.',
        analogy: 'კომპონენტი LEGO-ს აგურს ჰგავს: ერთხელ ამზადებ და რამდენჯერაც გინდა, იმდენჯერ იყენებ. Props აგურის ფერი და ზომაა: ერთი და იგივე <Leaf> ერთგან მწვანეა, მეორეგან ყვითელი.',
        keyPoints: [
            'სახელი დიდი ასოთი: Leaf, Garden',
            'JSX აბრუნებს ერთ მშობელს (ან <>…</>)',
            'Props მხოლოდ წასაკითხია: შვილი მათ არ ცვლის',
        ],
        bridge: 'JS-ის ბაღში ფოთლებს createElement-ით ვქმნიდით. React-ში ფოთოლი კომპონენტია, ბაღი კი კომპონენტების ხე.',
        code: `type LeafProps = { color: string; size?: number };

function Leaf({ color, size = 24 }: LeafProps) {
  return <span className={'leaf ' + color} style={{ fontSize: size }}>ფოთოლი</span>;
}

export function Garden() {
  return (
    <section>
      <h2>ფოთლების ბაღი</h2>
      <Leaf color="green" />
      <Leaf color="yellow" size={32} />
    </section>
  );
}`,
        more: {
            title: 'JSX-ის წესები, props და children',
            points: [
                '<code>JSX</code>: HTML-ის მსგავსი ჩანაწერი JS-ში. ბრაუზერამდე ის ჩვეულებრივ JS-ად (<code>createElement</code>) იქცევა',
                '<code>className</code> და არა <code>class</code>, <code>htmlFor</code> და არა <code>for</code>',
                '<code>{ }</code>: JSX-ში ნებისმიერი JS გამოსახულება, მაგ. <code>{leaves.length}</code>',
                '<code>style={{ color: \'red\' }}</code>: ობიექტი, camelCase თვისებებით',
                'ერთი მშობელი: რამდენიმე ელემენტი <code>&lt;div&gt;</code>-ში ან Fragment-ში <code>&lt;&gt;…&lt;/&gt;</code>',
                '<code>children</code>: ის, რაც ტეგებს შორის წერია: <code>&lt;Card&gt;ტექსტი&lt;/Card&gt;</code>',
                'Props-ის ტიპი TypeScript-ით: <code>type LeafProps = { color: string }</code>',
                'ერთი კომპონენტი, ერთი ფაილი: <code>Leaf.tsx</code>',
            ],
            code: `function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

<Card title="მუხა">
  <Leaf color="green" />
  <p>12 წლის</p>
</Card>`,
            tip: 'პატარა ასოთი დაწერილი <code>&lt;leaf /&gt;</code> React-ისთვის ჩვეულებრივი HTML ტეგია: შენს <code>Leaf</code> ფუნქციას ის არასდროს გამოიძახებს.',
        },
        run(out) {
            mountReact(out, h(DemoComponents));
        },
    },
    {
        id: 'state',
        title: 'State და ივენთები',
        en: 'useState',
        label: 'State',
        short: 'State',
        icon: 'zap',
        summary: 'State კომპონენტის მეხსიერებაა. როცა მას setter-ით ცვლი, React კომპონენტს თავიდან იძახებს (re-render) და ეკრანი თავისით ახლდება. DOM-ს ხელით აღარ ეხები.',
        analogy: 'State სტადიონის ტაბლოს ჰგავს: ანგარიშს ხელით არავინ ხატავს, რიცხვი იცვლება და ტაბლო თავად აჩვენებს ახალს. setCount ახალ რიცხვს აწვდის, ეკრანს კი React ხატავს.',
        keyPoints: [
            'useState აბრუნებს წყვილს: [მნიშვნელობა, setter]',
            'state-ს პირდაპირ არ ცვლი, მხოლოდ setter-ით',
            'ახალი მასივი ან ობიექტი, ძველის შეცვლის ნაცვლად',
        ],
        bridge: 'კომპონენტი ფოთლებს უკვე ხატავს. ახლა მათი რაოდენობა state-შია და ღილაკით იცვლება.',
        code: `function Garden() {
  const [leaves, setLeaves] = useState(3);

  return (
    <div>
      <p>ფოთლები: {leaves}</p>
      <button onClick={() => setLeaves(leaves + 1)}>
        ფოთლის დამატება
      </button>
    </div>
  );
}`,
        more: {
            title: 'განახლება, snapshot და იმუტაბელურობა',
            points: [
                '<code>useState(0)</code>: 0 მხოლოდ პირველ რენდერზე გამოიყენება',
                'setter state-ს მყისიერად არ ცვლის: ახალ მნიშვნელობას შემდეგ რენდერზე ნახავ (snapshot)',
                '<code>setX(x =&gt; x + 1)</code>: updater, როცა ახალი მნიშვნელობა წინაზეა დამოკიდებული',
                'მასივი: <code>[...list, item]</code> დამატება, <code>filter</code> წაშლა, <code>map</code> შეცვლა',
                'ობიექტი: <code>{ ...tree, age: 13 }</code>, არა <code>tree.age = 13</code>',
                '<code>onClick={fn}</code> ფუნქციას გადასცემს, <code>onClick={fn()}</code> კი მას რენდერისას იძახებს',
                'Controlled input: <code>value={name}</code> და <code>onChange={e =&gt; setName(e.target.value)}</code>',
                'რასაც state-იდან ითვლი, state-ში ნუ შეინახავ: <code>const total = items.length</code>',
            ],
            code: `const [tree, setTree] = useState({ name: 'მუხა', leaves: ['green'] });

// არასწორი: მუტაცია, React ცვლილებას ვერ ხედავს
tree.leaves.push('yellow');

// სწორი: ახალი ობიექტი და ახალი მასივი
setTree({ ...tree, leaves: [...tree.leaves, 'yellow'] });

// სამჯერ +1 = +3, რადგან ყოველი updater წინა შედეგს იღებს
setCount(c => c + 1);
setCount(c => c + 1);
setCount(c => c + 1);`,
            tip: 'React ძველ და ახალ state-ს <code>Object.is</code>-ით ადარებს. თუ ძველი მასივი შეცვალე და ისევ ის გადაეცი, React ჩათვლის, რომ არაფერი შეცვლილა, და ეკრანი არ განახლდება.',
        },
        run(out) {
            mountReact(out, h(DemoState));
        },
    },
    {
        id: 'lists',
        title: 'სიები და პირობები',
        en: 'map · key · &amp;&amp;',
        label: 'სია',
        short: 'Lists',
        icon: 'list',
        summary: 'მასივს JSX-ად <code>map()</code> აქცევს, ყოველ ელემენტს კი სტაბილური <code>key</code> სჭირდება. რა გამოჩნდეს ეკრანზე, ამას <code>&amp;&amp;</code>, ternary ან ადრეული <code>return</code> წყვეტს.',
        analogy: 'key გარდერობის ნომერს ჰგავს: ქურთუკს ნომრით ეძებენ და არა რიგით. თუ ნომრად რიგის ადგილს (index) გამოიყენებ, ერთი ქურთუკის გატანის შემდეგ ყველა ნომერი აირევა.',
        keyPoints: [
            'items.map(item => <Leaf key={item.id} />)',
            'key უნიკალური და სტაბილურია: id, არა index',
            'ცარიელი სიისთვის ცალკე შეტყობინება',
        ],
        bridge: 'state-ში რიცხვის ნაცვლად ახლა ფოთლების მასივია, map კი თითოეულს კომპონენტად აქცევს.',
        code: `const [leaves, setLeaves] = useState([
  { id: 1, color: 'green' },
  { id: 2, color: 'yellow' },
]);

if (leaves.length === 0) return <p>ბაღი ცარიელია</p>;

return (
  <ul>
    {leaves.map(leaf => (
      <li key={leaf.id}>
        {leaf.color === 'yellow' ? 'ყვითელი' : 'მწვანე'} ფოთოლი
      </li>
    ))}
  </ul>
);`,
        more: {
            title: 'key, ფილტრი და პირობითი რენდერი',
            points: [
                '<code>key</code> React-ს ეუბნება, რომელი ელემენტი რომელია, როცა სია იცვლება',
                'index key-ად მხოლოდ მაშინ, როცა სია არასდროს იცვლება და არ ლაგდება',
                '<code>crypto.randomUUID()</code>: id ახალი ელემენტისთვის, შექმნისას (არა რენდერში)',
                '<code>cond &amp;&amp; &lt;X /&gt;</code>: აჩვენე, ან არაფერი',
                '<code>cond ? &lt;A /&gt; : &lt;B /&gt;</code>: ორიდან ერთი',
                '<code>{count &amp;&amp; &lt;X /&gt;}</code> 0-ზე ეკრანზე „0“-ს დაწერს: <code>count &gt; 0 &amp;&amp;</code> სჯობს',
                'ფილტრის შედეგი state-ში არ ინახება: <code>leaves.filter(…)</code> რენდერის დროს ითვლება',
            ],
            code: `const [filter, setFilter] = useState('all');

// derived: ყოველ რენდერზე ითვლება, state-ში არ ინახება
const visible = filter === 'all'
  ? leaves
  : leaves.filter(l => l.color === filter);

function removeLeaf(id: number) {
  setLeaves(leaves.filter(l => l.id !== id));
}

{visible.length > 0 && <p>ნაჩვენებია: {visible.length}</p>}`,
            tip: 'key-ის გარეშე React კონსოლში გაგაფრთხილებს. key={index} გაფრთხილებას აქრობს, ბაგს კი არა: წაშლის ან დალაგების შემდეგ ელემენტის state შეიძლება სხვა ელემენტს მიეწეროს. გაუშვი დემო და ნახე.',
        },
        run(out) {
            mountReact(out, h(DemoLists));
        },
    },
    {
        id: 'effects',
        title: 'Effect-ები და Hook-ები',
        en: 'useEffect · useRef',
        label: 'Effect',
        short: 'Effects',
        icon: 'refresh',
        summary: 'useEffect კომპონენტს გარე სამყაროსთან აკავშირებს: API, ტაიმერი, localStorage. ის ეშვება რენდერის შემდეგ, dependency-ს შეცვლისას თავიდან, cleanup კი წინა გაშვებას ასუფთავებს. useRef მნიშვნელობას რენდერის გარეშე ინახავს.',
        analogy: 'Effect სასტუმროს ოთახს ჰგავს: შესვლისას შუქს ანთებ (setup), გასვლისას აქრობ (cleanup). თუ ჩაქრობა დაგავიწყდა, ყოველ ახალ შესვლაზე კიდევ ერთი ნათურა რჩება ანთებული: ასე ჩნდება ორმაგი ტაიმერი და მეხსიერების გაჟონვა.',
        keyPoints: [
            '[ ]: ერთხელ, როცა კომპონენტი ჩნდება',
            '[city]: ყოველთვის, როცა city იცვლება',
            'return () => …: cleanup, წინა გაშვების გასუფთავება',
        ],
        bridge: 'ბაღის მონაცემი ახლა სერვერიდან მოდის. fetch რენდერის შიგნით უსასრულო ციკლს მოგვცემდა, ამიტომ ის effect-ში გადადის.',
        code: `function Weather({ city }: { city: string }) {
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/weather?city=' + city, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setTemp(data.temp))
      .catch(err => { if (err.name !== 'AbortError') console.error(err); });

    return () => controller.abort(); // cleanup
  }, [city]);

  return <p>{city}: {temp ?? '...'}°</p>;
}`,
        more: {
            title: 'dependency-ები, cleanup, useRef და custom hook',
            points: [
                'Effect გარე სისტემასთან სინქრონიზაციაა. თუ მხოლოდ state-იდან რაღაცას ითვლი, effect არ გჭირდება',
                'dependency array-ში ყველაფერი, რასაც effect კითხულობს: props, state, ფუნქციები',
                'Race condition: ძველი პასუხი ახალს გადაფარავს. გამოსავალი: AbortController ან ignore flag',
                'Dev რეჟიმში StrictMode effect-ს ორჯერ უშვებს: ეს cleanup-ის შემოწმებაა, არა ბაგი',
                '<code>useRef(0)</code>: <code>ref.current</code> იცვლება, მაგრამ რენდერს არ იწვევს',
                '<code>&lt;input ref={inputRef} /&gt;</code> და <code>inputRef.current.focus()</code>: DOM-ზე წვდომა',
                'Custom hook: ფუნქცია, რომლის სახელი <code>use</code>-ით იწყება და შიგნით hook-ებს იყენებს',
                'Hook-ების წესი: მხოლოდ კომპონენტის ზედა დონეზე, არასდროს if-ში ან ციკლში',
            ],
            code: `function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

const [leaves, setLeaves] = useLocalStorage('leaves', 3);`,
            tip: 'თუ effect-ში setState-ს იძახებ და იმავე state-ს dependency-ში წერ, effect თავის თავს უსასრულოდ გაუშვებს. ჯერ იკითხე: ეს მართლა გარე სისტემაა?',
        },
        run(out) {
            mountReact(out, h(DemoEffects));
        },
    },
    {
        id: 'context',
        title: 'Context და useReducer',
        en: 'createContext · useReducer',
        label: 'Context',
        short: 'Context',
        icon: 'share',
        summary: 'Context მნიშვნელობას ხის სიღრმეში აწვდის props-ის ხელით გადაცემის (prop drilling) გარეშე. useReducer რთული state-ის ცვლილებებს ერთ სუფთა ფუნქციაში აგროვებს: dispatch(action) → reducer → ახალი state.',
        analogy: 'Context რადიოსადგურს ჰგავს: Provider გადასცემს, ნებისმიერი კომპონენტი, რომელიც useContext-ით „ტალღაზეა“, იღებს. შუალედურ კომპონენტებს არაფერი ესაქმებათ. Reducer კი ბანკის ოპერატორია: განაცხადს აძლევ (action), ის წესებით ანგარიშს ცვლის.',
        keyPoints: [
            'createContext → Provider value → useContext',
            'reducer სუფთა ფუნქციაა: (state, action) => ახალი state',
            'Provider-ის value-ს ცვლილება ყველა მომხმარებელს არენდერებს',
        ],
        bridge: 'ბაღის სეზონი ყველა ფოთოლს სჭირდება. props-ით ხუთ დონეზე გადაცემის ნაცვლად Context-ში ვდებთ.',
        code: `type Action = { type: 'add'; color: string } | { type: 'clear' };

function gardenReducer(state: string[], action: Action) {
  switch (action.type) {
    case 'add':   return [...state, action.color];
    case 'clear': return [];
  }
}

const SeasonContext = createContext('autumn');

function App() {
  const [leaves, dispatch] = useReducer(gardenReducer, []);
  return (
    <SeasonContext.Provider value="winter">
      <Garden leaves={leaves} onAdd={() => dispatch({ type: 'add', color: 'white' })} />
    </SeasonContext.Provider>
  );
}

function Leaf() {
  const season = useContext(SeasonContext); // props-ის გარეშე
  return <span className={season}>ფოთოლი</span>;
}`,
        more: {
            title: 'Provider, reducer და „სად ცხოვრობს state?“',
            points: [
                'Prop drilling: props გადის კომპონენტებში, რომლებსაც ის თავად არ სჭირდებათ',
                '<code>createContext(default)</code>: default მხოლოდ მაშინ ჩანს, როცა ზემოთ Provider არ არის',
                'reducer-ში არ არის fetch, random ან მუტაცია: მხოლოდ გამოთვლა',
                'Action-ის ტიპი: discriminated union, <code>{ type: \'add\' } | { type: \'clear\' }</code>',
                'Context + useReducer: პატარა „გლობალური store“ ბიბლიოთეკის გარეშე',
                'Zustand: როცა გლობალური state ბევრია და selector-ები გჭირდება',
                'სად ცხოვრობს state? სერვერის → TanStack Query, URL-ის → search params, ფორმის → RHF, დანარჩენი → useState / Zustand',
            ],
            code: `// Zustand: იგივე ბაღი, Provider-ის გარეშე
const useGarden = create<GardenStore>((set) => ({
  leaves: [],
  add: (color) => set((s) => ({ leaves: [...s.leaves, color] })),
}));

function LeafCount() {
  const count = useGarden((s) => s.leaves.length); // selector
  return <p>{count}</p>;
}`,
            tip: 'Context state-ის მართვის ინსტრუმენტი არ არის, ის მხოლოდ „მილია“, რომლითაც მნიშვნელობა მიედინება. თავად state useState-ში ან useReducer-ში ცხოვრობს.',
        },
        run(out) {
            mountReact(out, h(DemoContext));
        },
    },
    {
        id: 'router',
        title: 'Routing',
        en: 'React Router',
        label: 'Router',
        short: 'Router',
        icon: 'route',
        summary: 'SPA-ში სერვერზე ერთი index.html-ია, გვერდებს კი Router ცვლის URL-ის მიხედვით, გადატვირთვის გარეშე. URL state-ის ნაწილია: მისი გაზიარება შეიძლება და Back ღილაკიც მუშაობს.',
        analogy: 'Router სასტუმროს რეცეფციას ჰგავს: სასტუმრო (index.html) ერთია, ოთახის ნომრით (URL) კი სწორ ოთახში გაგგზავნიან. /leaves/7 ნიშნავს: „ფოთლების სართული, ოთახი 7“.',
        keyPoints: [
            '<Link to> და არა <a href>: გადატვირთვის გარეშე',
            ':id დინამიური პარამეტრია, useParams კითხულობს',
            'search params (?color=yellow) ფილტრს URL-ში ინახავს',
        ],
        bridge: 'ბაღს ახლა რამდენიმე გვერდი აქვს: სია და თითოეული ფოთლის დეტალები. სეზონი Context-შია, ფილტრი URL-ში.',
        code: `<BrowserRouter>
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/leaves" element={<LeafList />} />
      <Route path="/leaves/:id" element={<LeafPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
</BrowserRouter>

function LeafPage() {
  const { id } = useParams(); // '7': სტრიქონია!
  return <h1>ფოთოლი #{id}</h1>;
}`,
        more: {
            title: 'Layout, ნავიგაცია და დაცული გვერდები',
            points: [
                '<code>&lt;Outlet /&gt;</code>: layout-ში ადგილი, სადაც შვილი გვერდი ჩაჯდება',
                '<code>&lt;NavLink&gt;</code>: Link, რომელიც აქტიურ გვერდზე კლასს იღებს',
                '<code>useNavigate()</code>: გადასვლა კოდიდან, მაგ. ფორმის გაგზავნის შემდეგ',
                '<code>useSearchParams()</code>: <code>?color=yellow&amp;page=2</code>-ის წაკითხვა და შეცვლა',
                'params ყოველთვის სტრიქონია: <code>Number(id)</code>',
                '<code>path="*"</code>: 404 ყველაფრისთვის, რაც არ დაემთხვა',
                'დაცული მარშრუტი: მომხმარებლის გარეშე <code>&lt;Navigate to="/login" /&gt;</code>',
                'React Router 8-ში ყველაფერი <code>react-router</code> პაკეტიდან იმპორტდება',
            ],
            code: `function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function LeafList() {
  const [params, setParams] = useSearchParams();
  const color = params.get('color') ?? 'all';
  return <button onClick={() => setParams({ color: 'yellow' })}>ყვითლები</button>;
}`,
            tip: 'Guard მხოლოდ UI-ია: მონაცემზე წვდომას მაინც სერვერი ამოწმებს. ჰოსტინგზე კი <code>/leaves/7</code>-ის განახლებამ შეიძლება 404 მოგცეს, თუ ყველა მისამართი <code>index.html</code>-ზე არ გადამისამართდა (rewrite).',
        },
        run(out) {
            mountReact(out, h(DemoRouter));
        },
    },
    {
        id: 'forms',
        title: 'ფორმები',
        en: 'React Hook Form · Zod',
        label: 'ფორმა',
        short: 'Forms',
        icon: 'clipboard',
        summary: 'Zod-ის ერთი სქემა ორ საქმეს აკეთებს: მონაცემს ამოწმებს და მისგან TypeScript-ის ტიპს იღებ. React Hook Form ველებს თავად მართავს, ამიტომ ყოველ ასოზე მთელი ფორმა თავიდან არ რენდერდება.',
        analogy: 'Zod-ის სქემა საზღვრის წესებს ჰგავს: „პასპორტი სავალდებულოა, ასაკი 18+“. React Hook Form მესაზღვრეა, რომელიც ამ წესებით ყველა მგზავრს ამოწმებს და თითოეულს ზუსტად ეუბნება, რა აკლია.',
        keyPoints: [
            'register(name) ველს ფორმას აკავშირებს',
            'errors.name?.message: შეცდომა ველის გვერდით',
            'z.infer<typeof schema>: ტიპი სქემიდან',
        ],
        bridge: 'ბაღში ახალი ხის დასამატებლად ფორმა გვჭირდება: სახელი, ასაკი, ფერი, და ყველა წესი ერთ სქემაში.',
        code: `const treeSchema = z.object({
  name: z.string().min(2, 'მინიმუმ 2 სიმბოლო'),
  age: z.coerce.number().int().min(1, 'ასაკი 1-დან'),
  color: z.enum(['green', 'yellow']),
});
type Tree = z.infer<typeof treeSchema>;

const { register, handleSubmit, formState: { errors, isSubmitting } } =
  useForm<Tree>({ resolver: zodResolver(treeSchema) });

<form onSubmit={handleSubmit(saveTree)}>
  <input {...register('name')} />
  {errors.name && <p>{errors.name.message}</p>}
  <button disabled={isSubmitting}>შენახვა</button>
</form>`,
        more: {
            title: 'სქემა, შეცდომები და დინამიური ველები',
            points: [
                'useState-ზე აწყობილ ფორმას ყოველ ველზე value, onChange და error სჭირდება, ყოველი ასო კი რენდერს იწვევს',
                '<code>handleSubmit(fn)</code>: fn მხოლოდ ვალიდური მონაცემით გამოიძახება',
                '<code>formState</code>: <code>errors</code>, <code>isSubmitting</code>, <code>isDirty</code>',
                '<code>.refine()</code>: წესი რამდენიმე ველზე, მაგ. პაროლის დადასტურება',
                '<code>z.coerce.number()</code>: input-ის სტრიქონს რიცხვად აქცევს',
                '<code>Controller</code>: არასტანდარტული ველისთვის (date picker, select-ის ბიბლიოთეკა)',
                '<code>useFieldArray</code>: ველების დინამიური სია, მაგ. რამდენიმე ტელეფონი',
                'იგივე სქემა სერვერზეც ამოწმებს: კლიენტის ვალიდაცია მხოლოდ კომფორტია',
            ],
            code: `const signup = z.object({
  phone: z.string().regex(/^\\+995 5\\d{2} \\d{3} \\d{3}$/, 'ფორმატი: +995 5XX XXX XXX'),
  password: z.string().min(8, 'მინიმუმ 8 სიმბოლო'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'პაროლები არ ემთხვევა',
  path: ['confirm'],
});`,
            tip: 'ბრაუზერის ვალიდაციას DevTools-ით ან პირდაპირი მოთხოვნით ადვილად აუვლი გვერდს. სერვერი იმავე სქემით ყოველთვის თავიდან ამოწმებს.',
        },
        run(out) {
            mountReact(out, h(DemoForms));
        },
    },
    {
        id: 'query',
        title: 'სერვერის მონაცემები',
        en: 'TanStack Query',
        label: 'Query',
        short: 'Query',
        icon: 'database',
        summary: 'სერვერის მონაცემი შენი არ არის: ის სხვაგან ცხოვრობს და შეიძლება მოძველდეს. TanStack Query მას key-ით ქეშავს, ერთნაირ მოთხოვნებს აერთიანებს, თავად აახლებს და loading / error მდგომარეობებს გაძლევს.',
        analogy: 'TanStack Query ბიბლიოთეკარს ჰგავს: წიგნს ერთხელ მოიტანს და თაროზე (ქეშში) დებს. მეორე მკითხველი იმავე წიგნს (queryKey) თაროდან იღებს. როცა ახალი გამოცემა გამოდის (mutation), ბიბლიოთეკარი ძველს ხსნის (invalidate) და ახალს მოიტანს.',
        keyPoints: [
            'queryKey მონაცემის მისამართია ქეშში',
            'staleTime: რამდენ ხანს ითვლება ახლად',
            'mutation-ის შემდეგ: invalidateQueries',
        ],
        bridge: 'ფოთლები ახლა სერვერზე ინახება. useEffect + fetch-ის ნაცვლად ქეში, ხელახალი ცდა და განახლება ერთ hook-შია.',
        code: `function LeafList() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['leaves'],
    queryFn: () => fetch('/api/leaves').then(r => r.json()),
    staleTime: 60_000,
  });

  if (isPending) return <p>იტვირთება...</p>;
  if (isError) return <p>ვერ ჩაიტვირთა</p>;
  return <ul>{data.map(l => <li key={l.id}>{l.color}</li>)}</ul>;
}`,
        more: {
            title: 'mutation, invalidation და optimistic update',
            points: [
                '<code>isPending</code>: მონაცემი ჯერ არ გვაქვს. <code>isFetching</code>: ფონზე ახლდება',
                'ერთი და იგივე queryKey ორ კომპონენტში = ერთი მოთხოვნა',
                'key-ში ყველაფერი, რაზეც მოთხოვნაა დამოკიდებული: <code>[\'leaves\', { color, page }]</code>',
                '<code>useMutation</code>: POST, PUT, DELETE. <code>onSuccess</code>-ში ქეშის განახლება',
                'Optimistic update: UI მაშინვე იცვლება, შეცდომისას კი ძველი მნიშვნელობა ბრუნდება (rollback)',
                '<code>useInfiniteQuery</code>: „მეტის ჩატვირთვა“ და უსასრულო scroll',
                'Client state (მოდალი ღიაა?) useState-ში ან Zustand-ში, server state Query-ში',
            ],
            code: `const queryClient = useQueryClient();

const addLeaf = useMutation({
  mutationFn: (color: string) =>
    fetch('/api/leaves', { method: 'POST', body: JSON.stringify({ color }) }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['leaves'] });
  },
});

<button onClick={() => addLeaf.mutate('yellow')} disabled={addLeaf.isPending}>
  დამატება
</button>`,
            tip: 'სერვერის მონაცემის useState-ში კოპირება ორ „სიმართლეს“ ქმნის, რომლებიც ერთმანეთს დაშორდება. data უკვე state-ია: პირდაპირ ის გამოიყენე.',
        },
        run(out) {
            mountReact(out, h(DemoQuery));
        },
    },
];
