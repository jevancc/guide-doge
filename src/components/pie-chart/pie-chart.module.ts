import { NgModule } from '@angular/core';
import { PieChartComponent } from './pie-chart.component';
import { CommonModule } from '@angular/common';
import { A11yPlaceholderModule } from '../../directives/a11y-placeholder/a11y-placeholder.module';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    PieChartComponent,
  ],
  imports: [
    CommonModule,
    A11yPlaceholderModule,
    MatCardModule,
  ],
  exports: [
    PieChartComponent,
  ],
})
export class PieChartModule {
}
