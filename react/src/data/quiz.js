'use strict';

/* Quiz: which topic does this snippet belong to?
   explain may contain HTML (write < as &lt;). */

const QUIZ = [
    { code: 'function Leaf({ color }: { color: string }) {\n  return <span>{color}</span>;\n}', answer: 'components', explain: 'ფუნქცია, რომელიც JSX-ს აბრუნებს და props-ს იღებს: ეს კომპონენტია.' },
    { code: '<Leaf color="yellow" size={32} />', answer: 'components', explain: 'კომპონენტს props-ს ატრიბუტებივით ვაწვდით.' },
    { code: '<Card title="მუხა">\n  <p>12 წლის</p>\n</Card>', answer: 'components', explain: 'ტეგებს შორის მოთავსებული &lt;p&gt; Card-ს children-ად გადაეცემა: კომპოზიცია.' },
    { code: '<>\n  <Header />\n  <Main />\n</>', answer: 'components', explain: 'Fragment: რამდენიმე ელემენტი ერთ მშობელში, ზედმეტი div-ის გარეშე.' },

    { code: 'const [count, setCount] = useState(0);', answer: 'state', explain: 'useState კომპონენტს მეხსიერებას აძლევს.' },
    { code: '<button onClick={() => setOpen(!open)}>მენიუ</button>', answer: 'state', explain: 'ივენთი state-ს ცვლის, React კი ეკრანს თავიდან ხატავს.' },
    { code: "setTree({ ...tree, age: 13 });", answer: 'state', explain: 'ობიექტის state-ს იმუტაბელურად ვაახლებთ: ახალი ობიექტი spread-ით.' },
    { code: '<input value={name} onChange={e => setName(e.target.value)} />', answer: 'state', explain: 'Controlled input: ველის მნიშვნელობა state-შია.' },

    { code: '{leaves.map(l => <li key={l.id}>{l.color}</li>)}', answer: 'lists', explain: 'მასივი map-ით JSX-ად იქცევა, ყოველ ელემენტს key აქვს.' },
    { code: '{isLoggedIn ? <Profile /> : <Login />}', answer: 'lists', explain: 'პირობითი რენდერი: ternary ორი ვარიანტიდან ერთს ირჩევს.' },
    { code: '{error && <p className="error">{error}</p>}', answer: 'lists', explain: '&amp;&amp;: აჩვენე მხოლოდ მაშინ, როცა error არსებობს.' },
    { code: "if (items.length === 0) return <p>ცარიელია</p>;", answer: 'lists', explain: 'ადრეული return: ცარიელი სიისთვის ცალკე შეტყობინება.' },

    { code: 'useEffect(() => {\n  document.title = title;\n}, [title]);', answer: 'effects', explain: 'effect გარე სისტემას (დოკუმენტის სათაურს) state-თან ასინქრონებს.' },
    { code: 'return () => clearInterval(id);', answer: 'effects', explain: 'cleanup ფუნქცია effect-ის წინა გაშვებას ასუფთავებს.' },
    { code: 'const inputRef = useRef<HTMLInputElement>(null);\ninputRef.current?.focus();', answer: 'effects', explain: 'useRef DOM ელემენტზე წვდომას გაძლევს რენდერის გარეშე.' },
    { code: 'function useDebounce<T>(value: T, ms: number) {\n  // ...\n}', answer: 'effects', explain: 'use-ით დაწყებული ფუნქცია custom hook-ია: ლოგიკა, რომელსაც სხვა კომპონენტებიც გამოიყენებენ.' },

    { code: "const ThemeContext = createContext('light');", answer: 'context', explain: 'createContext ქმნის „არხს“, რომლითაც მნიშვნელობა ხის სიღრმეში მიდის.' },
    { code: 'const theme = useContext(ThemeContext);', answer: 'context', explain: 'useContext კითხულობს უახლოესი Provider-ის მნიშვნელობას.' },
    { code: "dispatch({ type: 'add', item });", answer: 'context', explain: 'useReducer-ის dispatch action-ს reducer-ს აწვდის.' },
    { code: 'const [cart, dispatch] = useReducer(cartReducer, []);', answer: 'context', explain: 'useReducer: რთული state-ის ლოგიკა ერთ reducer ფუნქციაში.' },

    { code: '<Route path="/leaves/:id" element={<LeafPage />} />', answer: 'router', explain: 'მარშრუტი დინამიური :id პარამეტრით.' },
    { code: '<Link to="/about">ჩვენ შესახებ</Link>', answer: 'router', explain: 'Link გვერდს ცვლის გადატვირთვის გარეშე.' },
    { code: "const navigate = useNavigate();\nnavigate('/thanks');", answer: 'router', explain: 'useNavigate: გადასვლა კოდიდან, მაგალითად ფორმის გაგზავნის შემდეგ.' },
    { code: "const [params, setParams] = useSearchParams();\nconst page = params.get('page');", answer: 'router', explain: 'search params ფილტრებს და გვერდს URL-ში ინახავს.' },

    { code: "<input {...register('email')} />", answer: 'forms', explain: 'register ველს React Hook Form-ს აკავშირებს.' },
    { code: "const schema = z.object({\n  email: z.string().email(),\n});", answer: 'forms', explain: 'Zod-ის სქემა: ვალიდაციის წესები და ტიპი ერთად.' },
    { code: 'const { errors, isSubmitting } = formState;', answer: 'forms', explain: 'formState ფორმის მდგომარეობას გაძლევს: შეცდომებს და გაგზავნის პროცესს.' },
    { code: "useForm({ resolver: zodResolver(schema) })", answer: 'forms', explain: 'zodResolver Zod-ის სქემას React Hook Form-ს უერთებს.' },

    { code: "useQuery({ queryKey: ['leaves'], queryFn: getLeaves })", answer: 'query', explain: 'useQuery სერვერის მონაცემს key-ით ქეშავს.' },
    { code: "queryClient.invalidateQueries({ queryKey: ['leaves'] });", answer: 'query', explain: 'invalidate ქეშს მოძველებულად ნიშნავს და ხელახლა ტვირთავს.' },
    { code: 'const addLeaf = useMutation({ mutationFn: postLeaf });', answer: 'query', explain: 'useMutation სერვერზე მონაცემს ცვლის (POST/PUT/DELETE).' },
    { code: 'if (isPending) return <Spinner />;', answer: 'query', explain: 'isPending: TanStack Query-ის მდგომარეობა, როცა მონაცემი ჯერ არ მოსულა.' },
];

const QUIZ_LENGTH = 12;
