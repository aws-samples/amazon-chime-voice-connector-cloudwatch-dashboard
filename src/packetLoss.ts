import { Duration } from 'aws-cdk-lib';
import {
  Metric,
  GraphWidget,
  MathExpression,
  GraphWidgetView,
  Dashboard,
  Row,
  Stats,
  HorizontalAnnotation,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

interface PacketLossProps {
  metricRegion: string;
  dashboard: Dashboard;
  row: Row;
  width: number;
}
export class PacketLoss extends Construct {
  public readonly widget: GraphWidget;

  constructor(scope: Construct, id: string, props: PacketLossProps) {
    super(scope, id);

    const customerToVcPacketsLost = new Metric({
      metricName: 'CustomerToVcPacketsLost',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      statistic: 'Average',
      period: Duration.seconds(1),
    });

    const customerToVcRtpPackets = new Metric({
      metricName: 'CustomerToVcRtpPackets',
      label: 'CustomerToVcRtpPackets',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      statistic: 'Average',
      period: Duration.minutes(1),
    });

    const vcToCustomerPacketsLost = new Metric({
      metricName: 'VcToCustomerPacketsLost',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      statistic: 'Average',
      period: Duration.seconds(1),
    });

    const vcToCustomerRtpPackets = new Metric({
      metricName: 'VcToCustomerRtpPackets',
      label: 'VcToCustomerRtpPackets',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.metricRegion,
      statistic: Stats.AVERAGE,
      period: Duration.minutes(1),
    });

    const packetLossCustomerToVCPercentMath = new MathExpression({
      expression:
        'IF(vcToCustomerRtpPackets, IF(vcToCustomerPacketsLost, (3000-vcToCustomerRtpPackets)/3000*100, 0), 0)',
      label: 'Packet Lost % - CustomerToVC',
      color: '#e377c2',
      usingMetrics: {
        customerToVcRtpPackets: customerToVcRtpPackets,
        customerToVcPacketsLost: customerToVcPacketsLost,
      },
    });

    const packetLossVCToCustomerPercentMath = new MathExpression({
      expression:
        'IF(vcToCustomerRtpPackets, IF(vcToCustomerPacketsLost, (3000-vcToCustomerRtpPackets)/3000*100, 0), 0)',
      label: 'Packet Lost % - VCToCustomer',
      color: '#bcbd22',
      usingMetrics: {
        vcToCustomerRtpPackets: vcToCustomerRtpPackets,
        vcToCustomerPacketsLost: vcToCustomerPacketsLost,
      },
    });

    const packetLossAnnotation: HorizontalAnnotation = {
      label: 'AcceptablePacket Loss',
      value: 1,
    };

    this.widget = new GraphWidget({
      left: [
        packetLossCustomerToVCPercentMath,
        packetLossVCToCustomerPercentMath,
      ],
      title: 'Packet Loss % - ' + props.metricRegion,
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
      leftAnnotations: [packetLossAnnotation],
    });

    props.row.addWidget(this.widget);
  }
}
