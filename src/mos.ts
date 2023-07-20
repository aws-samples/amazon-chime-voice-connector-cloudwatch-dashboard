import { Duration } from 'aws-cdk-lib';
import {
  Metric,
  GraphWidget,
  GraphWidgetView,
  HorizontalAnnotation,
  Dashboard,
  Row,
  Stats,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

interface MeanOpinionScoreProps {
  metricRegion: string;
  dashboard: Dashboard;
  row: Row;
  width: number;
}
export class MeanOpinionScore extends Construct {
  public readonly widget: GraphWidget;

  constructor(scope: Construct, id: string, props: MeanOpinionScoreProps) {
    super(scope, id);

    const mosBetweenVCandCustomerMetric = new Metric({
      metricName: 'MOSBetweenVcAndCustomer',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      statistic: Stats.AVERAGE,
      period: Duration.minutes(1),
    });

    const mosHorizontalAnnotation: HorizontalAnnotation = {
      label: 'Acceptable MOS',
      value: 3.9,
    };
    this.widget = new GraphWidget({
      left: [mosBetweenVCandCustomerMetric],
      title: 'MOS - ' + props.metricRegion,
      width: props.width,
      liveData: true,
      view: GraphWidgetView.TIME_SERIES,
      stacked: false,
      region: props.metricRegion,
      leftYAxis: {
        min: 0,
        max: 5,
      },
      statistic: Stats.AVERAGE,
      period: Duration.minutes(1),
      leftAnnotations: [mosHorizontalAnnotation],
    });
    props.row.addWidget(this.widget);
  }
}
