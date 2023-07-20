/* eslint-disable import/no-extraneous-dependencies */
import {
  ListVoiceConnectorsCommand,
  GetVoiceConnectorLoggingConfigurationCommand,
  ChimeSDKVoiceClient,
  VoiceConnector,
} from '@aws-sdk/client-chime-sdk-voice';
import {
  CloudWatchLogsClient,
  PutQueryDefinitionCommand,
  DeleteQueryDefinitionCommand,
  PutQueryDefinitionCommandOutput,
} from '@aws-sdk/client-cloudwatch-logs';
import {
  SSMClient,
  DeleteParameterCommand,
  GetParameterCommand,
  GetParameterCommandOutput,
  PutParameterCommand,
} from '@aws-sdk/client-ssm';
import {
  CdkCustomResourceEvent,
  CdkCustomResourceResponse,
  Context,
} from 'aws-lambda';

const cloudWatchClient = new CloudWatchLogsClient({
  region: process.env.AWS_REGION,
});
const amazonChimeSdkVoiceClient = new ChimeSDKVoiceClient({
  region: process.env.AWS_REGION,
});

const ssmClient = new SSMClient({ region: process.env.AWS_REGION });

const response: CdkCustomResourceResponse = {};

let queryDefinitionResponse: PutQueryDefinitionCommandOutput;
let queryDefinitionId: GetParameterCommandOutput;
let voiceConnectorsWithLogging: VoiceConnector[] = [];

export const handler = async (
  event: CdkCustomResourceEvent,
  context: Context,
): Promise<CdkCustomResourceResponse> => {
  console.info('Event Received', event);
  const requestType = event.RequestType;
  const resourceProperties = event.ResourceProperties;

  response.StackId = event.StackId;
  response.RequestId = event.RequestId;
  response.LogicalResourceId = event.LogicalResourceId;
  response.PhysicalResourceId = context.logGroupName;

  switch (requestType) {
    case 'Create':
      console.log('Getting Voice Connectors');
      const voiceConnectors = await listVoiceConnectors();
      if (voiceConnectors) {
        console.info('Creating Query Definition');
        await createQueryDefinition(
          resourceProperties.Query,
          resourceProperties.Name,
          voiceConnectors,
        );
      }
      break;
    case 'Update':
      console.log('Nothing to do on Update');
      break;
    case 'Delete':
      console.log('Deleting Query Definition');
      await deleteQueryDefinition(resourceProperties.Name);
      break;
  }

  console.log(`Response: ${JSON.stringify(response)}`);
  return response;
};

async function createQueryDefinition(
  query: string,
  name: string,
  voiceConnectors: VoiceConnector[],
): Promise<void> {
  const logGroupNames = voiceConnectors.map(
    (vc) => '/aws/ChimeVoiceConnectorSipMessages/' + vc.VoiceConnectorId,
  );

  try {
    queryDefinitionResponse = await cloudWatchClient.send(
      new PutQueryDefinitionCommand({
        queryString: query,
        name: name,
        logGroupNames: logGroupNames,
      }),
    );
  } catch (e) {
    console.log(e);
    throw new Error('Error creating query definition');
  }

  try {
    await ssmClient.send(
      new PutParameterCommand({
        Name: '/amazonChimeSdk/LogInsights/' + sanitizeSSMParameterName(name),
        Value: queryDefinitionResponse.queryDefinitionId,
        Description: 'Amazon Chime SDK Voice Query Definition - ' + name,
        Overwrite: true,
        Type: 'String',
      }),
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      throw error;
    }
  }
}

async function deleteQueryDefinition(name: string): Promise<void> {
  try {
    queryDefinitionId = await ssmClient.send(
      new GetParameterCommand({
        Name: '/amazonChimeSdk/LogInsights/' + sanitizeSSMParameterName(name),
      }),
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      throw error;
    }
    return;
  }

  await cloudWatchClient.send(
    new DeleteQueryDefinitionCommand({
      queryDefinitionId: queryDefinitionId.Parameter!.Value,
    }),
  );

  await ssmClient.send(
    new DeleteParameterCommand({
      Name: '/amazonChimeSdk/LogInsights/' + sanitizeSSMParameterName(name),
    }),
  );
}

async function listVoiceConnectors(): Promise<VoiceConnector[] | undefined> {
  try {
    const voiceConnectors = await amazonChimeSdkVoiceClient.send(
      new ListVoiceConnectorsCommand({}),
    );
    console.log(JSON.stringify(voiceConnectors));
    for (const voiceConnector of voiceConnectors.VoiceConnectors!) {
      const voiceConnectorLoggingResponse =
        await amazonChimeSdkVoiceClient.send(
          new GetVoiceConnectorLoggingConfigurationCommand({
            VoiceConnectorId: voiceConnector.VoiceConnectorId!,
          }),
        );
      console.log(JSON.stringify(voiceConnectorLoggingResponse));
      console.log(JSON.stringify(voiceConnectorsWithLogging));
      if (voiceConnectorLoggingResponse.LoggingConfiguration) {
        if (voiceConnectorLoggingResponse.LoggingConfiguration.EnableSIPLogs) {
          voiceConnectorsWithLogging.push(voiceConnector);
        }
      }
    }
  } catch (e) {
    console.log(e);
    throw new Error('Error listing voice connectors');
  }

  return voiceConnectorsWithLogging;
}

function sanitizeSSMParameterName(name: string): string {
  // Remove any leading/trailing whitespace
  let sanitizedName = name.trim();

  // Remove invalid characters and replace them with empty strings
  sanitizedName = sanitizedName.replace(/[^a-zA-Z0-9.\-_]/g, '');

  return sanitizedName;
}
