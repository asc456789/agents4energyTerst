import { BedrockAgentDefinition } from '../../custom/types';

export const rrcInsightsAgent: BedrockAgentDefinition = {
  name: 'RRCInsightsAgent',
  description: 'Chat interface to query Texas RRC production data via Aurora PostgreSQL',
  knowledgeBases: [], // optional if you're only using a Lambda action
  actionGroups: [
    {
      actionGroupName: 'auroraQueryAgent',
      description: 'Executes natural language SQL queries over Aurora PostgreSQL',
      lambdaArn: 'arn:aws:lambda:us-east-1:<your-account-id>:function:auroraQueryAgent',
      function: 'freeform_query',
      parameters: [
        {
          name: 'user_question',
          type: 'string',
          required: true
        }
      ]
    }
  ]
};

