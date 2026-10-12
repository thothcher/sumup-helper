'use strict';

/* =========================================================
   PUZZLES — put the steps in order; then see what the server does.

   Each step has a rank. Steps that may swap places share a rank,
   so any order where ranks never go down is accepted.
   explain: the short note on the back of the rolling line.
   ========================================================= */

const PUZZLES = [
    {
        title: 'მცენარეების გვერდი',
        goal: 'Server Component მცენარეებს სერვერზე იღებს და სიად აჩვენებს.',
        topics: ['rendering', 'data'],
        steps: [
            { rank: 1, code: 'export default async function PlantsPage() {', explain: 'async Server Component: შიგნით await შეგვიძლია.' },
            { rank: 2, code: '  const plants = await getPlants();', explain: 'მონაცემი სერვერზე, useEffect-ის გარეშე.' },
            { rank: 3, code: '  return (', explain: 'იწყება JSX.' },
            { rank: 4, code: '    <ul>', explain: 'სია.' },
            { rank: 5, code: '      {plants.map(p => <li key={p.id}>{p.name}</li>)}', explain: 'ყოველი მცენარე li-ად.' },
            { rank: 6, code: '    </ul>', explain: 'ხურავს სიას.' },
            { rank: 7, code: '  );', explain: 'ხურავს return-ს.' },
            { rank: 8, code: '}', explain: 'ხურავს კომპონენტს.' },
        ],
        run(preview) {
            preview.append(
                make('div', { class: 'mock' }, make('h4', {}, 'მცენარეები'), make('ul', { class: 'demo-list' }, SHOP.map(p => make('li', {}, p.name)))),
                consoleBox(['view-source: HTML-ში სია უკვე წერია', '<ul><li>მონსტერა</li><li>ფიკუსი</li><li>ალოე</li></ul>', 'ბრაუზერში ამ კომპონენტის JS: 0 kB']));
        },
    },
    {
        title: 'დინამიური გვერდი',
        goal: '/plants/[slug] მცენარეს slug-ით პოულობს, ან 404-ს აჩვენებს.',
        topics: ['routing'],
        steps: [
            { rank: 1, code: 'export default async function PlantPage({ params }: Props) {', explain: 'გვერდი იღებს params-ს.' },
            { rank: 2, code: '  const { slug } = await params;', explain: 'Next.js 16-ში params Promise-ია: ჯერ await.' },
            { rank: 3, code: '  const plant = await getPlant(slug);', explain: 'მცენარე ბაზიდან slug-ით.' },
            { rank: 4, code: '  if (!plant) notFound();', explain: 'თუ არ არსებობს: not-found.tsx, 404.' },
            { rank: 5, code: '  return <h1>{plant.name}</h1>;', explain: 'არსებობს: ვაჩვენებთ.' },
            { rank: 6, code: '}', explain: 'ხურავს კომპონენტს.' },
        ],
        run(preview) {
            const result = make('div', {});
            const open = (slug) => {
                const plant = SHOP.find(p => p.slug === slug);
                result.replaceChildren(plant
                    ? make('div', { class: 'mock' }, make('small', {}, `/plants/${slug}`), make('h4', {}, plant.name))
                    : make('div', { class: 'mock' }, make('small', {}, `/plants/${slug}`), make('h4', {}, '404: მცენარე ვერ მოიძებნა')));
            };
            preview.append(
                make('div', { class: 'demo-btns' }, ['monstera', 'aloe', 'cactus'].map(s => demoButton(`/plants/${s}`, () => open(s)))),
                result);
            open('monstera');
        },
    },
    {
        title: 'Server Action',
        goal: 'action ამოწმებს სესიას და მონაცემს, ინახავს და ქეშს აახლებს.',
        topics: ['actions', 'cache'],
        steps: [
            { rank: 1, code: 'export async function addPlant(prev: State, formData: FormData) {', explain: 'action იღებს წინა state-ს და ფორმის მონაცემს.' },
            { rank: 2, code: "  'use server';", explain: 'ფუნქცია სერვერზე სრულდება. დირექტივა პირველ ხაზზეა.' },
            { rank: 3, code: '  const session = await getSession();', explain: 'ვინ იძახებს? action საჯაროა, ამიტომ ჯერ ეს.' },
            { rank: 4, code: "  if (!session) return { message: 'ჯერ შედი' };", explain: 'სესიის გარეშე: შეწყვეტა.' },
            { rank: 5, code: '  const parsed = PlantSchema.safeParse(Object.fromEntries(formData));', explain: 'Zod სერვერზე: მონაცემის შემოწმება.' },
            { rank: 6, code: '  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };', explain: 'შეცდომები ველების მიხედვით, ფორმა მათ გვერდით აჩვენებს.' },
            { rank: 7, code: '  await db.insert(plants).values(parsed.data);', explain: 'მხოლოდ ახლა: ჩაწერა ბაზაში.' },
            { rank: 8, code: "  updateTag('plants');", explain: 'ქეში წაიშალა: სია ახალ მცენარეს მაშინვე აჩვენებს.' },
            { rank: 9, code: "  return { message: 'დამატებულია' };", explain: 'state, რომელსაც useActionState მიიღებს.' },
            { rank: 10, code: '}', explain: 'ხურავს action-ს.' },
        ],
        run(preview) {
            preview.append(consoleBox([
                "addPlant({ name: 'ლავანდა', price: '18' })",
                '  1. getSession() → ნინო',
                '  2. safeParse → ვალიდურია',
                "  3. INSERT INTO plants VALUES ('ლავანდა', 18)",
                "  4. updateTag('plants')",
                "  ← { message: 'დამატებულია' }",
                '',
                "addPlant({ name: '', price: '-5' })",
                '  1. getSession() → ნინო',
                "  2. safeParse → შეცდომა",
                "  ← { errors: { name: ['მინიმუმ 2 სიმბოლო'], price: ['ფასი დადებითი უნდა იყოს'] } }",
            ]));
        },
    },
    {
        title: 'Route Handler',
        goal: 'GET /api/plants?page=2 მცენარეების მეორე გვერდს აბრუნებს.',
        topics: ['api'],
        steps: [
            { rank: 1, code: 'export async function GET(request: Request) {', explain: 'ფუნქციის სახელი = HTTP მეთოდი.' },
            { rank: 2, code: '  const { searchParams } = new URL(request.url);', explain: 'query პარამეტრები URL-იდან.' },
            { rank: 3, code: "  const page = Number(searchParams.get('page') ?? 1);", explain: 'გვერდის ნომერი: სტრიქონი რიცხვად, ნაგულისხმევად 1.' },
            { rank: 4, code: '  const items = await listPlants({ page, limit: 10 });', explain: 'pagination ბაზის დონეზე.' },
            { rank: 5, code: '  return Response.json({ page, items });', explain: 'JSON პასუხი, სტატუსი 200.' },
            { rank: 6, code: '}', explain: 'ხურავს ფუნქციას.' },
        ],
        run(preview) {
            preview.append(consoleBox([
                '→ GET /api/plants?page=2',
                '← 200 OK',
                JSON.stringify({ page: 2, items: [{ id: 11, name: 'ლავანდა' }, { id: 12, name: 'კაქტუსი' }] }, null, 2),
            ]));
        },
    },
    {
        title: 'ქეშირებული ფუნქცია',
        goal: 'getPlants-ის შედეგი საათობით ინახება და plants ჭდით იშლება.',
        topics: ['cache', 'db'],
        steps: [
            { rank: 1, code: 'export async function getPlants() {', explain: 'ჩვეულებრივი async ფუნქცია.' },
            { rank: 2, code: "  'use cache';", explain: 'დირექტივა პირველ ხაზზე: შედეგი ქეშში ინახება.' },
            { rank: 3, code: "  cacheLife('hours');", explain: 'ვადა: საათები.' },
            { rank: 3, code: "  cacheTag('plants');", explain: "ჭდე: updateTag('plants') ამ ქეშს წაშლის." },
            { rank: 4, code: '  return db.select().from(plants);', explain: 'ბაზაში მხოლოდ მაშინ მიდის, როცა ქეში ცარიელია.' },
            { rank: 5, code: '}', explain: 'ხურავს ფუნქციას.' },
        ],
        run(preview) {
            preview.append(consoleBox([
                'getPlants() → MISS: ბაზა, 600 ms',
                'getPlants() → HIT: 2 ms',
                'getPlants() → HIT: 2 ms',
                "updateTag('plants') → ქეში წაიშალა",
                'getPlants() → MISS: ბაზა, 600 ms',
            ]));
        },
    },
    {
        title: 'ტრანზაქცია',
        goal: 'ყიდვა: მარაგის შემოწმება, შემცირება და შეკვეთის ჩაწერა ერთად, ან არაფერი.',
        topics: ['db'],
        steps: [
            { rank: 1, code: 'await db.transaction(async (tx) => {', explain: 'BEGIN: ყველაფერი შიგნით ერთი ერთეულია.' },
            { rank: 2, code: '  const [plant] = await tx.select().from(plants).where(eq(plants.id, id));', explain: 'მარაგის წაკითხვა.' },
            { rank: 3, code: "  if (plant.stock < qty) throw new Error('მარაგი არ კმარა');", explain: 'შეცდომა → ROLLBACK, არაფერი შეიცვლება.' },
            { rank: 4, code: '  await tx.update(plants).set({ stock: plant.stock - qty }).where(eq(plants.id, id));', explain: 'მარაგის შემცირება.' },
            { rank: 4, code: '  await tx.insert(orders).values({ plantId: id, qty });', explain: 'შეკვეთის ჩაწერა.' },
            { rank: 5, code: '});', explain: 'COMMIT: ორივე ცვლილება ერთად ინახება.' },
        ],
        run(preview) {
            preview.append(consoleBox([
                'მონსტერა, მარაგი: 3',
                '',
                'buy(2): BEGIN → SELECT 3 → UPDATE 3-2 → INSERT → COMMIT',
                'მარაგი: 1, შეკვეთები: +1',
                '',
                "buy(4): BEGIN → SELECT 1 → throw 'მარაგი არ კმარა' → ROLLBACK",
                'მარაგი: 1, შეკვეთები: უცვლელი',
            ]));
        },
    },
    {
        title: 'proxy.ts',
        goal: 'შეუსვლელი მომხმარებელი /account-ზე login-ზე უნდა გადამისამართდეს.',
        topics: ['auth'],
        steps: [
            { rank: 1, code: 'export function proxy(request: NextRequest) {', explain: 'proxy.ts (ძველად middleware) ყოველ შესაბამის მოთხოვნაზე ეშვება.' },
            { rank: 2, code: '  const hasSession = getSessionCookie(request);', explain: 'არის თუ არა სესიის cookie. მხოლოდ არსებობა, არა ნამდვილობა.' },
            { rank: 3, code: '  if (!hasSession) {', explain: 'cookie არ არის?' },
            { rank: 4, code: "    return NextResponse.redirect(new URL('/login', request.url));", explain: '307 → /login.' },
            { rank: 5, code: '  }', explain: 'ხურავს if-ს.' },
            { rank: 6, code: '  return NextResponse.next();', explain: 'cookie არის: მოთხოვნა გვერდამდე გადის.' },
            { rank: 7, code: '}', explain: 'ხურავს ფუნქციას.' },
        ],
        run(preview) {
            preview.append(consoleBox([
                'სტუმარი → GET /account   ← 307, Location: /login',
                'ნინო   → GET /account   ← NextResponse.next() → 200',
                '',
                'გახსოვდეს: როლს და მონაცემზე წვდომას proxy არ ამოწმებს, ეს DAL-ის საქმეა.',
            ]));
        },
    },
];
