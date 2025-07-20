import { Agent } from 'aws-cdk-lib/aws-bedrock';
import { Stack } from 'aws-cdk-lib';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';

export function rrcInsightsAgentBuilder(stack: Stack, lambdaFunction: LambdaFunction) {
  return {
    rrcInsightsAgent: new Agent(stack, 'RRCInsightsAgent', {
      name: 'RRCInsightsAgent',
      description: 'Chat interface to query Texas RRC production data via Aurora PostgreSQL',
      actionGroups: [
        {
          actionGroupName: 'auroraQueryAgent',
          description: 'Executes natural language SQL queries over Aurora PostgreSQL',
          function: lambdaFunction,
          parameters: [
            {
              name: 'user_question',
              type: 'string',
              required: true
            }
          ]
        }
      ]
    })
  };
}
