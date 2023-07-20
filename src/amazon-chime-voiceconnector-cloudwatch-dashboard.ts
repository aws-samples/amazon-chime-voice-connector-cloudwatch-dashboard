import { App, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Dashboard, Row } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { config } from 'dotenv';
import {
  OutboundCall,
  InboundCall,
  RoundTripTime,
  PacketLoss,
  MeanOpinionScore,
  Jitter,
  Alarms,
  LogQuery,
  SNSResources,
} from '.';

config();

const appRegions = ['us-east-1', 'us-west-2'];

export interface VoiceConnectorDashboardProps extends StackProps {
  logLevel: string;
}

export class VoiceConnectorDashboard extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: VoiceConnectorDashboardProps,
  ) {
    super(scope, id, props);

    const dashboard = new Dashboard(this, 'VoiceConnectorDashboard', {
      dashboardName: 'VoiceConnector',
      defaultInterval: Duration.minutes(60),
    });

    dashboard.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const width: number = 24 / appRegions.length;
    const outboundCallRow = new Row();
    appRegions.forEach((deployRegion) => {
      new OutboundCall(this, 'outboundCallsRow_' + deployRegion, {
        metricRegion: deployRegion,
        dashboard: dashboard,
        row: outboundCallRow,
        width: width,
      });
    });

    const inboundCallRow = new Row();
    appRegions.forEach((deployRegion) => {
      new InboundCall(this, 'inboundCallRow_' + deployRegion, {
        metricRegion: deployRegion,
        dashboard: dashboard,
        row: inboundCallRow,
        width: width,
      });
    });

    const roundTripTimeRow = new Row();
    appRegions.forEach((deployRegion) => {
      new RoundTripTime(this, 'roundTripTimeRow_' + deployRegion, {
        metricRegion: deployRegion,
        dashboard: dashboard,
        row: roundTripTimeRow,
        width: width,
      });
    });

    const packetLossRow = new Row();
    appRegions.forEach((deployRegion) => {
      new PacketLoss(this, 'packetLossRow_' + deployRegion, {
        metricRegion: deployRegion,
        dashboard: dashboard,
        row: packetLossRow,
        width: width,
      });
    });

    const meanOpinionScoreRow = new Row();
    appRegions.forEach((deployRegion) => {
      new MeanOpinionScore(this, 'meanOpinionScoreRow_' + deployRegion, {
        metricRegion: deployRegion,
        dashboard: dashboard,
        row: meanOpinionScoreRow,
        width: width,
      });
    });

    const jitterRow = new Row();
    appRegions.forEach((deployRegion) => {
      new Jitter(this, 'jitterRow_' + deployRegion, {
        metricRegion: deployRegion,
        dashboard: dashboard,
        row: jitterRow,
        width: width,
      });
    });

    // const generalLogQueryRow = new Row();
    // appRegions.forEach((deployRegion) => {
    //   new GeneralLogQuery(this, 'generalLogQueryRow_' + deployRegion, {
    //     metricRegion: deployRegion,
    //     dashboard: dashboard,
    //     row: generalLogQueryRow,
    //     width: width,
    //   });
    // });

    // const sipErrorLogQueryRow = new Row();
    // appRegions.forEach((deployRegion) => {
    //   new SipErrorLogQuery(this, 'sipErrorLogQueryRow_' + deployRegion, {
    //     metricRegion: deployRegion,
    //     dashboard: dashboard,
    //     row: sipErrorLogQueryRow,
    //     width: width,
    //   });
    // });

    dashboard.addWidgets(
      outboundCallRow,
      inboundCallRow,
      // generalLogQueryRow,
      // sipErrorLogQueryRow,
      meanOpinionScoreRow,
      roundTripTimeRow,
      packetLossRow,
      jitterRow,
    );
  }
}

export interface VoiceConnectorAlarmsProps extends StackProps {
  logLevel: string;
  deployRegion: string;
}

export class VoiceConnectorAlarms extends Stack {
  constructor(scope: Construct, id: string, props: VoiceConnectorAlarmsProps) {
    super(scope, id, props);
    const topic = new SNSResources(this, 'SNSResources-' + props.deployRegion);

    new Alarms(this, 'alarms', {
      alarmRegion: props.deployRegion,
      topic: topic.alertTopic,
    });

    new LogQuery(this, 'logQuery');
  }
}

const app = new App();

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
};

appRegions.forEach((deployRegion) => {
  new VoiceConnectorAlarms(app, 'VoiceConnectorAlarms-' + deployRegion, {
    logLevel: process.env.LOG_LEVEL || 'INFO',
    deployRegion: deployRegion,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: deployRegion,
    },
  });
});

const voiceConnectorDashboardStackProps = {
  logLevel: process.env.LOG_LEVEL || 'INFO',
};

new VoiceConnectorDashboard(app, 'VoiceConnectorDashboard', {
  ...voiceConnectorDashboardStackProps,
  env: devEnv,
});

app.synth();
