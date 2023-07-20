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

interface JitterProps {
  metricRegion: string;
  dashboard: Dashboard;
  row: Row;
  width: number;
}

export class Jitter extends Construct {
  public readonly widget: GraphWidget;

  constructor(scope: Construct, id: string, props: JitterProps) {
    super(scope, id);

    const jitterBetweenVCandCustomerMetric = new Metric({
      metricName: 'VcToCustomerJitter',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      statistic: Stats.AVERAGE,
      period: Duration.minutes(1),
    });

    const jitterBetweenCustomerAndVCMetric = new Metric({
      metricName: 'CustomerToVcJitter',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      statistic: Stats.AVERAGE,
      period: Duration.minutes(1),
    });

    const jitterBetweenVCandCustomerMath = new MathExpression({
      expression: '(jitterBetweenVCandCustomer/100)',
      label: 'Jitter VC to Customer',
      color: '#bcbd22',
      usingMetrics: {
        jitterBetweenVCandCustomer: jitterBetweenVCandCustomerMetric,
      },
    });

    const jitterBetweenCustomerAndVCMath = new MathExpression({
      expression: '(jitterBetweenCustomerAndVC/100)',
      label: 'Jitter Customer to VC',
      color: '#e377c2',
      usingMetrics: {
        jitterBetweenCustomerAndVC: jitterBetweenCustomerAndVCMetric,
      },
    });

    const jitterHorizontalAnnotation: HorizontalAnnotation = {
      label: 'Acceptable Jitter in ms',
      value: 30,
    };
    this.widget = new GraphWidget({
      left: [jitterBetweenCustomerAndVCMath, jitterBetweenVCandCustomerMath],
      title: 'Jitter - ' + props.metricRegion,
      width: props.width,
      liveData: true,
      view: GraphWidgetView.TIME_SERIES,
      stacked: false,
      region: props.metricRegion,
      leftYAxis: {
        min: 0,
      },
      statistic: Stats.AVERAGE,
      period: Duration.minutes(1),
      leftAnnotations: [jitterHorizontalAnnotation],
    });
    props.row.addWidget(this.widget);
  }
}
