import axios from 'axios';
import logger from '../utils/logger.js';
import { insertLogs, updateLogs } from '../utils/logsData.js';
import { generateUniqueId } from '../utils/helper.js';
import dotenv from 'dotenv';

dotenv.config();

const CYCLOS_URL = process.env.CYCLOS_URL ;
const COMMISSION_API_URL = `${CYCLOS_URL}/rest/payments/confirmMemberPayment`;
const COMMISSION_AMOUNT = '500';
const TRANSFER_TYPE_ID = '178';
const CURRENCY_SYMBOL = 'Rwf';
const COMMISSION_DESCRIPTION = 'AQS Commission Payment to Agent';
const SERVICE_NAME = 'Commission';

/**
 * Generate agent commission payment after successful form submission
 * @param {string} agentId - The agent ID (toMemberId for the payment)
 * @param {string} agentName - The agent name for logging
 * @returns {Promise<Object>} - Commission payment response
 */
export const generateAgentCommission = async (agentId, agentName = 'Unknown') => {
  let transactionId = null;
  
  try {
    if (!agentId) {
      logger.warn('Missing agent ID for commission generation');
      return {
        success: false,
        message: 'Agent ID is required for commission generation',
        error: 'MISSING_AGENT_ID'
      };
    }

    // Generate unique transaction ID
    transactionId = generateUniqueId();

    // Get AQS credentials from environment variables
    const username = process.env.AQS_USERNAME;
    const password = process.env.AQS_PASS;

    if (!username || !password) {
      logger.error('Missing AQS credentials in environment variables');
      
      // Log failed transaction
      await insertLogs(
        transactionId,
        'failed',
        'Missing AQS credentials in environment variables',
        COMMISSION_AMOUNT,
        0,
        agentId,
        agentName,
        'failed',
        SERVICE_NAME,
        null,
        agentId,
        null
      );

      return {
        success: false,
        message: 'Server configuration error. Unable to process commission.',
        error: 'MISSING_CREDENTIALS',
        transactionId
      };
    }

    // Insert initial log entry with 'pending' status
    await insertLogs(
      transactionId,
      'pending',
      `${COMMISSION_DESCRIPTION} - Initiating payment`,
      COMMISSION_AMOUNT,
      0,
      agentId,
      agentName,
      'pending',
      SERVICE_NAME,
      null,
      agentId,
      null
    );

    // Prepare basic authentication
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

    // Prepare commission payment payload
    const payload = {
      toMemberId: agentId,
      amount: COMMISSION_AMOUNT,
      transferTypeId: TRANSFER_TYPE_ID,
      currencySymbol: CURRENCY_SYMBOL,
      description: COMMISSION_DESCRIPTION
    };

    logger.info('Generating agent commission', {
      transactionId,
      agentId,
      amount: COMMISSION_AMOUNT,
      transferTypeId: TRANSFER_TYPE_ID
    });

    // Call the commission payment endpoint
    const response = await axios.post(
      COMMISSION_API_URL,
      payload,
      {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    // Check for successful response
    if (response.data?.id && response.data?.pending !== undefined) {
      logger.info('Agent commission generated successfully', {
        transactionId,
        agentId,
        commissionId: response.data.id,
        pending: response.data.pending
      });

      // Update log entry with success status
      await updateLogs(
        transactionId,
        'successful',
        'successful',
        response.data.id.toString(),
        `Commission payment successful - Commission ID: ${response.data.id}`
      );

      return {
        success: true,
        message: 'Commission generated successfully',
        data: {
          id: response.data.id,
          pending: response.data.pending
        },
        transactionId
      };
    }

    logger.warn('Unexpected commission response format', {
      transactionId,
      agentId,
      response: response.data
    });

    // Update log entry with success (partial)
    await updateLogs(
      transactionId,
      'success',
      'success',
      JSON.stringify(response.data),
      'Commission payment processed with unexpected response format'
    );

    return {
      success: true,
      message: 'Commission generated successfully',
      data: response.data,
      transactionId
    };

  } catch (error) {
    logger.error('Error generating agent commission', {
      transactionId,
      agentId,
      error: error.message,
      status: error.response?.status,
      statusCode: error.code
    });

    let errorDescription = error.message;
    let thirdPartyStatus = 'failed';

    // Check if it's an authentication error
    if (error.response?.status === 401 || error.response?.data?.errorCode === 'INVALID_CREDENTIALS') {
      logger.error('Commission generation - Authentication failed', {
        transactionId,
        agentId,
        error: error.response?.data?.errorDetails || error.message
      });

      errorDescription = `Authentication failed: ${error.response?.data?.errorDetails || error.message}`;
      thirdPartyStatus = 'auth_failed';
    }

    // Update log entry with failure status
    if (transactionId) {
      await updateLogs(
        transactionId,
        'failed',
        thirdPartyStatus,
        null,
        errorDescription
      );
    }

    return {
      success: false,
      message: 'Failed to generate commission',
      error: error.message,
      details: error.response?.data,
      transactionId
    };
  }
};
