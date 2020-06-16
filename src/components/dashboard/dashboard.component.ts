import { Component } from '@angular/core';
import { PreferenceService } from '../../services/preference/preference.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // manual destructuring for easy access in template
  audification = this.preferenceService.audification;
  dataTable = this.preferenceService.dataTable;
  textSummary = this.preferenceService.textSummary;

  constructor(
    private preferenceService: PreferenceService,
  ) {
  }
}
