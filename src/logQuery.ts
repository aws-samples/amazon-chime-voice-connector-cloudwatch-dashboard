import { CustomResource, Duration } from 'aws-cdk-lib';
import {
  Role,
  ServicePrincipal,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export class LogQuery extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const logQueryCustomResourceRole = new Role(this, 'logQueryLambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole',
        ),
      ],
      inlinePolicies: {
        ['cloudWatchPolicy']: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: ['*'],
              actions: [
                'logs:PutQueryDefinition',
                'logs:DeleteQueryDefinition',
                'ssm:GetParameter',
                'ssm:PutParameter',
                'ssm:DeleteParameter',
                'chime:ListVoiceConnectors',
                'chime:GetVoiceConnectorLoggingConfiguration',
              ],
            }),
          ],
        }),
      },
    });

    const logQueryCustomResource = new NodejsFunction(
      this,
      'logQueryCustomResource',
      {
        handler: 'index.handler',
        entry: 'src/resources/logQuery/index.ts',
        bundling: {
          nodeModules: ['@aws-sdk/client-chime-sdk-voice'],
        },
        architecture: Architecture.ARM_64,
        timeout: Duration.minutes(1),
        runtime: Runtime.NODEJS_18_X,
        role: logQueryCustomResourceRole,
      },
    );

    const logQueryCustomResourceProvider = new Provider(
      this,
      'logQueryCustomResourceProvider',
      {
        onEventHandler: logQueryCustomResource,
        logRetention: RetentionDays.ONE_WEEK,
      },
    );

    const generalLogQuery =
      "fields @timestamp, call_id, sip_message, @logStream\n| parse sip_message '*\\n' as sip \n| display @timestamp, sip, @logStream\n| sort @timestamp desc\n| limit 50";

    new CustomResource(this, 'logQueryCustomResourceSIPMessages', {
      serviceToken: logQueryCustomResourceProvider.serviceToken,
      properties: {
        Query: generalLogQuery,
        Name: 'Voice Connector SIP Messages',
      },
    });

    const sipErrorCodesLogQuery =
      "fields @timestamp, call_id, sip_message, @logStream\n| parse sip_message '*\\n' as sip \n| filter sip like /(SIP\\/2.0 5|SIP\\/2.0 4|SIP\\/2.0 6)/\n|display @timestamp, sip, @logStream\n| sort @timestamp desc\n| limit 50";

    new CustomResource(this, 'logQueryCustomResourceSIPErrors', {
      serviceToken: logQueryCustomResourceProvider.serviceToken,
      properties: {
        Query: sipErrorCodesLogQuery,
        Name: 'Voice Connector SIP Errors',
      },
    });
  }
}
