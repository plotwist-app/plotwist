// @ts-nocheck

import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as docker_build from '@pulumi/docker-build'
import * as pulumi from '@pulumi/pulumi'

const zone = aws.route53.getZone({
  name: 'plotwist.app',
})

const cert = new aws.acm.Certificate('aws-acm-certificate', {
  domainName: 'backend.plotwist.app',
  validationMethod: 'DNS',
})

const validationRecord = new aws.route53.Record('aws-domain-record', {
  zoneId: zone.then(zone => zone.zoneId),
  name: cert.domainValidationOptions[0].resourceRecordName,
  type: cert.domainValidationOptions[0].resourceRecordType,
  records: [cert.domainValidationOptions[0].resourceRecordValue],
  ttl: 60,
})

const validatedCert = new aws.acm.CertificateValidation('aws-acm-validation', {
  certificateArn: cert.arn,
  validationRecordFqdns: [validationRecord.fqdn],
})

const repository = new awsx.ecr.Repository('aws-host-repository', {
  forceDelete: true,
})

const authToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: repository.repository.registryId,
})

const image = new docker_build.Image('aws-host-image', {
  tags: [pulumi.interpolate`${repository.repository.repositoryUrl}:latest`],
  context: {
    location: '../',
  },
  cacheFrom: [],
  cacheTo: [],
  platforms: ['linux/amd64'],
  push: true,
  registries: [
    {
      address: repository.repository.repositoryUrl,
      password: authToken.password,
      username: authToken.userName,
    },
  ],
})

const cluster = new awsx.classic.ecs.Cluster('aws-host-cluster')

const loadBalancer = new awsx.classic.lb.ApplicationLoadBalancer(
  'aws-host-lb',
  {
    securityGroups: cluster.securityGroups,
  }
)

new aws.route53.Record('app-alias', {
  zoneId: zone.then(zone => zone.zoneId),
  name: 'backend',
  type: 'A',
  aliases: [
    {
      name: loadBalancer.loadBalancer.dnsName,
      zoneId: loadBalancer.loadBalancer.zoneId,
      evaluateTargetHealth: true,
    },
  ],
})

const targetGroup = loadBalancer.createTargetGroup('aws-host-target-group', {
  port: 3000,
  protocol: 'HTTP',
  healthCheck: {
    path: '/health',
    protocol: 'HTTP',
    interval: 10,
    healthyThreshold: 3,
    unhealthyThreshold: 3,
    timeout: 5,
  },
})

const httpListener = loadBalancer.createListener('aws-host-http-listener', {
  port: 443,
  targetGroup,
  protocol: 'HTTPS',
  sslPolicy: 'ELBSecurityPolicy-2016-08',
  certificateArn: validatedCert.certificateArn,
})

const executionRole = new aws.iam.Role('aws-execution-role', {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'ecs-tasks.amazonaws.com',
  }),
  managedPolicyArns: [
    'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
  ],
  inlinePolicies: [
    {
      name: 'inline',
      policy: aws.iam.getPolicyDocumentOutput({
        statements: [
          {
            sid: 'ReadSsmAndSecrets',
            actions: [
              'ssm:GetParameters',
              'ssm:GetParameter',
              'ssm:GetParameterHistory',
            ],
            resources: [
              'arn:aws:ssm:us-east-1:972523082673:parameter/plotwist/prod/*',
            ],
          },
        ],
      }).json,
    },
  ],
})

