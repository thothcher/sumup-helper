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
        topic: 'components',
        goal: 'ბაღში მწვანე ფოთოლი უნდა გამოჩნდეს',
        lines: [
            'function Leaf({ color }) {',
            '  return <span className={color}>ფოთოლი</span>;',
            '}',
            '',
            'function Garden() {',
            '  return <leaf color="green" />;',
            '}',
        ],
        bug: 5,
        fix: '  return <Leaf color="green" />;',
        hint: 'როგორ არჩევს React, რომელია HTML ტეგი და რომელი შენი კომპონენტი?',
        explain: 'პატარა ასოთი დაწერილ <leaf>-ს React ჩვეულებრივ HTML ტეგად თვლის და Leaf ფუნქციას არ იძახებს. კომპონენტი ყოველთვის დიდი ასოთი იწერება: <Leaf />.',
    },
    {
        topic: 'state',
        goal: 'ღილაკზე დაჭერისას რიცხვი 1-ით უნდა გაიზარდოს',
        lines: [
            'function Counter() {',
            '  const [count, setCount] = useState(0);',
            '  return (',
            '    <button onClick={setCount(count + 1)}>',
            '      {count}',
            '    </button>',
            '  );',
            '}',
        ],
        bug: 3,
        fix: '    <button onClick={() => setCount(count + 1)}>',
        hint: 'onClick-ს ფუნქცია გადაეცემა თუ ფუნქციის გამოძახების შედეგი?',
        explain: 'onClick={setCount(count + 1)} setCount-ს რენდერის დროს იძახებს და არა დაჭერისას. ეს ახალ რენდერს იწვევს, ის კიდევ ერთს, და React წყვეტს: „Too many re-renders“. საჭიროა ფუნქცია: () => setCount(count + 1).',
    },
    {
        topic: 'state',
        goal: 'ღილაკი სიას ყვითელ ფოთოლს უნდა უმატებდეს და ეკრანზეც უნდა ჩანდეს',
        lines: [
            "const [leaves, setLeaves] = useState(['green']);",
            '',
            'function addYellow() {',
            '  const next = leaves;',
            "  next.push('yellow');",
            '  setLeaves(next);',
            '}',
        ],
        bug: 3,
        fix: '  const next = [...leaves];',
        hint: 'next ახალი მასივია თუ იგივე, რაც state-შია?',
        explain: 'next = leaves მასივს არ აკოპირებს: ორივე ერთსა და იმავე მასივზე მიუთითებს. push ძველ state-ს ცვლის, setLeaves კი იმავე მასივს იღებს, React ცვლილებას ვერ ამჩნევს და ეკრანი არ ახლდება. ჯერ ასლი: [...leaves].',
    },
    {
        topic: 'lists',
        goal: 'კონსოლში გაფრთხილება არ უნდა იყოს და წაშლისას სწორი ელემენტი უნდა გაქრეს',
        lines: [
            '<ul>',
            '  {leaves.map(leaf => (',
            '    <li>{leaf.color}</li>',
            '  ))}',
            '</ul>',
        ],
        bug: 2,
        fix: '    <li key={leaf.id}>{leaf.color}</li>',
        hint: 'რითი არჩევს React სიის ელემენტებს ერთმანეთისგან, როცა სია იცვლება?',
        explain: 'map-ში დაბრუნებულ ყოველ ელემენტს key სჭირდება. მის გარეშე React გაგაფრთხილებს და ელემენტებს რიგით ადარებს. key={leaf.id} სტაბილურია და ელემენტს თავის მონაცემთან აკავშირებს.',
    },
    {
        topic: 'lists',
        goal: 'როცა შეტყობინება არ არის, ეკრანზე არაფერი უნდა ჩანდეს',
        lines: [
            'function Inbox({ messages }) {',
            '  return (',
            '    <div>',
            '      {messages.length && <p>ახალი: {messages.length}</p>}',
            '    </div>',
            '  );',
            '}',
        ],
        bug: 3,
        fix: '      {messages.length > 0 && <p>ახალი: {messages.length}</p>}',
        hint: 'რას აბრუნებს 0 && <p>…</p>? და რას აკეთებს React რიცხვთან?',
        explain: '0 falsy-ა, ამიტომ && მას აბრუნებს, React კი რიცხვ 0-ს ეკრანზე წერს. პირობა boolean უნდა იყოს: messages.length > 0.',
    },
    {
        topic: 'effects',
        goal: 'მომხმარებელი ერთხელ უნდა ჩაიტვირთოს',
        lines: [
            'const [user, setUser] = useState(null);',
            '',
            'useEffect(() => {',
            "  fetch('/api/me')",
            '    .then(res => res.json())',
            '    .then(data => setUser(data));',
            '}, [user]);',
        ],
        bug: 6,
        fix: '}, []);',
        hint: 'რა იცვლება effect-ის შიგნით და რაზეა effect დამოკიდებული?',
        explain: 'effect user-ს ცვლის და user-ზევე არის დამოკიდებული. ყოველი პასუხი ახალ ობიექტს ქმნის, effect თავიდან ეშვება, და ასე უსასრულოდ. ერთხელ ჩატვირთვისთვის dependency ცარიელი მასივია.',
    },
    {
        topic: 'effects',
        goal: 'წამზომი უნდა ითვლიდეს: 1, 2, 3…',
        lines: [
            'const [seconds, setSeconds] = useState(0);',
            '',
            'useEffect(() => {',
            '  const id = setInterval(() => {',
            '    setSeconds(seconds + 1);',
            '  }, 1000);',
            '  return () => clearInterval(id);',
            '}, []);',
        ],
        bug: 4,
        fix: '    setSeconds(s => s + 1);',
        hint: 'effect ერთხელ ეშვება. რას „ხედავს“ seconds მის შიგნით ყოველ წამს?',
        explain: 'effect ერთხელ ეშვება, ამიტომ მის შიგნით seconds სამუდამოდ 0-ია (stale closure). ყოველ წამს setSeconds(0 + 1) სრულდება და ეკრანზე მუდამ 1 წერია. updater ფუნქცია ყოველთვის უახლეს მნიშვნელობას იღებს: s => s + 1.',
    },
    {
        topic: 'context',
        goal: 'ყველა ფოთოლმა უნდა იცოდეს, რომ ზამთარია',
        lines: [
            "const SeasonContext = createContext('autumn');",
            '',
            'function App() {',
            '  return (',
            '    <SeasonContext.Provider season="winter">',
            '      <Garden />',
            '    </SeasonContext.Provider>',
            '  );',
            '}',
        ],
        bug: 4,
        fix: '    <SeasonContext.Provider value="winter">',
        hint: 'რომელ prop-ს კითხულობს Provider?',
        explain: 'Provider მნიშვნელობას მხოლოდ value prop-ით იღებს. season-ს ის უგულებელყოფს, ამიტომ ყველა useContext default-ს, „autumn“-ს აბრუნებს.',
    },
    {
        topic: 'router',
        goal: 'გვერდზე გადასვლისას კალათა (state) არ უნდა დაიკარგოს',
        lines: [
            'function Nav() {',
            '  return (',
            '    <nav>',
            '      <Link to="/">მთავარი</Link>',
            '      <a href="/leaves">ფოთლები</a>',
            '    </nav>',
            '  );',
            '}',
        ],
        bug: 4,
        fix: '      <Link to="/leaves">ფოთლები</Link>',
        hint: 'რომელი ბმული ტვირთავს გვერდს თავიდან?',
        explain: '<a href> ბრაუზერს გვერდს თავიდან ატვირთვინებს: მთელი React აპი ხელახლა იწყება და ყველა state ქრება. <Link> მისამართს გადატვირთვის გარეშე ცვლის.',
    },
    {
        topic: 'router',
        goal: '/leaves/2 მისამართზე მეორე ფოთოლი უნდა გამოჩნდეს',
        lines: [
            "const leaves = [{ id: 1, name: 'მუხა' }, { id: 2, name: 'ცაცხვი' }];",
            '',
            'function LeafPage() {',
            '  const { id } = useParams();',
            '  const leaf = leaves.find(l => l.id === id);',
            '  return <h1>{leaf?.name ?? \'ვერ მოიძებნა\'}</h1>;',
            '}',
        ],
        bug: 4,
        fix: '  const leaf = leaves.find(l => l.id === Number(id));',
        hint: 'რა ტიპისაა id, რომელიც useParams-იდან მოდის?',
        explain: "URL-იდან მოსული პარამეტრი ყოველთვის სტრიქონია: '2'. 2 === '2' false-ია, ამიტომ find ვერაფერს პოულობს. ჯერ Number(id).",
    },
    {
        topic: 'forms',
        goal: 'ველში აკრეფა უნდა შეიძლებოდეს',
        lines: [
            'function NameField() {',
            "  const [name, setName] = useState('');",
            '  return (',
            '    <input value={name} placeholder="სახელი" />',
            '  );',
            '}',
        ],
        bug: 3,
        fix: '    <input value={name} onChange={e => setName(e.target.value)} placeholder="სახელი" />',
        hint: 'value React-ს ეკუთვნის. ვინ ცვლის მას, როცა ასოს აკრეფ?',
        explain: 'value={name} ველს state-ს უკავშირებს, მაგრამ onChange არ არის, ამიტომ state არასდროს იცვლება და ველი „გაყინულია“. controlled input-ს ორივე სჭირდება: value და onChange.',
    },
    {
        topic: 'query',
        goal: 'სხვა ფოთოლზე გადასვლისას მისი მონაცემი უნდა ჩაიტვირთოს',
        lines: [
            'function LeafDetails({ id }: { id: number }) {',
            '  const { data } = useQuery({',
            "    queryKey: ['leaf'],",
            '    queryFn: () => getLeaf(id),',
            '  });',
            '  return <h2>{data?.name}</h2>;',
            '}',
        ],
        bug: 2,
        fix: "    queryKey: ['leaf', id],",
        hint: 'როგორ არჩევს ქეში ფოთოლ 1-ის მონაცემს ფოთოლ 2-ისგან?',
        explain: 'ყველა ფოთოლი ერთსა და იმავე key-ს იყენებს, ამიტომ Query ფიქრობს, რომ მონაცემი უკვე აქვს, და პირველი ფოთლის ქეშს აჩვენებს. key-ში ყველაფერი უნდა იყოს, რაზეც queryFn არის დამოკიდებული.',
    },
];

