import { Duration } from 'aws-cdk-lib';
import {
  Alarm,
  Metric,
  ComparisonOperator,
  TreatMissingData,
  MathExpression,
  Stats,
} from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export interface AlarmsProps {
  alarmRegion: string;
  topic: Topic;
}

export class Alarms extends Construct {
  public mosAlarm: Alarm;
  public rttAlarm: Alarm;
  public vcToCustomerPacketLossAlarm: Alarm;
  public customerToVcPacketLossAlarm: Alarm;
  public vcToCustomerJitterAlarm: Alarm;
  public customerToVcJitterAlarm: Alarm;
  public sip4xxCodesAlarm: Alarm;
  public sip5xxCodesAlarm: Alarm;
  public sip6xxCodesAlarm: Alarm;
  public inboundCallFailurePercentAlarm: Alarm;
  public outboundCallFailurePercentAlarm: Alarm;

  constructor(scope: Construct, id: string, props: AlarmsProps) {
    super(scope, id);

    const mosMetric = new Metric({
      namespace: 'AWS/ChimeVoiceConnector',
      metricName: 'MOSBetweenVcAndCustomer',
      period: Duration.seconds(60),
      statistic: Stats.AVERAGE,
      region: props.alarmRegion,
    });

    this.mosAlarm = new Alarm(this, 'mosMetricAlarm' + props.alarmRegion, {
      comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
      alarmName: 'MOS_' + props.alarmRegion,
      alarmDescription:
        'MOS for Voice Connectors in ' +
        props.alarmRegion +
        '.\nThreshold: 3.9',
      threshold: 3.9,
      evaluationPeriods: 1,
      metric: mosMetric,
      datapointsToAlarm: 1,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });

    this.mosAlarm.addAlarmAction(new SnsAction(props.topic));

    const rttMetric = new Metric({
      namespace: 'AWS/ChimeVoiceConnector',
      metricName: 'RTTBetweenVcAndCustomer',
      period: Duration.seconds(60),
      statistic: Stats.AVERAGE,
      region: props.alarmRegion,
    });

    this.rttAlarm = new Alarm(this, 'rttAlarm' + props.alarmRegion, {
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      alarmName: 'RTT_' + props.alarmRegion,
      alarmDescription:
        'RTT for Voice Connectors in ' +
        props.alarmRegion +
        '.\nThreshold: 150ms\n',
      threshold: 150000,
      evaluationPeriods: 1,
      metric: rttMetric,
      datapointsToAlarm: 1,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });

    this.rttAlarm.addAlarmAction(new SnsAction(props.topic));

    const customerToVcPacketLossMetric = new Metric({
      namespace: 'AWS/ChimeVoiceConnector',
      metricName: 'CustomerToVcPacketLoss',
      period: Duration.seconds(60),
      statistic: Stats.AVERAGE,
      region: props.alarmRegion,
    });

    this.customerToVcPacketLossAlarm = new Alarm(
      this,
      'customerToVcPacketLossAlarm' + props.alarmRegion,
      {
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        alarmName: 'CustomerToVcPacketLoss_' + props.alarmRegion,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        metric: customerToVcPacketLossMetric,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      },
    );

    this.customerToVcPacketLossAlarm.addAlarmAction(new SnsAction(props.topic));

    const vcToCustomerPacketLossMetric = new Metric({
      namespace: 'AWS/ChimeVoiceConnector',
      metricName: 'VcToCustomerPacketsLost',
      period: Duration.seconds(60),
      statistic: Stats.AVERAGE,
      region: props.alarmRegion,
    });

    this.vcToCustomerPacketLossAlarm = new Alarm(
      this,
      'vcToCustomerPacketLossAlarm' + props.alarmRegion,
      {
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 1,
        alarmName: 'VcToCustomerPacketLoss_' + props.alarmRegion,
        evaluationPeriods: 1,
        metric: vcToCustomerPacketLossMetric,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        datapointsToAlarm: 1,
      },
    );

    this.vcToCustomerPacketLossAlarm.addAlarmAction(new SnsAction(props.topic));

    const vcToCustomerJitterMetric = new Metric({
      namespace: 'AWS/ChimeVoiceConnector',
      metricName: 'VcToCustomerJitter',
      period: Duration.seconds(60),
      statistic: Stats.AVERAGE,
      region: props.alarmRegion,
    });

    this.vcToCustomerJitterAlarm = new Alarm(
      this,
      'vcToCustomerJitterAlarm' + props.alarmRegion,
      {
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 300,
        evaluationPeriods: 1,
        alarmName: 'VcToCustomerJitter_' + props.alarmRegion,
        metric: vcToCustomerJitterMetric,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        datapointsToAlarm: 1,
      },
    );

    this.vcToCustomerJitterAlarm.addAlarmAction(new SnsAction(props.topic));

    const customerToVcJitterMetric = new Metric({
      namespace: 'AWS/ChimeVoiceConnector',
      metricName: 'CustomerToVcJitter',
      period: Duration.seconds(60),
      statistic: Stats.AVERAGE,
      region: props.alarmRegion,
    });

    this.customerToVcJitterAlarm = new Alarm(this, 'customerToVcJitterAlarm', {
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      threshold: 300,
      evaluationPeriods: 1,
      alarmName: 'CustomerToVcJitter_' + props.alarmRegion,
      datapointsToAlarm: 1,
      metric: customerToVcJitterMetric,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });

    this.customerToVcJitterAlarm.addAlarmAction(new SnsAction(props.topic));

    const sip4xxCodesAlarm = new Metric({
      namespace: 'AWS/ChimeVoiceConnector',
      metricName: 'Sip4xxCodes',
      period: Duration.seconds(60),
      statistic: Stats.SUM,
      region: props.alarmRegion,
    });

    this.sip4xxCodesAlarm = new Alarm(
      this,
      'sip4xxCodesAlarm' + props.alarmRegion,
      {
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 5,
        alarmName: 'Sip4xxCodes_' + props.alarmRegion,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        metric: sip4xxCodesAlarm,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      },
    );

    this.sip4xxCodesAlarm.addAlarmAction(new SnsAction(props.topic));

    const sip5xxCodesAlarm = new Metric({
      namespace: 'AWS/ChimeVoiceConnector',
      metricName: 'Sip5xxCodes',
      period: Duration.seconds(60),
      statistic: Stats.SUM,
      region: props.alarmRegion,
      label: 'Sip5xxCodes',
    });

    this.sip5xxCodesAlarm = new Alarm(
      this,
      'sip5xxCodesAlarm' + props.alarmRegion,
      {
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 5,
        alarmName: 'Sip5xxCodes_' + props.alarmRegion,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        metric: sip5xxCodesAlarm,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      },
    );

    this.sip5xxCodesAlarm.addAlarmAction(new SnsAction(props.topic));

    const sip6xxCodesAlarm = new Metric({
      namespace: 'AWS/ChimeVoiceConnector',
      metricName: 'Sip6xxCodes',
      period: Duration.seconds(60),
      statistic: Stats.SUM,
      region: props.alarmRegion,
      label: 'Sip6xxCodes',
    });

    this.sip6xxCodesAlarm = new Alarm(
      this,
      'sip6xxCodesAlarm' + props.alarmRegion,
      {
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        threshold: 5,
        alarmName: 'Sip6xxCodes_' + props.alarmRegion,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        metric: sip6xxCodesAlarm,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      },
    );

    this.sip6xxCodesAlarm.addAlarmAction(new SnsAction(props.topic));

    const inboundCallFailuresMetric = new Metric({
      metricName: 'InboundCallFailures',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.alarmRegion,
    });
    const inboundCallAttemptsMetric = new Metric({
      metricName: 'InboundCallAttempts',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.alarmRegion,
    });

    const inboundCallFailurePercentMetric = new MathExpression({
      expression: '(failures/attempts)*100',
      period: Duration.seconds(60),
      label: 'Inbound Call Failure %',
      usingMetrics: {
        attempts: inboundCallAttemptsMetric,
        failures: inboundCallFailuresMetric,
      },
    });

    this.inboundCallFailurePercentAlarm = new Alarm(
      this,
      'InboundCallFailureAlarm',
      {
        metric: inboundCallFailurePercentMetric,
        alarmName: 'InboundCalls_' + props.alarmRegion,
        threshold: 10,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      },
    );

    this.inboundCallFailurePercentAlarm.addAlarmAction(
      new SnsAction(props.topic),
    );

    const outboundCallFailuresMetric = new Metric({
      metricName: 'OutboundCallFailures',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.alarmRegion,
    });

    const outboundCallAttemptsMetric = new Metric({
      metricName: 'OutboundCallAttempts',
      namespace: 'AWS/ChimeVoiceConnector',
      region: props.alarmRegion,
    });

    const outboundCallFailurePercentMetric = new MathExpression({
      expression: '(failures/attempts)*100',
      label: 'Outbound Call Failure %',
      period: Duration.minutes(1),
      usingMetrics: {
        attempts: outboundCallAttemptsMetric,
        failures: outboundCallFailuresMetric,
      },
    });

    this.outboundCallFailurePercentAlarm = new Alarm(
      this,
      'OutboundCallFailureAlarm',
      {
        metric: outboundCallFailurePercentMetric,
        alarmName: 'OutboundCalls_' + props.alarmRegion,
        threshold: 10,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      },
    );

    this.outboundCallFailurePercentAlarm.addAlarmAction(
      new SnsAction(props.topic),
    );
  }
}
