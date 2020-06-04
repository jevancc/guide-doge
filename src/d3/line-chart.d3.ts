import { Datum, XYChartD3 } from './xy-chart.d3';
import * as d3 from 'd3';
import { Observable } from 'rxjs';
import { t } from '../assets/i18n/utils';
import { formatX, formatY } from '../utils/formatters';

export class LineChartD3 extends XYChartD3 {
  protected renderData(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    dataObservable: Observable<Datum[]>,
    scaleX: d3.ScaleTime<number, number>,
    scaleY: d3.ScaleLinear<number, number>,
  ) {
    const line = d3
      .line<Datum>()
      .defined(d => !isNaN(d.value))
      .x(d => scaleX(d.date))
      .y(d => scaleY(d.value));

    const path = svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');


    const dataSubscription = dataObservable.subscribe(data => {
      path
        .datum(data)
        .transition(this.transition)
        .attr('d', line);
    });

    return () => {
      dataSubscription.unsubscribe();
      path.remove();
    };
  }

  protected renderActiveIndicator(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    activeDatumObservable: Observable<Datum | null>,
    scaleX: d3.ScaleTime<number, number>,
    scaleY: d3.ScaleLinear<number, number>,
    xAxis: d3.Axis<Date>,
    yAxis: d3.Axis<number>,
  ) {
    const g = svg
      .append('g');

    g
      .append('circle')
      .attr('r', 4)
      .attr('fill', 'steelblue');

    const text = g
      .append('text')
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10);

    const activeDatumSubscription = activeDatumObservable.subscribe(activeDatum => {
      if (!activeDatum) {
        g
          .attr('display', 'none');
        return;
      }
      const { date, value } = activeDatum;
      g
        .transition(this.createTransition(50))
        .attr('display', 'inherit')
        .attr('transform', `translate(${scaleX(date)},${scaleY(value)})`);
      text.text(t('audification.active_datum', {
        x: formatX(date),
        y: formatY(value),
      }));
    });

    return () => {
      activeDatumSubscription.unsubscribe();
      g.remove();
    };
  }
}
