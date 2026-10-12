'use strict';

/* =========================================================
   1. DATA — the 9 Next.js topics, chained in learning order.
      One running example flows through all of them: the React leaf garden
      grows into "ფოთლების სანერგე", an online plant shop.
      HTML is allowed in summary, more.title, more.points and more.tip
      (write < as &lt; there). The other text fields are escaped.
   ========================================================= */

const TOPICS = [
    {
        id: 'rendering',
        title: 'რენდერინგი და SEO',
        en: 'CSR · SSR · SSG · ISR',
        label: 'რენდერი',
        short: 'Rendering',
        icon: 'monitor',
        summary: 'მთავარი კითხვა: სად და როდის იქმნება HTML? ბრაუზერში (CSR), სერვერზე ყოველ მოთხოვნაზე (SSR), ერთხელ build-ისას (SSG), თუ build-ისას და მერე დროდადრო თავიდან (ISR). Next.js თითოეულ გვერდს თავის გზას ურჩევს.',
        analogy: 'საცხობი. SSG: პური დილით გამოცხვა და მზადაა, მაშინვე იღებ. ISR: იგივე, ოღონდ ყოველ საათში ახალ პარტიას აცხობენ. SSR: ცომს შენი შეკვეთისას ზელენ: ახალია, მაგრამ ელოდები. CSR: ფქვილს და რეცეპტს გაძლევენ და სახლში თავად აცხობ.',
        keyPoints: [
            'SSR / SSG: Google მზა HTML-ს ხედავს',
            'CSR: პირველი HTML თითქმის ცარიელია',
            'next build: ○ სტატიკური, ƒ დინამიური',
        ],
        bridge: 'React-ის ბაღი ბრაუზერში იხატებოდა (CSR). ახლა ის ინტერნეტ-მაღაზიაა და მისი გვერდები Google-მა უნდა წაიკითხოს.',
        code: `// app/plants/page.tsx: Server Component, HTML სერვერზე იქმნება
export default async function PlantsPage() {
  const plants = await getPlants();
  return (
    <ul>
      {plants.map(p => <li key={p.id}>{p.name}: {p.price} ₾</li>)}
    </ul>
  );
}

export const metadata = {
  title: 'მცენარეები | ფოთლების სანერგე',
  description: 'ოთახის და ბაღის მცენარეები თბილისში',
};`,
        more: {
            title: 'ოთხი გზა, hydration და Google',
            points: [
                '<b>CSR</b>: ბრაუზერი იღებს ცარიელ <code>&lt;div id="root"&gt;</code>-ს და JS-ს, HTML მერე იხატება',
                '<b>SSR</b>: ყოველ მოთხოვნაზე სერვერი ახალ HTML-ს აწყობს: ახალი მონაცემი, მაგრამ ყოველ ჯერზე სამუშაო',
                '<b>SSG</b>: HTML იქმნება <code>next build</code>-ისას და CDN-იდან მყისიერად მოდის',
                '<b>ISR</b>: სტატიკური გვერდი, რომელიც ვადის გასვლის შემდეგ ფონზე ახლდება',
                'Hydration: სერვერის HTML-ს ბრაუზერში JS „აცოცხლებს“ და ღილაკები ამუშავდება',
                '<code>generateMetadata</code>: title და description დინამიური გვერდისთვის',
                '<code>sitemap.ts</code>, <code>robots.ts</code>, <code>opengraph-image.tsx</code>: SEO-ს ფაილებიც app-ში ცხოვრობს',
                'Google Search Console: sitemap-ის გაგზავნა და ინდექსაციის შემოწმება',
            ],
            code: `// app/plants/[slug]/page.tsx
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const plant = await getPlant(slug);
  return {
    title: plant.name,
    description: plant.summary,
    openGraph: { images: [plant.image] },
  };
}`,
            tip: 'view-source (Ctrl+U) გაჩვენებს, რა მოვიდა სერვერიდან. თუ იქ შენი ტექსტი არ წერია, Google-მაც შეიძლება ვერ დაინახოს.',
        },
        run(out) {
            demoRendering(out);
        },
    },
    {
        id: 'routing',
        title: 'App Router',
        en: 'app/ → URL',
        label: 'Router',
        short: 'Routing',
        icon: 'folder',
        summary: 'Next.js-ში მარშრუტი ფოლდერია: <code>app/plants/page.tsx</code> ხდება <code>/plants</code>. <code>layout.tsx</code> გვერდებს გარს ერტყმის და ნავიგაციისას არ იშლება, <code>[slug]</code> კი დინამიური სეგმენტია.',
        analogy: 'app ფოლდერი შენობის გეგმაა: ყოველი ფოლდერი ოთახია, page.tsx კი ოთახის კარი. layout.tsx დერეფანია, რომელიც ოთახებს აერთიანებს: ოთახიდან ოთახში გადასვლისას დერეფანი ადგილზე რჩება.',
        keyPoints: [
            'page.tsx ფოლდერს გვერდად აქცევს',
            '[slug]: დინამიური, params await-ით იკითხება',
            'loading, error, not-found: სპეციალური ფაილები',
        ],
        bridge: 'ერთი გვერდი როგორ რენდერდება, უკვე ვიცით. ახლა მთელი საიტის რუკა: ფაილები, რომლებიც URL-ებად იქცევა.',
        code: `app/
├─ layout.tsx            → ყველა გვერდის ჩარჩო: html, body, ნავიგაცია
├─ page.tsx              → /
├─ plants/
│  ├─ page.tsx           → /plants
│  └─ [slug]/
│     ├─ page.tsx        → /plants/monstera
│     └─ loading.tsx     → სანამ იტვირთება
├─ (shop)/cart/page.tsx  → /cart   (ფრჩხილები URL-ში არ ჩანს)
└─ not-found.tsx         → 404`,
        more: {
            title: 'layout, დინამიური სეგმენტები და ნავიგაცია',
            points: [
                '<code>layout.tsx</code> იღებს <code>children</code>-ს. root layout-ში აუცილებელია <code>&lt;html&gt;</code> და <code>&lt;body&gt;</code>',
                '<code>[slug]</code>: ერთი სეგმენტი. <code>[...slug]</code>: ყველა დანარჩენი (catch-all)',
                '<code>(shop)</code>: route group, ორგანიზებისთვის ან ცალკე layout-ისთვის. URL-ს არ ცვლის',
                '<code>const { slug } = await params</code>: Next.js 16-ში params Promise-ია',
                '<code>&lt;Link href="/plants"&gt;</code>: კლიენტური ნავიგაცია და prefetch',
                '<code>redirect(\'/login\')</code> და <code>notFound()</code>: სერვერზე, გვერდის შიგნით',
                '<code>loading.tsx</code> ავტომატური Suspense-ია, <code>error.tsx</code> კი Error Boundary',
                '<code>generateStaticParams</code>: რომელი [slug]-ები ააწყოს build-ისას',
            ],
            code: `// app/plants/[slug]/page.tsx
type Props = { params: Promise<{ slug: string }> };

export default async function PlantPage({ params }: Props) {
  const { slug } = await params;
  const plant = await getPlant(slug);
  if (!plant) notFound();

  return <h1>{plant.name}</h1>;
}

export async function generateStaticParams() {
  return [{ slug: 'monstera' }, { slug: 'ficus' }];
}`,
            tip: 'React Router-ის ყველა იდეა აქაც არის: ჩადგმული layout, დინამიური პარამეტრი, 404. განსხვავება ისაა, რომ კონფიგურაციის ნაცვლად ფოლდერებს ქმნი.',
        },
        run(out) {
            demoRouting(out);
        },
    },
    {
        id: 'server',
        title: 'Server და Client',
        en: 'Server & Client Components',
        label: 'Server',
        short: 'Server',
        icon: 'server',
        summary: 'App Router-ში ყველა კომპონენტი ნაგულისხმევად Server Component-ია: სრულდება სერვერზე, ბაზასთან პირდაპირ მუშაობს და მისი კოდი ბრაუზერში არ ჩადის. <code>"use client"</code> მხოლოდ იქ გჭირდება, სადაც ინტერაქციაა: state, ივენთები, effect-ები.',
        analogy: 'რესტორანი: სამზარეულო (სერვერი) კერძს ამზადებს, დარბაზში (ბრაუზერში) მხოლოდ მზა თეფში გამოდის. მიმტანი (Client Component) დარბაზშია: კითხვებს პასუხობს და შეკვეთას იღებს. მზარეულს დარბაზში არ გამოიყვან და მაცივარს (ბაზას) სტუმრებს არ აჩვენებ.',
        keyPoints: [
            'Server: async, ბაზა, საიდუმლო გასაღებები, 0 kB JS',
            'Client: useState, onClick, useEffect, window',
            '"use client" საზღვარია: მისი import-ებიც კლიენტზე გადადის',
        ],
        bridge: 'როუტინგი ფაილებს გვერდებად აქცევს. ახლა ვწყვეტთ, ამ გვერდების რომელი ნაწილი სად სრულდება.',
        code: `// app/plants/[slug]/page.tsx: Server Component
export default async function PlantPage({ params }: Props) {
  const { slug } = await params;
  const plant = await db.query.plants.findFirst({ where: eq(plants.slug, slug) });

  return (
    <article>
      <h1>{plant.name}</h1>
      <AddToCart plantId={plant.id} />
    </article>
  );
}

// components/AddToCart.tsx
'use client';
export function AddToCart({ plantId }: { plantId: number }) {
  const [qty, setQty] = useState(1);
  return <button onClick={() => setQty(qty + 1)}>კალათაში ({qty})</button>;
}`,
        more: {
            title: 'საზღვარი, props და hydration',
            points: [
                'Server-იდან Client-ს მხოლოდ serializable props გადაეცემა: სტრიქონი, რიცხვი, ობიექტი. ფუნქცია არა (Server Action-ის გარდა)',
                'Client კომპონენტი Server-ს ვერ დააიმპორტებს, მაგრამ <code>children</code>-ად მიიღებს',
                '<code>"use client"</code> რაც შეიძლება ღრმად: ღილაკზე, არა მთელ გვერდზე',
                '<code>import \'server-only\'</code>: ფაილი, რომელიც კლიენტში შემთხვევით არ უნდა მოხვდეს',
                'Server Component-ის <code>console.log</code> ტერმინალში ჩანს, არა ბრაუზერის კონსოლში',
                'Hydration error: სერვერის და ბრაუზერის HTML განსხვავდება. ხშირი მიზეზი: <code>Date.now()</code>, <code>Math.random()</code>, <code>localStorage</code> რენდერში',
                '<code>&lt;div&gt;</code> <code>&lt;p&gt;</code>-ის შიგნით: არავალიდური HTML-იც hydration error-ს იწვევს',
            ],
            code: `// components/Tabs.tsx
'use client';
export function Tabs({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button onClick={() => setOpen(!open)}>შეფასებები</button>
      {open && children}
    </section>
  );
}

// app/plants/[slug]/page.tsx: Server Component
<Tabs>
  <PlantReviews plantId={plant.id} />
</Tabs>`,
            tip: '<code>"use client"</code>-ს page.tsx-ში თუ დაწერ, მთელი გვერდი კლიენტური ხდება: async კომპონენტი და ბაზასთან პირდაპირი წვდომა ქრება, ბრაუზერში კი მეტი JS ჩადის. საზღვარი რაც შეიძლება ღრმად გაავლე.',
        },
        run(out) {
            demoServerClient(out);
        },
    },
    {
        id: 'data',
        title: 'მონაცემები და Streaming',
        en: 'async · Suspense',
        label: 'Data',
        short: 'Data',
        icon: 'download',
        summary: 'Server Component-ში მონაცემს პირდაპირ <code>await</code>-ით იღებ: useEffect და useState არ გჭირდება. დამოუკიდებელ მოთხოვნებს პარალელურად უშვებ, ნელ ნაწილს <code>&lt;Suspense&gt;</code>-ში სვამ, და გვერდი ნაწილ-ნაწილ ჩნდება (streaming).',
        analogy: 'რესტორანში ცხელი კერძი ჯერ მზად არ არის, მაგრამ პური და სალათი უკვე მაგიდაზეა: ეს streaming-ია. ხოლო თუ მიმტანი სალათისთვის მხოლოდ მაშინ წავა, როცა წვნიანს მოგიტანს, ეს waterfall-ია: ყველაფერი რიგრიგობით, ზედმეტად დიდხანს.',
        keyPoints: [
            'await პირდაპირ კომპონენტში',
            'Promise.all: დამოუკიდებელი მოთხოვნები ერთად',
            '<Suspense fallback>: ნელი ნაწილი მთელ გვერდს არ აჩერებს',
        ],
        bridge: 'Server Component-ს ბაზასთან წვდომა აქვს. ახლა ვსწავლობთ, მონაცემი სწრაფად როგორ მივიტანოთ და ნელმა ნაწილმა მთელი გვერდი როგორ არ შეაჩეროს.',
        code: `export default async function PlantPage({ params }: Props) {
  const { slug } = await params;

  // პარალელურად: 300 ms + 500 ms → 500 ms
  const [plant, stock] = await Promise.all([getPlant(slug), getStock(slug)]);

  return (
    <article>
      <h1>{plant.name}</h1>
      <p>მარაგში: {stock}</p>
      <Suspense fallback={<p>შეფასებები იტვირთება...</p>}>
        <Reviews slug={slug} />
      </Suspense>
    </article>
  );
}`,
        more: {
            title: 'waterfall, Suspense და loading.tsx',
            points: [
                'Waterfall: <code>await a(); await b();</code> — b ელოდება a-ს, თუმცა მასზე არ არის დამოკიდებული',
                '<code>Promise.all([a(), b()])</code>: ორივე ერთად იწყება',
                '<code>&lt;Suspense&gt;</code>: შიგნით async კომპონენტია. სანამ ის მზადდება, fallback ჩანს',
                'Streaming: HTML ბრაუზერში ნაწილ-ნაწილ მიდის, მომხმარებელი პირველ შედეგს სწრაფად ხედავს',
                '<code>loading.tsx</code>: მთელი გვერდის Suspense, ავტომატურად',
                '<code>error.tsx</code>: შეცდომის საზღვარი, აუცილებლად <code>"use client"</code>',
                'TanStack Query Next.js-შიც გამოგადგება: უსასრულო scroll, polling, ხშირი კლიენტური განახლებები',
            ],
            code: `// app/plants/loading.tsx: ავტომატური Suspense
export default function Loading() {
  return <p>მცენარეები იტვირთება...</p>;
}

// app/plants/error.tsx
'use client';
export default function Error({ reset }: { reset: () => void }) {
  return <button onClick={() => reset()}>თავიდან ცდა</button>;
}`,
            tip: 'Waterfall ბრაუზერის Network ტაბში არ ჩანს, რადგან სერვერზე ხდება. გაზომე ტერმინალში (<code>console.time</code>) ან უბრალოდ დააკვირდი, რამდენ ხანს იხსნება გვერდი.',
        },
        run(out) {
            demoData(out);
        },
    },
    {
        id: 'cache',
        title: 'ქეშირება',
        en: '"use cache"',
        label: 'Cache',
        short: 'Cache',
        icon: 'archive',
        summary: 'Next.js 16-ში ქეშირება opt-in-ია: ნაგულისხმევად ყველაფერი ყოველ მოთხოვნაზე თავიდან სრულდება. <code>"use cache"</code> ფუნქციის ან კომპონენტის შედეგს ინახავს, <code>cacheTag</code> მას ჭდეს აკრავს, <code>updateTag</code> კი მონაცემის შეცვლისას ზუსტად ამ ჭდის ქეშს შლის.',
        analogy: 'ქეში მაცივარში შენახული სადილია: ყოველ ჯერზე თავიდან არ ამზადებ, უბრალოდ იღებ. cacheLife ვარგისობის ვადაა, cacheTag წარწერა ქილაზე („მცენარეები“), updateTag კი ის მომენტია, როცა ახალი სალათი მოამზადე და ძველ ქილას გადააგდებ.',
        keyPoints: [
            'ნაგულისხმევად არაფერი ქეშდება',
            '"use cache" + cacheLife: რამდენ ხანს ინახება',
            'cacheTag → updateTag: ზუსტი გასუფთავება ცვლილებისას',
        ],
        bridge: 'მონაცემის წამოღება უკვე ვიცით. მაგრამ თუ მცენარეების სია დღეში ერთხელ იცვლება, ბაზაში ყოველ მოთხოვნაზე რატომ უნდა წავიდეთ?',
        code: `// next.config.ts
const nextConfig = { cacheComponents: true };

// lib/plants.ts
import { cacheLife, cacheTag } from 'next/cache';

export async function getPlants() {
  'use cache';
  cacheLife('hours');
  cacheTag('plants');
  return db.select().from(plants);
}`,
        more: {
            title: 'ვადა, ჭდეები და Partial Prerendering',
            points: [
                '<code>"use cache"</code>: ფაილის, კომპონენტის ან ფუნქციის პირველ ხაზზე',
                '<code>cacheLife(\'minutes\' | \'hours\' | \'days\')</code>: მზა პროფილები ვადისთვის',
                '<code>cacheTag(\'plants\')</code>: ჭდე, რომლითაც ქეშს მერე იპოვი',
                '<code>updateTag(\'plants\')</code>: Server Action-ში, ცვლილების შემდეგ. მომხმარებელი ახალს მაშინვე ხედავს',
                '<code>revalidateTag(\'plants\', \'max\')</code>: ფონზე განახლება (stale-while-revalidate). Next.js 16-ში მეორე არგუმენტი სავალდებულოა',
                '<code>cookies()</code>, <code>headers()</code>, <code>searchParams</code> დინამიურია: ქეშირებულ ფუნქციაში არ გამოიყენება',
                'Partial Prerendering: სტატიკური გარსი მყისიერად, დინამიური ნაწილები Suspense-ში',
                'ძველი მოდელი (<code>fetch(url, { cache: \'force-cache\' })</code>, <code>export const revalidate</code>) ძველ კოდში შეგხვდება',
            ],
            code: `// სტატიკური გარსი + დინამიური ნაწილი
export default async function PlantPage({ params }: Props) {
  const { slug } = await params;
  const plant = await getPlant(slug); // 'use cache'

  return (
    <article>
      <h1>{plant.name}</h1>
      <Suspense fallback={<p>მარაგი...</p>}>
        <StockLeft id={plant.id} />
      </Suspense>
    </article>
  );
}`,
            tip: 'ქეშირებულ ფუნქციაში მომხმარებლის მონაცემი (cookies, სესია) არ უნდა მოხვდეს: სხვამ შეიძლება შენი კალათა ნახოს. პერსონალური ნაწილი Suspense-ში და ქეშის გარეთ დატოვე.',
        },
        run(out) {
            demoCache(out);
        },
    },
    {
        id: 'actions',
        title: 'Server Actions',
        en: '"use server"',
        label: 'Action',
        short: 'Actions',
        icon: 'send',
        summary: 'Server Action ფუნქციაა, რომელიც სერვერზე სრულდება, მაგრამ ფორმიდან ან ღილაკიდან იძახებ. API endpoint-ის ხელით აწყობა აღარ გჭირდება: <code>&lt;form action={createPlant}&gt;</code> და მონაცემი პირდაპირ სერვერზე მიდის.',
        analogy: 'Server Action სამზარეულოს ზარს ჰგავს: შეკვეთას (FormData) აწვდი და მზარეული ამოწმებს, არის თუ არა ინგრედიენტი და ხარ თუ არა ნამდვილი სტუმარი. ზარის ღილაკს ნებისმიერი დააჭერს, ამიტომ შემოწმება ყოველთვის სამზარეულოში ხდება.',
        keyPoints: [
            '"use server": ფუნქცია სერვერზე სრულდება',
            'Zod სერვერზე, შეცდომები ველების მიხედვით',
            'Action საჯარო endpoint-ია: auth შემოწმება შიგნით',
        ],
        bridge: 'მონაცემის კითხვა და ქეში ვიცით. ახლა მონაცემი იცვლება: ემატება ახალი მცენარე, და ქეშიც მაშინვე უნდა განახლდეს.',
        code: `// app/actions.ts
'use server';

const PlantSchema = z.object({
  name: z.string().min(2, 'მინიმუმ 2 სიმბოლო'),
  price: z.coerce.number().positive('ფასი დადებითი უნდა იყოს'),
});

export async function createPlant(prev: State, formData: FormData) {
  const session = await getSession();
  if (!session) return { message: 'ჯერ შედი სისტემაში' };

  const parsed = PlantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  await db.insert(plants).values(parsed.data);
  updateTag('plants');
  return { message: 'დამატებულია' };
}`,
        more: {
            title: 'useActionState, pending და უსაფრთხოება',
            points: [
                '<code>useActionState(action, initial)</code>: action-ის დაბრუნებული state კლიენტში (შეცდომები, შეტყობინება)',
                '<code>useFormStatus()</code>: <code>pending</code> ღილაკისთვის, რომელიც ფორმის შიგნითაა',
                '<code>useOptimistic</code>: UI მაშინვე იცვლება, სანამ სერვერი პასუხობს',
                'ფორმა JS-ის ჩატვირთვამდეც მუშაობს (progressive enhancement)',
                'ყოველ action-ში: auth → ვალიდაცია → ცვლილება → updateTag',
                'Action-ის გამოძახება ბრაუზერის კონსოლიდანაც შეიძლება, UI-ის გვერდის ავლით',
                'Route Handler ჯობია, როცა გარე კლიენტი იძახებს: მობილური აპი, webhook',
            ],
            code: `'use client';
export function PlantForm() {
  const [state, formAction, pending] = useActionState(createPlant, {});

  return (
    <form action={formAction}>
      <input name="name" />
      {state.errors?.name && <p>{state.errors.name[0]}</p>}
      <input name="price" type="number" />
      <button disabled={pending}>{pending ? 'ინახება...' : 'დამატება'}</button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}`,
            tip: 'Action-ში auth-ის შემოწმება არ გამოტოვო, თუნდაც ღილაკი მხოლოდ ადმინს უჩანდეს. ღილაკის დამალვა UI-ა, დაცვა კი სერვერზე ხდება.',
        },
        run(out) {
            demoActions(out);
        },
    },
    {
        id: 'api',
        title: 'Route Handlers',
        en: 'route.ts',
        label: 'API',
        short: 'API',
        icon: 'plug',
        summary: '<code>route.ts</code> ფაილი URL-ზე HTTP მეთოდებს პასუხობს: <code>export async function GET</code>, <code>POST</code>… ასე შენი საიტი ნამდვილ REST API-ს იძენს, რომელსაც მობილური აპი, სხვა სერვისი ან webhook იძახებს.',
        analogy: 'Server Action რესტორნის შიდა ზარია მიმტანსა და სამზარეულოს შორის. Route Handler კი გარე ფანჯარაა მიტანის სერვისებისთვის (Wolt, Glovo): მათ თავისი ენა აქვთ (HTTP, JSON), და ფანჯარა ყველას ერთნაირად უნდა ემსახურებოდეს.',
        keyPoints: [
            'app/api/plants/route.ts → /api/plants',
            'სწორი სტატუსი: 200, 201, 400, 404',
            'Request body ყოველთვის Zod-ით მოწმდება',
        ],
        bridge: 'Server Action-ები შენი ფორმებისთვისაა. თუ მცენარეების სია მობილურ აპს ან პარტნიორს სჭირდება, საჯარო API გვინდა.',
        code: `// app/api/plants/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') ?? 'name';
  const items = await listPlants({ sort });
  return Response.json(items);
}

export async function POST(request: Request) {
  const parsed = PlantSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: 'არასწორი მონაცემი' }, { status: 400 });
  }
  const plant = await createPlant(parsed.data);
  return Response.json(plant, { status: 201 });
}`,
        more: {
            title: 'REST-ის დიზაინი და სტატუსები',
            points: [
                'რესურსი მრავლობითში: <code>/api/plants</code>, ერთი: <code>/api/plants/42</code>',
                '<code>GET</code> კითხვა, <code>POST</code> შექმნა, <code>PATCH</code> ნაწილობრივი ცვლილება, <code>DELETE</code> წაშლა',
                '<code>app/api/plants/[id]/route.ts</code>: <code>params</code> აქაც Promise-ია',
                'ფილტრი, სორტი, გვერდი query-ში: <code>?sort=price&amp;page=2</code>',
                'შეცდომის ერთი ფორმატი ყველა endpoint-ზე: <code>{ error: \'...\' }</code>',
                '200 OK, 201 Created, 400 Bad Request, 401 არ ხარ შესული, 403 არ გაქვს უფლება, 404 Not Found',
                'რომელ მეთოდსაც არ დააექსპორტებ, მასზე Next.js 405-ს დააბრუნებს',
                'Webhook: გარე სერვისი (მაგ. გადახდა) შენს route.ts-ს იძახებს. ხელმოწერის შემოწმება აუცილებელია',
            ],
            code: `// app/api/plants/[id]/route.ts
type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const deleted = await deletePlant(Number(id));
  if (!deleted) return Response.json({ error: 'ვერ მოიძებნა' }, { status: 404 });
  return new Response(null, { status: 204 });
}`,
            tip: 'fetch 404-ზე ან 500-ზე შეცდომას არ ისვრის: <code>res.ok</code>-ს კლიენტი თავად ამოწმებს. ამიტომ სერვერმა სწორი სტატუსი უნდა დააბრუნოს: 200 შეცდომის ტექსტით კლიენტს ატყუებს.',
        },
        run(out) {
            demoApi(out);
        },
    },
    {
        id: 'db',
        title: 'ბაზა და Drizzle',
        en: 'PostgreSQL · Drizzle ORM',
        label: 'ბაზა',
        short: 'Database',
        icon: 'database',
        summary: 'PostgreSQL მონაცემს ცხრილებში ინახავს, კავშირებს კი foreign key-ებით აწყობს. Drizzle ცხრილს TypeScript-ით აღწერს, SQL-ის მსგავს მოთხოვნებს წერს და შედეგს ტიპებით აბრუნებს.',
        analogy: 'ცხრილი Excel-ის ფურცელს ჰგავს: სვეტები ველებია, ხაზები ჩანაწერები. foreign key ბმულია სხვა ფურცელზე: შეკვეთაში მცენარის სახელს კი არ წერ, მის ნომერს (plant_id), რომ სახელის შეცვლა ყველგან ერთბაშად აისახოს.',
        keyPoints: [
            'primary key: ჩანაწერის უნიკალური ნომერი',
            'foreign key: კავშირი სხვა ცხრილთან (1:N, N:N)',
            'მიგრაცია: სქემის ცვლილებების ისტორია',
        ],
        bridge: 'API და action-ები მონაცემს სადღაც უნდა ინახავდნენ. ახლა ეს „სადღაც“ ნამდვილი ბაზაა.',
        code: `// db/schema.ts
export const plants = pgTable('plants', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  price: integer('price').notNull(), // თეთრებში
  stock: integer('stock').notNull().default(0),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  plantId: integer('plant_id').notNull().references(() => plants.id),
  qty: integer('qty').notNull(),
});`,
        more: {
            title: 'მოთხოვნები, ტრანზაქცია და Data Access Layer',
            points: [
                '<code>db.select().from(plants).where(eq(plants.slug, slug))</code> = <code>SELECT * FROM plants WHERE slug = $1</code>',
                '<code>orderBy</code>, <code>limit</code>, <code>offset</code>: სორტი და pagination ბაზაში, არა JS-ში',
                '<code>drizzle-kit generate</code> და <code>migrate</code>: სქემის ცვლილება მიგრაციად',
                'Seed: სატესტო მონაცემი ახალი ბაზისთვის',
                'ტრანზაქცია: ან ყველაფერი სრულდება, ან არაფერი (შეკვეთა + მარაგის შემცირება)',
                'N+1: სიის ყოველ ელემენტზე ცალკე მოთხოვნა. გამოსავალი: JOIN ან <code>with</code> ერთ მოთხოვნაში',
                'DAL: ბაზის ყველა ფუნქცია ერთ ფოლდერში, <code>import \'server-only\'</code>-ით და წვდომის შემოწმებით',
                'ფული მთელ რიცხვად (თეთრი), რადგან <code>0.1 + 0.2 !== 0.3</code>',
            ],
            code: `// lib/dal/orders.ts
import 'server-only';

export async function buyPlant(plantId: number, qty: number) {
  return db.transaction(async (tx) => {
    const [plant] = await tx.select().from(plants).where(eq(plants.id, plantId));
    if (plant.stock < qty) throw new Error('მარაგი არ კმარა');

    await tx.update(plants)
      .set({ stock: plant.stock - qty })
      .where(eq(plants.id, plantId));
    return tx.insert(orders).values({ plantId, qty }).returning();
  });
}`,
            tip: 'SQL-ს ტექსტად ნუ აწყობ: <code>WHERE name = \'${name}\'</code> SQL injection-ის კარია. Drizzle მნიშვნელობას პარამეტრად (<code>$1</code>) გადასცემს და ის ბრძანებად ვერასდროს იქცევა.',
        },
        run(out) {
            demoDb(out);
        },
    },
    {
        id: 'auth',
        title: 'Auth და დაცვა',
        en: 'Better Auth · proxy.ts',
        label: 'Auth',
        short: 'Auth',
        icon: 'shield',
        summary: 'ავთენტიფიკაცია ამოწმებს, ვინ ხარ (login), ავტორიზაცია კი, რისი უფლება გაქვს (როლი). სესია httpOnly cookie-ში ინახება, <code>proxy.ts</code> ადრეულ გადამისამართებას აკეთებს, ნამდვილი შემოწმება კი ყოველთვის მონაცემთან ახლოს, DAL-სა და action-ში ხდება.',
        analogy: 'სასტუმრო: რეცეფციაზე პასპორტით ადასტურებ, ვინ ხარ (authentication), და ბარათს გაძლევენ (session cookie). ბარათი მხოლოდ შენს ოთახს და სპორტდარბაზს ხსნის (authorization). დერეფნის დაცვა (proxy.ts) ბარათის გარეშე არავის უშვებს, მაგრამ ყოველი ოთახის საკეტი ბარათს მაინც თავად ამოწმებს.',
        keyPoints: [
            'Authentication: ვინ ხარ? Authorization: რა შეგიძლია?',
            'სესია httpOnly cookie-ში, არა localStorage-ში',
            'proxy.ts: სწრაფი redirect. ნამდვილი შემოწმება: DAL',
        ],
        bridge: 'ბაზაში უკვე შეკვეთებია. ახლა უნდა დავრწმუნდეთ, რომ ყოველი მომხმარებელი მხოლოდ თავის შეკვეთებს ხედავს, ადმინის გვერდს კი მხოლოდ ადმინი.',
        code: `// lib/dal/orders.ts
export async function getMyOrders() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  return db.select().from(orders)
    .where(eq(orders.userId, session.user.id)); // მხოლოდ საკუთარი
}

export async function deleteOrder(id: number) {
  const session = await requireSession();
  if (session.user.role !== 'admin') throw new Error('Forbidden');
  await db.delete(orders).where(eq(orders.id, id));
}`,
        more: {
            title: 'სესია, proxy.ts და ხშირი ხვრელები',
            points: [
                'პაროლი ტექსტად არასდროს ინახება, მხოლოდ hash (Better Auth ამას თავად აკეთებს)',
                '<code>httpOnly</code> cookie JS-ით არ იკითხება, ამიტომ XSS-ით ვერ მოიპარავენ',
                'Better Auth: email + პაროლი, Google/GitHub OAuth, სესია Server Component-ში',
                '<code>proxy.ts</code> (ძველად <code>middleware.ts</code>): cookie-ს არსებობის შემოწმება და redirect',
                'RBAC: როლის შემოწმება DAL-ში ან action-ში, არა მხოლოდ ღილაკის დამალვით',
                'IDOR: <code>/api/orders/43</code> სხვისი შეკვეთაა, თუ userId-ს არ ამოწმებ',
                '<code>NEXT_PUBLIC_</code> ცვლადი ბრაუზერში ჩანს: საიდუმლო გასაღები ასე არასდროს',
                'Rate limiting login-ზე: პაროლის გამოცნობის წინააღმდეგ',
            ],
            code: `// proxy.ts: ადრეული redirect, ბაზის გარეშე
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/account/:path*', '/admin/:path*'] };`,
            tip: 'proxy.ts მხოლოდ cookie-ს არსებობას ამოწმებს: არც მის ნამდვილობას, არც როლს. ყოველი მონაცემის წაკითხვა და შეცვლა სესიას თავად უნდა ამოწმებდეს.',
        },
        run(out) {
            demoAuth(out);
        },
    },
];
