import { Component, Directive, signal } from '@angular/core';
import { Icon, Plant } from './shared';
import { SensorPanel } from './topic-demos';

/* =========================================================
   What the code-ordering puzzles do once they are in order.
   Each one is the puzzle's code, running.
   ========================================================= */

@Component({
    selector: 'puzzle-counter',
    template: `
        <button type="button" class="btn btn--primary demo-counter" (click)="inc()">{{ count() }}</button>
        <p class="demo-note">დააჭირე: update() სიგნალს ცვლის და Angular მხოლოდ ამ ღილაკს ხატავს თავიდან.</p>`,
})
export class PuzzleCounter {
    readonly count = signal(0);
    inc() { this.count.update(c => c + 1); }
}

@Component({
    selector: 'puzzle-list',
    template: `
        <div class="demo-btns">
            <button type="button" class="btn btn--sm btn--primary" (click)="add()">+ მცენარე</button>
            <button type="button" class="btn btn--sm" (click)="plants.set([])">გასუფთავება</button>
        </div>
        <ul class="r-list">
            @for (plant of plants(); track plant.id) {
                <li>{{ plant.name }}</li>
            } @empty {
                <li>სათბური ცარიელია</li>
            }
        </ul>`,
})
export class PuzzleList {
    private next = 3;
    readonly plants = signal<Plant[]>([{ id: 1, name: 'პიტნა', water: 50 }, { id: 2, name: 'ბაზილიკი', water: 50 }]);
    add() {
        const id = this.next++;
        this.plants.update(list => [...list, { id, name: `მცენარე #${id}`, water: 50 }]);
    }
}

@Component({
    selector: 'puzzle-water',
    imports: [Icon],
    template: `
        <ul class="r-list">
            @for (p of plants(); track p.id) {
                <li class="ng-row">
                    <app-icon name="drop" [size]="18" />
                    <b>{{ p.name }}</b>
                    <span class="ng-meter" aria-hidden="true"><span [style.width.%]="p.water"></span></span>
                    <span>{{ p.water }}%</span>
                    <button type="button" class="btn btn--sm" (click)="water(p.id)">მორწყვა</button>
                </li>
            }
        </ul>
        <p class="demo-note">update() ახალ მასივს აბრუნებს, map კი მხოლოდ ერთ მცენარეს ცვლის.</p>`,
})
export class PuzzleWater {
    readonly plants = signal<Plant[]>([
        { id: 1, name: 'პიტნა', water: 25 },
        { id: 2, name: 'ბაზილიკი', water: 60 },
        { id: 3, name: 'რეჰანი', water: 10 },
    ]);
    water(id: number) {
        this.plants.update(list =>
            list.map(p => (p.id === id ? { ...p, water: 100 } : p)),
        );
    }
}

@Component({
    selector: 'puzzle-service',
    imports: [SensorPanel],
    template: `
        <app-sensor-panel title="ფანჯარა" />
        <app-sensor-panel title="კარი" />
        <p class="demo-note">ორივე inject(SensorService)-ს იძახებს და ერთსა და იმავე ეგზემპლარს იღებს.</p>`,
})
export class PuzzleService {}

@Directive({
    selector: '[puzzleHighlight]',
    host: {
        '(mouseenter)': 'on.set(true)',
        '(mouseleave)': 'on.set(false)',
        '[style.background]': "on() ? '#fde68a' : null",
        '[style.transition]': "'background .25s'",
    },
})
export class PuzzleHighlight {
    readonly on = signal(false);
}

@Component({
    selector: 'puzzle-directive',
    imports: [PuzzleHighlight],
    template: `
        <ul class="r-list">
            <li puzzleHighlight>პიტნა</li>
            <li puzzleHighlight>ბაზილიკი</li>
            <li puzzleHighlight>რეჰანი</li>
        </ul>
        <p class="demo-note">მიიტანე მაუსი: ერთი დირექტივა, სამი ელემენტი.</p>`,
})
export class PuzzleDirective {}
