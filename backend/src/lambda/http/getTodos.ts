import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserIdFromJwt } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('http')
import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();

const TODO_TABLE = process.env.TODO_TABLE
const INDEX_NAME = process.env.INDEX_NAME

/**
 * Returns TODO items, filtered for the current user
 * @param event 
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {

    logger.info('Getting TODOs')
    const userId = getUserIdFromJwt(event);

    // Filter for current user and use an INDEX for improved performance
    const params = {
      TableName: TODO_TABLE,
      IndexName: INDEX_NAME,
      FilterExpression: 'userId=:u',
      ExpressionAttributeValues: { ':u': userId }
    };

    logger.info(`scanning for user ${userId}`);
    const result = await docClient.scan(params).promise();

    // SUCCESS
    logger.info('✅ Scanned TODO');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ items: result.Items })
    }
  }
  catch (e) {
    // FAIL
    logger.error('❌ Unable to scan TODO', { e });
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: e.message
    }
  }
}