const app = new awsx.classic.ecs.FargateService('aws-host-app', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  enableExecuteCommand: true,
  taskDefinitionArgs: {
    executionRole,
    container: {
      image: image.ref,
      cpu: 256,
      memory: 512,
      portMappings: [httpListener],
      secrets: [
        { name: 'APP_ENV', valueFrom: '/plotwist/prod/APP_ENV' },
        { name: 'BASE_URL', valueFrom: '/plotwist/prod/BASE_URL' },
        { name: 'CLIENT_URL', valueFrom: '/plotwist/prod/CLIENT_URL' },
        { name: 'DATABASE_URL', valueFrom: '/plotwist/prod/DATABASE_URL' },
        { name: 'JWT_SECRET', valueFrom: '/plotwist/prod/JWT_SECRET' },
        { name: 'PORT', valueFrom: '/plotwist/prod/PORT' },
        { name: 'REDIS_URL', valueFrom: '/plotwist/prod/REDIS_URL' },
        { name: 'RESEND_API_KEY', valueFrom: '/plotwist/prod/RESEND_API_KEY' },
        {
          name: 'STRIPE_PUBLISHABLE_KEY',
          valueFrom: '/plotwist/prod/STRIPE_PUBLISHABLE_KEY',
        },
        {
          name: 'STRIPE_SECRET_KEY',
          valueFrom: '/plotwist/prod/STRIPE_SECRET_KEY',
        },
        {
          name: 'TMDB_ACCESS_TOKEN',
          valueFrom: '/plotwist/prod/TMDB_ACCESS_TOKEN',
        },
        {
          name: 'CLOUDFLARE_BUCKET',
          valueFrom: '/plotwist/prod/CLOUDFLARE_BUCKET',
        },
        {
          name: 'CLOUDFLARE_ACCESS_KEY_ID',
          valueFrom: '/plotwist/prod/CLOUDFLARE_ACCESS_KEY_ID',
        },
        {
          name: 'CLOUDFLARE_SECRET_ACCESS_KEY',
          valueFrom: '/plotwist/prod/CLOUDFLARE_SECRET_ACCESS_KEY',
        },
        {
          name: 'CLOUDFLARE_ACCOUNT_ID',
          valueFrom: '/plotwist/prod/CLOUDFLARE_ACCOUNT_ID',
        },
        {
          name: 'CLOUDFLARE_PUBLIC_URL',
          valueFrom: '/plotwist/prod/CLOUDFLARE_PUBLIC_URL',
        },
        { name: 'AWS_REGION', valueFrom: '/plotwist/prod/AWS_REGION' },
        {
          name: 'AWS_ACCESS_KEY_ID',
          valueFrom: '/plotwist/prod/AWS_ACCESS_KEY_ID',
        },
        {
          name: 'AWS_SECRET_ACCESS_KEY',
          valueFrom: '/plotwist/prod/AWS_SECRET_ACCESS_KEY',
        },
        {
          name: 'IMPORT_MOVIES_QUEUE',
          valueFrom: '/plotwist/prod/IMPORT_MOVIES_QUEUE',
        },
        {
          name: 'IMPORT_SERIES_QUEUE',
          valueFrom: '/plotwist/prod/IMPORT_SERIES_QUEUE',
        },
        {
          name: 'ENABLE_CERTS',
          valueFrom: '/plotwist/prod/ENABLE_CERTS',
        },
        {
          name: 'ENABLE_SQS',
          valueFrom: '/plotwist/prod/ENABLE_SQS',
        },
        {
          name: 'ENABLE_IMPORT_MOVIES',
          valueFrom: '/plotwist/prod/ENABLE_IMPORT_MOVIES',
        },
        {
          name: 'ENABLE_IMPORT_SERIES',
          valueFrom: '/plotwist/prod/ENABLE_IMPORT_SERIES',
        },
        {
          name: 'OPENAI_API_KEY',
          valueFrom: '/plotwist/prod/OPENAI_API_KEY',
        },
        {
          name: 'MAL_CLIENT_ID',
          valueFrom: '/plotwist/prod/MAL_CLIENT_ID',
        },
        {
          name: 'MAL_CLIENT_SECRET',
          valueFrom: '/plotwist/prod/MAL_CLIENT_SECRET',
        },
        {
          name: 'ENABLE_CRON_JOBS',
          valueFrom: '/plotwist/prod/ENABLE_CRON_JOBS',
        },
      ],
    },
  },
})

const scalingTarget = new aws.appautoscaling.Target(
  'aws-host-autoscaling-target',
  {
    minCapacity: 1,
    maxCapacity: 5,
    serviceNamespace: 'ecs',
    scalableDimension: 'ecs:service:DesiredCount',
    resourceId: pulumi.interpolate`service/${cluster.cluster.name}/${app.service.name}`,
  }
)

new aws.appautoscaling.Policy('aws-host-autoscaling-policy-cpu', {
  serviceNamespace: scalingTarget.serviceNamespace,
  scalableDimension: scalingTarget.scalableDimension,
  resourceId: scalingTarget.resourceId,
  policyType: 'TargetTrackingScaling',
  targetTrackingScalingPolicyConfiguration: {
    predefinedMetricSpecification: {
      predefinedMetricType: 'ECSServiceAverageCPUUtilization',
    },
    targetValue: 50,
  },
})

export const url = httpListener.endpoint.hostname
