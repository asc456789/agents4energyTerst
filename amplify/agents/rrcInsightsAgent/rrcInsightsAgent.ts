import { Stack } from 'aws-cdk-lib';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { Agent } from 'aws-cdk-lib/aws-bedrock-agent';

export function rrcInsightsAgentBuilder(stack: Stack, lambdaFunction: LambdaFunction): Agent {
  return new Agent(stack, 'RRCInsightsAgent', {
    agentName: 'RRCInsightsAgent',
    foundationModel: 'anthropic.claude-3-sonnet-20240229-v1:0',
    instruction: 'You are a helpful assistant that answers RRC permit questions using SQL.',
    actionGroups: [
      {
        actionGroupName: 'auroraQueryAgent',
        description: 'Executes natural language SQL queries on Aurora PostgreSQL',
        function: {
          lambda: lambdaFunction,
          functionName: 'freeform_query',
        },
        parameters: [
          {
            name: 'user_question', // ✅ This must match what Bedrock expects
            type: 'string',
            description: 'Natural language query to be translated to SQL',
          },
        ],
      },
    ],
  });
}
