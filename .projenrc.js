const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.86.0',
  license: 'MIT-0',
  author: 'Court Schuett',
  copyrightOwner: 'Amazon.com, Inc.',
  authorAddress: 'https://aws.amazon.com',
  defaultReleaseBranch: 'main',
  workflowNodeVersion: '16.x',
  appEntrypoint: 'amazon-chime-voiceconnector-cloudwatch-dashboard.ts',
  name: 'amazon-chime-voiceconnector-cloudwatch-dashboard',
  deps: [
    'dotenv',
    '@aws-sdk/client-cloudwatch-logs',
    '@aws-sdk/client-chime-sdk-voice',
    '@aws-sdk/client-ssm',
    'aws-lambda',
    '@types/aws-lambda',
    'esbuild',
  ],
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['schuettc'],
  },
  autoApproveUpgrades: true,
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  defaultReleaseBranch: 'main',
});

const common_exclude = [
  'cdk.out',
  'cdk.context.json',
  'yarn-error.log',
  'dependabot.yml',
  '.DS_Store',
];

project.addTask('launch', {
  exec: 'yarn && yarn projen && yarn build && yarn cdk bootstrap && yarn cdk deploy --all --require-approval never',
});

project.addTask('delete', {
  exec: 'yarn cdk destroy --all ',
});

project.gitignore.exclude(...common_exclude);
project.synth();
