import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OfferDetailPage} from './offer-detail.page';

describe('OfferDetailPage', () => {
  let component: OfferDetailPage;
  let fixture: ComponentFixture<OfferDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
