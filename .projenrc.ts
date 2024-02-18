const { awscdk } = require('projen');
const { JobPermission } = require('projen/lib/github/workflows-model');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.126.0',
  license: 'MIT-0',
  author: 'Court Schuett',
  copyrightOwner: 'Amazon.com, Inc.',
  authorAddress: 'https://aws.amazon.com',
  defaultReleaseBranch: 'main',
  workflowNodeVersion: '18.x',
  projenrcTs: true,
  jest: false,
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
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['schuettc'],
  },
  autoApproveUpgrades: true,
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
});

const common_exclude = [
  'docker-compose.yaml',
  'cdk.out',
  'yarn-error.log',
  'dependabot.yml',
  '.DS_Store',
  '**/dist/**',
  '.env',
];

project.tsconfigDev.file.addOverride('include', [
  'src/**/*.ts',
  './.projenrc.ts',
]);

project.eslint.addOverride({
  files: ['src/resources/**/*.ts'],
  rules: {
    'indent': 'off',
    '@typescript-eslint/indent': 'off',
  },
});

project.eslint.addOverride({
  files: ['src/resources/**/*.ts'],
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
});

project.addTask('launch', {
  exec: 'yarn && yarn projen && yarn build && yarn cdk bootstrap && yarn cdk deploy --all --require-approval never',
});

project.addTask('delete', {
  exec: 'yarn cdk destroy --all ',
});

project.gitignore.exclude(...common_exclude);
project.synth();
