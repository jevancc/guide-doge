import { NgModule } from '@angular/core';
import { LineChartComponent } from './line-chart.component';
import { LineChartVisualizationModule } from '../line-chart-visualization/line-chart-visualization.module';
import { LineChartAudificationModule } from '../line-chart-audification/line-chart-audification.module';
import { CardModule } from '../card/card.module';

@NgModule({
  declarations: [
    LineChartComponent,
  ],
  imports: [
    CardModule,
    LineChartVisualizationModule,
    LineChartAudificationModule,
  ],
  exports: [
    LineChartComponent,
  ],
})
export class LineChartModule {
}
