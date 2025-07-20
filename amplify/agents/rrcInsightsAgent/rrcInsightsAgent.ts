import { Agent } from 'aws-cdk-lib/aws-bedrock';
import { Stack } from 'aws-cdk-lib';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';

export function rrcInsightsAgentBuilder(stack: Stack, lambdaFunction: LambdaFunction) {
  const rrcInsightsAgent = new Agent(stack, 'RRCInsightsAgent', {
    agentName: 'RRCInsightsAgent',
    foundationModel: 'anthropic.claude-3-sonnet-20240229-v1:0',
    instruction: 'You are a helpful assistant that answers RRC permit questions using SQL.',
    actionGroups: [
      {
        actionGroupName: 'auroraQueryAgent',
        description: 'Executes natural language SQL queries on Aurora PostgreSQL',
        function: {
          lambda: lambdaFunction, // ✅ This must be a LambdaFunction object
          functionName: 'freeform_query' // ✅ Name that Bedrock Agent will call
        },
        parameters: [
          {
            name: 'user_question',
            type: 'string',
            required: true
          }
        ]
      }
    ]
  });

  return rrcInsightsAgent;
}
