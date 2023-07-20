import { Duration } from 'aws-cdk-lib';
import {
  Metric,
  GraphWidget,
  GraphWidgetView,
  Dashboard,
  Row,
  Stats,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

interface OutboundCallProps {
  metricRegion: string;
  dashboard: Dashboard;
  row: Row;
  width: number;
}
export class OutboundCall extends Construct {
  public readonly widget: GraphWidget;

  constructor(scope: Construct, id: string, props: OutboundCallProps) {
    super(scope, id);

    const outboundCallFailuresMetric = new Metric({
      metricName: 'OutboundCallFailures',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      color: '#d62728',
      period: Duration.minutes(1),
      statistic: Stats.SUM,
    });

    const outboundCallsActiveMetric = new Metric({
      metricName: 'OutboundCallsActive',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      color: '#2ca02c',
      period: Duration.minutes(1),
      statistic: Stats.SUM,
    });

    this.widget = new GraphWidget({
      left: [outboundCallsActiveMetric, outboundCallFailuresMetric],
      title: 'Outbound Calls - ' + props.metricRegion,
      liveData: true,
      width: props.width,
      view: GraphWidgetView.TIME_SERIES,
      stacked: false,
      region: props.metricRegion,
      period: Duration.minutes(1),
      statistic: Stats.SUM,
    });
    props.row.addWidget(this.widget);
  }
}
