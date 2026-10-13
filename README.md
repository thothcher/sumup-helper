# Sum-up Helper

JavaScript, React, Next.js და Angular შეჯამებები ერთ ადგილას. ყოველი თემა ცხოვრებისეული მაგალითით, გაშვებადი კოდით და დემოთი, ბოლოს კი პრაქტიკა თამაშად.

**ცოცხალი ვერსია:** https://thothcher.github.io/sumup-helper/

| საიტი | თემები | სტილი |
|---|---|---|
| [JS ფოთლები](js/) | ცვლადები, პირობები, ციკლები, ფუნქციები, კლასები, DOM, BOM, API | შემოდგომის ტყე, ცვენადი ფოთლები, მუსიკა |
| [React სტუდია](react/) | Components, State, Lists, Effects, Context, Router, Forms, Query | მშვიდი, ნათელი; დემოები ნამდვილ React-ზე |
| [Next.js Netrunner](nextjs/) | Rendering, Routing, Server, Data, Cache, Actions, API, Database, Auth | კიბერპანკი; სერვერის სიმულაციები |
| [Angular სიგნალი](angular/) | Components, Bindings, Signals, Control Flow, Inputs, Directives, Services, Router, HTTP | მკვეთრი, გრადიენტით; დემოები ნამდვილ Angular 22-ზე |

## პრაქტიკა: თამაში

ყოველ საიტს აქვს ერთი ფანჯარა ოთხი დონით: ტესტი, ბაგის ძებნა, კოდის დალაგება და „რა მოხდება?“.
სწორი პასუხი მონეტებს მოგიტანს, ზედიზედ სამი კი კომბოს. ყოველ დონეზე სამი გული გაქვს.
ბოლო გულზე რაღაც უცნაური ხდება... ეს საიდუმლოა.

## გაშვება

build არ სჭირდება: ეს უბრალოდ HTML, CSS და JavaScript-ია. გახსენი `index.html` Live Server-ით (ან ნებისმიერი სტატიკური სერვერით), მაგ.:

```bash
npx serve .
```

## სტრუქტურა

```
index.html          მთავარი გვერდი: ოთხი ბარათი
js/                 JS ფოთლები
react/              React სტუდია (vendor/: React 18.3.1)
nextjs/             Next.js Netrunner
angular/            Angular სიგნალი
  ng/main.js        აწყობილი Angular დემოები (Angular Elements)
  demos-src/        მათი წყარო: Angular 22 workspace
```

ოთხივე საიტი ერთსა და იმავე თამაშის ძრავას იყენებს: `src/game.js` და `src/levels.js` ოთხივეში ერთნაირია.
React-ს, Next.js-ს და Angular-ს ასევე საერთო აქვთ `styles/base.css`; თითოეულის იერსახე `styles/theme.css`-შია.
ერთ-ერთის შეცვლისას ასლი დანარჩენებშიც გადაიტანე.

## Angular-ის დემოები

Angular build-ის გარეშე ვერ იმუშავებს, ამიტომ მისი დემოები `angular/demos-src/`-შია (Angular 22, zoneless) და წინასწარ იკრიბება ერთ ფაილად, `angular/ng/main.js`. იქ Angular Elements ყოველ კომპონენტს custom element-ად არეგისტრირებს (`<ng-demo-signals>` და ა.შ.), გვერდი კი მათ ჩვეულებრივ HTML ტეგებად იყენებს.

დემოს შეცვლის შემდეგ:

```bash
cd angular/demos-src
npm install
npx ng build      # → angular/ng/main.js
```
