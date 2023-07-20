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

interface InboundCallProps {
  metricRegion: string;
  dashboard: Dashboard;
  row: Row;
  width: number;
}

export class InboundCall extends Construct {
  public readonly widget: GraphWidget;

  constructor(scope: Construct, id: string, props: InboundCallProps) {
    super(scope, id);

    const inboundCallFailuresMetric = new Metric({
      metricName: 'InboundCallFailures',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      color: '#d62728',
      statistic: Stats.SUM,
      period: Duration.minutes(1),
    });

    const inboundCallsActiveMetric = new Metric({
      metricName: 'InboundCallsActive',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      color: '#2ca02c',
      statistic: Stats.SUM,
      period: Duration.minutes(1),
    });

    this.widget = new GraphWidget({
      left: [inboundCallsActiveMetric, inboundCallFailuresMetric],
      title: 'Inbound Calls - ' + props.metricRegion,
      liveData: true,
      width: props.width,
      view: GraphWidgetView.TIME_SERIES,
      stacked: false,
      region: props.metricRegion,
      statistic: Stats.SUM,
      period: Duration.minutes(1),
    });

    props.row.addWidget(this.widget);
  }
}
