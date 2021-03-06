import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Occupation } from './occupation.model';
import { OccupationPopupService } from './occupation-popup.service';
import { OccupationService } from './occupation.service';

@Component({
    selector: 'jhi-occupation-dialog',
    templateUrl: './occupation-dialog.component.html'
})
export class OccupationDialogComponent implements OnInit {

    occupation: Occupation;
    authorities: any[];
    isSaving: boolean;

    constructor(
        public activeModal: NgbActiveModal,
        private alertService: JhiAlertService,
        private occupationService: OccupationService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.occupation.id !== undefined) {
            this.subscribeToSaveResponse(
                this.occupationService.update(this.occupation));
        } else {
            this.subscribeToSaveResponse(
                this.occupationService.create(this.occupation));
        }
    }

    private subscribeToSaveResponse(result: Observable<Occupation>) {
        result.subscribe((res: Occupation) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError(res));
    }

    private onSaveSuccess(result: Occupation) {
        this.eventManager.broadcast({ name: 'occupationListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError(error) {
        try {
            error.json();
        } catch (exception) {
            error.message = error.text();
        }
        this.isSaving = false;
        this.onError(error);
    }

    private onError(error) {
        this.alertService.error(error.message, null, null);
    }
}

@Component({
    selector: 'jhi-occupation-popup',
    template: ''
})
export class OccupationPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private occupationPopupService: OccupationPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.modalRef = this.occupationPopupService
                    .open(OccupationDialogComponent, params['id']);
            } else {
                this.modalRef = this.occupationPopupService
                    .open(OccupationDialogComponent);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
