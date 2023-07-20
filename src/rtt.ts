import { Duration } from 'aws-cdk-lib';
import {
  Metric,
  GraphWidget,
  MathExpression,
  GraphWidgetView,
  HorizontalAnnotation,
  Dashboard,
  Row,
  Stats,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

interface RoundTripTimeProps {
  metricRegion: string;
  dashboard: Dashboard;
  row: Row;
  width: number;
}
export class RoundTripTime extends Construct {
  public readonly widget: GraphWidget;

  constructor(scope: Construct, id: string, props: RoundTripTimeProps) {
    super(scope, id);

    const rttBetweenVCandCustomerMetric = new Metric({
      metricName: 'RTTBetweenVcAndCustomer',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      statistic: Stats.AVERAGE,
      period: Duration.minutes(1),
    });

    const rttBetweenVCandCustomerMath = new MathExpression({
      expression: '(rttBetweenVCandCustomer/1000)',
      label: 'RTT in ms',
      usingMetrics: {
        rttBetweenVCandCustomer: rttBetweenVCandCustomerMetric,
      },
    });

    const rttHorizontalAnnotation: HorizontalAnnotation = {
      label: 'Acceptable RTT in ms',
      value: 150,
    };
    this.widget = new GraphWidget({
      left: [rttBetweenVCandCustomerMath],
      title: 'RTT - ' + props.metricRegion,
      liveData: true,
      width: props.width,
      view: GraphWidgetView.TIME_SERIES,
      stacked: false,
      region: props.metricRegion,
      leftYAxis: {
        min: 0,
      },
      statistic: Stats.AVERAGE,
      period: Duration.minutes(1),
      leftAnnotations: [rttHorizontalAnnotation],
    });

    props.row.addWidget(this.widget);
  }
}