/** answer: index into options. label: what the student predicts. */
const SCREEN = 'ეკრანზე გამოჩნდება:';
const CONSOLE = 'კონსოლში დაიბეჭდება:';

const OUTPUTS = [
    {
        code: 'const [count, setCount] = useState(0);\n\nfunction handleClick() {\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount(count + 1);\n}\n// ერთი დაჭერის შემდეგ: <p>{count}</p>',
        label: SCREEN, icon: 'monitor',
        options: ['1', '3', '0', 'შეცდომა'],
        answer: 0,
        explain: 'ამ რენდერში count არის 0, ამიტომ სამივე ხაზი წერს setCount(0 + 1). state snapshot-ია: ახალ მნიშვნელობას მხოლოდ შემდეგი რენდერი ნახავს.',
    },
    {
        code: 'function handleClick() {\n  setCount(c => c + 1);\n  setCount(c => c + 1);\n  setCount(c => c + 1);\n}\n// count იყო 0. დაჭერის შემდეგ: <p>{count}</p>',
        label: SCREEN, icon: 'monitor',
        options: ['1', '3', '0', '6'],
        answer: 1,
        explain: 'updater ფუნქცია წინა updater-ის შედეგს იღებს: 0 → 1 → 2 → 3.',
    },
    {
        code: 'const [count, setCount] = useState(0);\n\nfunction handleClick() {\n  setCount(count + 1);\n  console.log(count);\n}',
        label: CONSOLE,
        options: ['0', '1', 'undefined', 'Promise'],
        answer: 0,
        explain: 'setCount ცვლადს მყისიერად არ ცვლის: ის შემდეგ რენდერს გეგმავს. ამ ფუნქციაში count ისევ 0-ია.',
    },
    {
        code: "function App() {\n  console.log('render');\n  useEffect(() => console.log('effect'));\n  return <p>გამარჯობა</p>;\n}",
        label: 'კონსოლში, თანმიმდევრობით (StrictMode-ის გარეშე):',
        options: ['render → effect', 'effect → render', 'მხოლოდ render', 'მხოლოდ effect'],
        answer: 0,
        explain: 'ჯერ რენდერი (ფუნქცია სრულდება და JSX-ს აბრუნებს), React ეკრანს ახატავს და მხოლოდ ამის შემდეგ უშვებს effect-ს.',
    },
    {
        code: "useEffect(() => {\n  console.log('setup');\n  return () => console.log('cleanup');\n}, []);\n// <StrictMode>, development რეჟიმი",
        label: CONSOLE,
        options: ['setup', 'setup → cleanup → setup', 'setup → setup', 'cleanup → setup'],
        answer: 1,
        explain: 'Dev რეჟიმში StrictMode კომპონენტს ერთხელ „ხსნის და ხურავს“, რომ შეამოწმოს, cleanup სწორად მუშაობს თუ არა. production-ში მხოლოდ ერთი setup იქნება.',
    },
    {
        code: 'const count = 0;\nreturn <div>{count && <p>შეტყობინებები</p>}</div>;',
        label: SCREEN, icon: 'monitor',
        options: ['არაფერი', '0', 'შეტყობინებები', 'false'],
        answer: 1,
        explain: '0 && … აბრუნებს 0-ს, React კი რიცხვებს ხატავს. false, null და undefined არაფერს ხატავს, 0 კი ჩანს.',
    },
    {
        code: "return <p>{['ა', 'ბ', 'გ']}</p>;",
        label: SCREEN, icon: 'monitor',
        options: ['ა,ბ,გ', 'აბგ', "['ა', 'ბ', 'გ']", 'შეცდომა'],
        answer: 1,
        explain: 'JSX-ში მასივის ყოველი ელემენტი რიგრიგობით იხატება, მძიმეების გარეშე. map ამიტომ მუშაობს: ის JSX ელემენტების მასივს აბრუნებს.',
    },
    {
        code: 'const clicks = useRef(0);\n\nreturn (\n  <button onClick={() => clicks.current++}>\n    {clicks.current}\n  </button>\n);\n// სამი დაჭერის შემდეგ ღილაკზე:',
        label: SCREEN, icon: 'monitor',
        options: ['0', '3', '1', 'შეცდომა'],
        answer: 0,
        explain: 'ref.current იცვლება (3 გახდა), მაგრამ ref-ის შეცვლა რენდერს არ იწვევს, ამიტომ ღილაკზე ისევ 0 წერია. რაც ეკრანზე ჩანს, ის state-ში უნდა იყოს.',
    },
    {
        code: "const [user, setUser] = useState({ name: 'ნინო' });\n\nfunction rename() {\n  user.name = 'ანა';\n  setUser(user);\n}\n// rename()-ის შემდეგ: <p>{user.name}</p>",
        label: SCREEN, icon: 'monitor',
        options: ['ნინო', 'ანა', 'undefined', 'შეცდომა'],
        answer: 0,
        explain: 'setUser იმავე ობიექტს იღებს, React-ისთვის Object.is(old, new) true-ა და რენდერი არ ხდება. ეკრანზე ძველი „ნინო“ რჩება, თუმცა ობიექტი უკვე შეცვლილია.',
    },
    {
        code: "const ThemeContext = createContext('light');\n\nfunction Badge() {\n  return <p>{useContext(ThemeContext)}</p>;\n}\n// <Badge /> რენდერდება Provider-ის გარეშე",
        label: SCREEN, icon: 'monitor',
        options: ['undefined', 'light', 'შეცდომა', 'ცარიელი'],
        answer: 1,
        explain: 'როცა ზემოთ Provider არ არის, useContext createContext-ის default მნიშვნელობას აბრუნებს.',
    },
    {
        code: '<Counter key={userId} />\n// Counter-ში count = 5.\n// userId იცვლება 1-დან 2-ზე. Counter-ში:',
        label: SCREEN, icon: 'monitor',
        options: ['5', '0', '6', 'შეცდომა'],
        answer: 1,
        explain: 'ახალი key React-ისთვის ახალი კომპონენტია: ძველი იშლება, ახალი საწყისი state-ით (0) იქმნება. ეს state-ის განზრახ განულების ხერხია.',
    },
    {
        code: "// ორივე კომპონენტი ერთდროულად ჩნდება:\nuseQuery({ queryKey: ['leaves'], queryFn: getLeaves }); // LeafCount\nuseQuery({ queryKey: ['leaves'], queryFn: getLeaves }); // LeafList",
        label: 'რამდენი მოთხოვნა წავა სერვერზე?',
        icon: 'globe',
        options: ['1', '2', '0', '4'],
        answer: 0,
        explain: 'ერთი და იგივე key ერთ ჩანაწერს ნიშნავს ქეშში. მეორე კომპონენტი უკვე მიმდინარე მოთხოვნას უერთდება.',
    },
];

/** Small fake console used by the puzzle demos. */
function consoleBox(lines) {
    const box = document.createElement('pre');
    box.className = 'demo-console';
    box.textContent = lines.join('\n');
    return box;
}
