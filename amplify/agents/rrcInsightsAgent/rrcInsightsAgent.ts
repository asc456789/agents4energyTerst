import { Stack } from 'aws-cdk-lib';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import * as cr from 'aws-cdk-lib/custom-resources';

interface RRCInsightsAgentProps {
  vpc: cdk.aws_ec2.Vpc;
  s3Deployment: cdk.aws_s3_deployment.BucketDeployment;
  s3Bucket: cdk.aws_s3.IBucket;
  lambdaFunction: LambdaFunction;
  knowledgeBaseId?: string; // Optional: for table definitions
}

export function rrcInsightsAgentBuilder(
  scope: Stack, 
  props: RRCInsightsAgentProps
) {
  
  const rootStack = cdk.Stack.of(scope).nestedStackParent || cdk.Stack.of(scope);
  
  // Create an IAM role for the Bedrock Agent
  const agentRole = new iam.Role(scope, 'RRCInsightsAgentRole', {
    assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
    inlinePolicies: {
      BedrockAgentPolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'bedrock:InvokeModel',
              'bedrock:InvokeModelWithResponseStream'
            ],
            resources: [
              `arn:aws:bedrock:\${rootStack.region}:\${rootStack.account}:inference-profile/*`,
              `arn:aws:bedrock:*::foundation-model/*`
            ]
          })
        ]
      })
    }
  });

  // Grant the agent permission to invoke the Lambda function
  props.lambdaFunction.grantInvoke(agentRole);

  // If knowledge base is provided, grant retrieve permissions
  if (props.knowledgeBaseId) {
    agentRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:Retrieve',
        'bedrock:RetrieveAndGenerate'
      ],
      resources: [
        `arn:aws:bedrock:\${rootStack.region}:\${rootStack.account}:knowledge-base/\${props.knowledgeBaseId}`
      ]
    }));
  }

  // Define the OpenAPI schema for the free-form query action
  const apiSchema = {
    openapi: '3.0.0',
    info: {
      title: 'RRC Database Query API',
      version: '1.0.0',
      description: 'API for executing free-form queries against RRC database'
    },
    paths: {
      '/execute-query': {
        post: {
          summary: 'Execute a free-form database query',
          description: 'Translates natural language queries to SQL and executes them against the RRC database',
          operationId: 'executeQuery',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['query'],
                  properties: {
                    query: {
                      type: 'string',
                      description: 'Natural language query about RRC permits, wells, operators, or production data',
                      examples: [
                        'What are the top 10 wells by production in district 1?',
