'use strict';

/* Quiz: which topic does this snippet belong to?
   explain may contain HTML (write < as &lt;). */

const QUIZ = [
    { code: "export const metadata = {\n  title: 'მცენარეები',\n};", answer: 'rendering', explain: 'metadata გვერდის title-ს და description-ს აყალიბებს: ეს SEO-ა.' },
    { code: 'export async function generateMetadata({ params }) {\n  // ...\n}', answer: 'rendering', explain: 'generateMetadata: დინამიური title და description, SEO-სთვის.' },
    { code: '$ next build\n├ ○ /about\n└ ƒ /cart', answer: 'rendering', explain: 'build-ის შედეგი გვიჩვენებს, რომელი გვერდია სტატიკური (○) და რომელი დინამიური (ƒ).' },
    { code: "// app/sitemap.ts\nexport default function sitemap() {\n  return [{ url: 'https://leaves.ge/plants' }];\n}", answer: 'rendering', explain: 'sitemap.ts Google-ს საიტის რუკას აძლევს: SEO.' },

    { code: 'app/plants/[slug]/page.tsx', answer: 'routing', explain: 'ფოლდერი [slug] დინამიური სეგმენტია: /plants/monstera.' },
    { code: 'const { slug } = await params;', answer: 'routing', explain: 'params დინამიური სეგმენტის მნიშვნელობაა. Next.js 16-ში ის Promise-ია.' },
    { code: 'export default function Layout({ children }) {\n  return <main>{children}</main>;\n}', answer: 'routing', explain: 'layout.tsx გვერდებს გარს ერტყმის და ნავიგაციისას ადგილზე რჩება.' },
    { code: 'if (!plant) notFound();', answer: 'routing', explain: 'notFound() not-found.tsx-ს აჩვენებს: 404.' },

    { code: "'use client';", answer: 'server', explain: 'საზღვარი: ეს ფაილი და მისი import-ები ბრაუზერშიც სრულდება.' },
    { code: "import 'server-only';", answer: 'server', explain: 'ფაილი, რომელიც შემთხვევით Client Component-ში არ უნდა მოხვდეს.' },
    { code: 'export default async function Page() {\n  const plants = await db.select().from(plantsTable);\n}', answer: 'server', explain: 'async კომპონენტი, რომელიც ბაზას პირდაპირ კითხულობს: Server Component.' },
    { code: '<Tabs>\n  <PlantReviews plantId={1} />\n</Tabs>', answer: 'server', explain: 'Server Component Client კომპონენტს children-ად გადაეცემა: საზღვრის ხერხი.' },

    { code: 'const [plant, stock] = await Promise.all([getPlant(slug), getStock(slug)]);', answer: 'data', explain: 'დამოუკიდებელი მოთხოვნები პარალელურად: waterfall-ის თავიდან აცილება.' },
    { code: '<Suspense fallback={<p>იტვირთება...</p>}>\n  <Reviews />\n</Suspense>', answer: 'data', explain: 'Suspense ნელ ნაწილს ცალკე უშვებს: streaming.' },
    { code: '// app/plants/loading.tsx\nexport default function Loading() {\n  return <Skeleton />;\n}', answer: 'data', explain: 'loading.tsx მთელი გვერდის Suspense-ია.' },
    { code: "'use client';\nexport default function Error({ reset }) {\n  return <button onClick={reset}>თავიდან</button>;\n}", answer: 'data', explain: 'error.tsx: შეცდომის საზღვარი, როცა მონაცემი ვერ ჩაიტვირთა.' },

    { code: "'use cache';\ncacheLife('hours');", answer: 'cache', explain: '"use cache" შედეგს ინახავს, cacheLife კი ვადას აწესებს.' },
    { code: "cacheTag('plants');", answer: 'cache', explain: 'ჭდე, რომლითაც ქეშს მერე წავშლით.' },
    { code: "revalidateTag('plants', 'max');", answer: 'cache', explain: 'ფონზე განახლება. Next.js 16-ში მეორე არგუმენტი სავალდებულოა.' },
    { code: 'const nextConfig = { cacheComponents: true };', answer: 'cache', explain: 'Cache Components-ის ჩართვა next.config-ში.' },

    { code: "'use server';\nexport async function createPlant(formData: FormData) {}", answer: 'actions', explain: '"use server": ფუნქცია სერვერზე სრულდება, ფორმიდან კი იძახებ.' },
    { code: 'const [state, formAction, pending] = useActionState(createPlant, {});', answer: 'actions', explain: 'useActionState Server Action-ის პასუხს და pending-ს გაძლევს.' },
    { code: '<form action={createPlant}>', answer: 'actions', explain: 'ფორმის action Server Action-ია: endpoint-ის გარეშე.' },
    { code: "const { pending } = useFormStatus();", answer: 'actions', explain: 'useFormStatus ფორმის შიგნით მყოფ ღილაკს გაგზავნის მდგომარეობას აჩვენებს.' },

    { code: 'export async function GET(request: Request) {\n  return Response.json(plants);\n}', answer: 'api', explain: 'route.ts-ის GET: REST API endpoint.' },
    { code: "return Response.json({ error: 'ვერ მოიძებნა' }, { status: 404 });", answer: 'api', explain: 'Route Handler JSON-ს და სწორ სტატუსს აბრუნებს.' },
    { code: 'app/api/plants/[id]/route.ts', answer: 'api', explain: 'route.ts ფაილი API endpoint-ია, არა გვერდი.' },
    { code: "const { searchParams } = new URL(request.url);\nconst page = searchParams.get('page');", answer: 'api', explain: 'query პარამეტრები Route Handler-ში: pagination, ფილტრი.' },

    { code: "export const plants = pgTable('plants', {\n  id: serial('id').primaryKey(),\n});", answer: 'db', explain: 'Drizzle-ის სქემა: ცხრილის აღწერა TypeScript-ით.' },
    { code: "await db.select().from(plants).where(eq(plants.slug, 'ficus'));", answer: 'db', explain: 'Drizzle-ის მოთხოვნა = SELECT ... WHERE.' },
    { code: 'await db.transaction(async (tx) => {\n  // ...\n});', answer: 'db', explain: 'ტრანზაქცია: ან ყველაფერი შესრულდება, ან არაფერი.' },
    { code: '$ npx drizzle-kit migrate', answer: 'db', explain: 'მიგრაცია სქემის ცვლილებებს ბაზაში ასახავს.' },

    { code: "export const config = { matcher: ['/admin/:path*'] };", answer: 'auth', explain: 'proxy.ts-ის matcher: რომელ მისამართებზე ეშვება შემოწმება.' },
    { code: "if (session.user.role !== 'admin') throw new Error('Forbidden');", answer: 'auth', explain: 'როლის შემოწმება: ავტორიზაცია.' },
    { code: 'const session = await auth.api.getSession({ headers: await headers() });', answer: 'auth', explain: 'Better Auth: სესიის წაკითხვა სერვერზე.' },
    { code: "return NextResponse.redirect(new URL('/login', request.url));", answer: 'auth', explain: 'proxy.ts შეუსვლელ მომხმარებელს login-ზე გადაამისამართებს.' },
];

const QUIZ_LENGTH = 12;
