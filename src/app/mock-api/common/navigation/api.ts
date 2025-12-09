import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';

import { horizontalNavigation, defaultNavigation } from 'app/mock-api/common/navigation/data';

@Injectable({
    providedIn: 'root',
})
export class NavigationMockApi {
    private readonly _horizontalNavigation = cloneDeep(horizontalNavigation);
    private readonly _defaultNavigation = cloneDeep(defaultNavigation);

    constructor(private _fuseMockApiService: FuseMockApiService) {
        this.registerHandlers();
    }

    private syncChildren(targetNav: FuseNavigationItem[]): void {
        targetNav.forEach((item) => {
            const defaultItem = this._defaultNavigation.find((d) => d.id === item.id);

            if (defaultItem?.children) {
                item.children = cloneDeep(defaultItem.children);
            }
        });
    }

    registerHandlers(): void {
        this._fuseMockApiService.onGet('api/common/navigation').reply(() => {
            this.syncChildren(this._horizontalNavigation);

            return [
                200,
                {
                    horizontal: cloneDeep(this._horizontalNavigation),
                },
            ];
        });
    }
}
