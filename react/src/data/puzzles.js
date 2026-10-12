'use strict';

/* =========================================================
   PUZZLES — put the steps in order; the result runs live (real React).

   Each step has a rank. Steps that may swap places share a rank,
   so any order where ranks never go down is accepted.
   explain: the short note on the back of the rolling line.
   Every puzzle is one function body, so the order is never a matter of taste.
   ========================================================= */

const PUZZLES = [
    {
        title: 'მთვლელი',
        goal: 'ღილაკი ითვლის, რამდენჯერ დააჭირეს.',
        topics: ['components', 'state'],
        steps: [
            { rank: 1, code: 'function Counter() {', explain: 'კომპონენტი: ფუნქცია, რომელიც JSX-ს დააბრუნებს.' },
            { rank: 2, code: '  const [count, setCount] = useState(0);', explain: 'state: მთვლელის მეხსიერება, საწყისი მნიშვნელობა 0.' },
            { rank: 3, code: '  function increment() {', explain: 'ივენთის დამმუშავებელი: რა მოხდეს დაჭერისას.' },
            { rank: 4, code: '    setCount(c => c + 1);', explain: 'ზრდის state-ს. React კომპონენტს თავიდან დახატავს.' },
            { rank: 5, code: '  }', explain: 'ხურავს increment-ს.' },
            { rank: 6, code: '  return <button onClick={increment}>{count}</button>;', explain: 'ღილაკი: აჩვენებს count-ს და დაჭერისას increment-ს იძახებს.' },
            { rank: 7, code: '}', explain: 'ხურავს კომპონენტს.' },
        ],
        run(preview) {
            mountReact(preview, h(PuzzleCounter));
        },
    },
    {
        title: 'ფილტრიანი სია',
        goal: 'ფოთლების სია, რომელსაც ფერით ფილტრავს ღილაკი.',
        topics: ['state', 'lists'],
        steps: [
            { rank: 1, code: 'function LeafList({ leaves }) {', explain: 'კომპონენტი, რომელიც ფოთლების მასივს props-ით იღებს.' },
            { rank: 2, code: "  const [filter, setFilter] = useState('all');", explain: 'state: რომელი ფერია არჩეული. თავიდან ყველა.' },
            { rank: 3, code: "  const visible = leaves.filter(l => filter === 'all' || l.color === filter);", explain: 'derived: ხილული ფოთლები ყოველ რენდერზე ითვლება, state-ში არ ინახება.' },
            { rank: 4, code: '  return (', explain: 'იწყება JSX-ის დაბრუნება.' },
            { rank: 5, code: '    <>', explain: 'Fragment: ორი ელემენტი ერთ მშობელში, ზედმეტი div-ის გარეშე.' },
            { rank: 6, code: "      <button onClick={() => setFilter('yellow')}>ყვითლები</button>", explain: 'ღილაკი filter-ს ცვლის, რაც ახალ რენდერს და ახალ visible-ს იწვევს.' },
            { rank: 6, code: '      <ul>{visible.map(l => <li key={l.id}>{l.name}</li>)}</ul>', explain: 'სია: ყოველი ფოთოლი li-ად, სტაბილური key-ით.' },
            { rank: 7, code: '    </>', explain: 'ხურავს Fragment-ს.' },
            { rank: 8, code: '  );', explain: 'ხურავს return-ს.' },
            { rank: 9, code: '}', explain: 'ხურავს კომპონენტს.' },
        ],
        run(preview) {
            mountReact(preview, h(PuzzleFilter));
        },
    },
    {
        title: 'მომხმარებლები API-დან',
        goal: 'კომპონენტი გამოჩენისას ერთხელ წამოიღებს მომხმარებლებს და მათ სახელებს აჩვენებს.',
        topics: ['state', 'effects', 'lists'],
        steps: [
            { rank: 1, code: 'function Users() {', explain: 'კომპონენტი.' },
            { rank: 2, code: '  const [users, setUsers] = useState([]);', explain: 'state: ჯერ ცარიელი სია, მერე სერვერის პასუხი.' },
            { rank: 3, code: '  useEffect(() => {', explain: 'effect: გარე სამყაროსთან (API) კავშირი, რენდერის შემდეგ.' },
            { rank: 4, code: "    fetch('https://jsonplaceholder.typicode.com/users')", explain: 'მოთხოვნა სერვერზე.' },
            { rank: 5, code: '      .then(res => res.json())', explain: 'პასუხი JSON-იდან JS მასივად.' },
            { rank: 6, code: '      .then(data => setUsers(data));', explain: 'მონაცემი state-ში: React სიას დახატავს.' },
            { rank: 7, code: '  }, []);', explain: 'ცარიელი dependency: effect მხოლოდ ერთხელ, გამოჩენისას.' },
            { rank: 8, code: '  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;', explain: 'სია: ყოველი მომხმარებელი li-ად.' },
            { rank: 9, code: '}', explain: 'ხურავს კომპონენტს.' },
        ],
        run(preview) {
            mountReact(preview, h(PuzzleUsers));
        },
    },
    {
        title: 'კალათა useReducer-ით',
        goal: 'ღილაკი კალათაში ვაშლს ამატებს და აჩვენებს რაოდენობას და ჯამს. reducer უკვე დაწერილია.',
        topics: ['context', 'state'],
        steps: [
            { rank: 1, code: 'function Cart() {', explain: 'კომპონენტი.' },
            { rank: 2, code: '  const [items, dispatch] = useReducer(cartReducer, []);', explain: 'useReducer: state (items) და dispatch, რომლითაც action-ებს ვაგზავნით.' },
            { rank: 3, code: '  const total = items.reduce((sum, i) => sum + i.price, 0);', explain: 'ჯამი items-იდან ითვლება, ცალკე state არ სჭირდება.' },
            { rank: 4, code: '  return (', explain: 'იწყება JSX.' },
            { rank: 5, code: "    <button onClick={() => dispatch({ type: 'add', item: apple })}>", explain: 'დაჭერა action-ს აგზავნის, reducer კი ახალ მასივს დააბრუნებს.' },
            { rank: 6, code: '      კალათაში: {items.length} · {total} ₾', explain: 'ღილაკის ტექსტი: რაოდენობა და ჯამი.' },
            { rank: 7, code: '    </button>', explain: 'ხურავს ღილაკს.' },
            { rank: 8, code: '  );', explain: 'ხურავს return-ს.' },
            { rank: 9, code: '}', explain: 'ხურავს კომპონენტს.' },
        ],
        run(preview) {
            mountReact(preview, h(PuzzleCart));
        },
    },
    {
        title: 'Custom hook',
        goal: 'useWindowWidth ფანჯრის სიგანეს აბრუნებს და ზომის შეცვლისას ახლდება.',
        topics: ['effects', 'state'],
        steps: [
            { rank: 1, code: 'function useWindowWidth() {', explain: 'hook: სახელი use-ით იწყება, შიგნით სხვა hook-ებს იყენებს.' },
            { rank: 2, code: '  const [width, setWidth] = useState(window.innerWidth);', explain: 'state: მიმდინარე სიგანე.' },
            { rank: 3, code: '  useEffect(() => {', explain: 'effect: ბრაუზერის ივენთის მოსმენა გარე სისტემაა.' },
            { rank: 4, code: '    const onResize = () => setWidth(window.innerWidth);', explain: 'ფუნქცია, რომელიც ახალ სიგანეს state-ში წერს.' },
            { rank: 5, code: "    window.addEventListener('resize', onResize);", explain: 'ვიწყებთ მოსმენას.' },
            { rank: 6, code: "    return () => window.removeEventListener('resize', onResize);", explain: 'cleanup: კომპონენტის გაქრობისას მოსმენას ვაჩერებთ.' },
            { rank: 7, code: '  }, []);', explain: 'listener ერთხელ ერთვება.' },
            { rank: 8, code: '  return width;', explain: 'hook აბრუნებს მნიშვნელობას, რომელსაც ნებისმიერი კომპონენტი გამოიყენებს.' },
            { rank: 9, code: '}', explain: 'ხურავს hook-ს.' },
        ],
        run(preview) {
            mountReact(preview, h(PuzzleWidth));
        },
    },
    {
        title: 'ფორმა ვალიდაციით',
        goal: 'ფორმა სახელს ამოწმებს და შეცდომას ველის ქვეშ აჩვენებს. schema და save უკვე არსებობს.',
        topics: ['forms'],
        steps: [
            { rank: 1, code: 'function NameForm() {', explain: 'კომპონენტი.' },
            { rank: 2, code: '  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });', explain: 'React Hook Form, Zod-ის სქემით.' },
            { rank: 3, code: '  return (', explain: 'იწყება JSX.' },
            { rank: 4, code: '    <form onSubmit={handleSubmit(save)}>', explain: 'handleSubmit ჯერ ამოწმებს, save მხოლოდ ვალიდურ მონაცემს იღებს.' },
            { rank: 5, code: "      <input {...register('name')} />", explain: 'ველი, რომელიც ფორმას register-ით უკავშირდება.' },
            { rank: 6, code: '      {errors.name && <p>{errors.name.message}</p>}', explain: 'შეცდომა ველის ქვეშ, მხოლოდ თუ არსებობს.' },
            { rank: 7, code: '      <button>შენახვა</button>', explain: 'submit ღილაკი.' },
            { rank: 8, code: '    </form>', explain: 'ხურავს ფორმას.' },
            { rank: 9, code: '  );', explain: 'ხურავს return-ს.' },
            { rank: 10, code: '}', explain: 'ხურავს კომპონენტს.' },
        ],
        run(preview) {
            mountReact(preview, h(PuzzleForm));
        },
    },
    {
        title: 'ფოთლის გვერდი',
        goal: '/leaves/:id გვერდი ფოთოლს id-ით ტვირთავს, სანამ იტვირთება, ტექსტს აჩვენებს.',
        topics: ['router', 'query'],
        steps: [
            { rank: 1, code: 'function LeafPage() {', explain: 'გვერდის კომპონენტი.' },
            { rank: 2, code: '  const { id } = useParams();', explain: 'id URL-იდან: /leaves/2 → \'2\'.' },
            { rank: 3, code: "  const { data, isPending } = useQuery({ queryKey: ['leaf', id], queryFn: () => getLeaf(id) });", explain: 'მოთხოვნა, რომლის key-ში id წერია: ყოველ ფოთოლს თავისი ქეში აქვს.' },
            { rank: 4, code: '  if (isPending) return <p>იტვირთება...</p>;', explain: 'სანამ მონაცემი არ მოსულა, ადრეული return.' },
            { rank: 5, code: '  return <h1>{data.name}</h1>;', explain: 'მონაცემი მოვიდა: ვხატავთ.' },
            { rank: 6, code: '}', explain: 'ხურავს კომპონენტს.' },
        ],
        run(preview) {
            mountReact(preview, h(PuzzleLeafPage));
        },
    },
];
