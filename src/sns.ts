import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class SNSResources extends Construct {
  public alertTopic: Topic;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.alertTopic = new Topic(this, 'AlertTopic', {
      displayName: 'VoiceConnector Alerts',
      topicName: 'VoiceConnectorAlerts',
    });
  }
}
