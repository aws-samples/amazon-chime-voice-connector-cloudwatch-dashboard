import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { VoiceConnectorDashboard } from '../src/amazon-chime-voiceconnector-cloudwatch-dashboard';

const stackProps = {
  logLevel: process.env.LOG_LEVEL || 'INFO',
};

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

test('Snapshot', () => {
  const app = new App();
  const stack = new VoiceConnectorDashboard(app, 'test', {
    ...stackProps,
    env: devEnv,
  });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
