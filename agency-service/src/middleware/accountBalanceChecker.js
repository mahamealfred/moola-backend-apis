import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Middleware to check if user account balance is >= 22500
 * Prevents form submission if balance is insufficient
 */
export const checkAccountBalance = async (req, res, next) => {
  try {
    // Get AQS credentials from environment variables
    const username = process.env.AQS_USERNAME;
    const password = process.env.AQS_PASS;

    if (!username || !password) {
      logger.error('Missing AQS credentials in environment variables');
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Unable to verify account balance.",
      });
    }

    // Get Cyclos URL from environment variables
    const cyclosUrl = process.env.CYCLOS_URL ;
    const accountStatusEndpoint = `${cyclosUrl}/rest/accounts/default/status`;

    // Call the account status endpoint with basic auth
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

    const accountResponse = await axios.get(
      accountStatusEndpoint,
      {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    // Check if balance is available and sufficient
    const balance = accountResponse.data?.availableBalance || 0;
    const minimumBalance = 500;

    logger.info('Account balance check', {
      balance,
      minimumBalance,
      sufficient: balance >= minimumBalance
    });

    if (balance < minimumBalance) {
      logger.warn('Insufficient account balance', {
        balance,
        minimumBalance,
        deficit: minimumBalance - balance
      });

      return res.status(400).json({
        success: false,
        message: `Insufficient account balance. You need at least ${minimumBalance} to proceed with this form submission.`,
        statusCode: 400,
        data: {
          currentBalance: balance,
          minimumRequired: minimumBalance,
          deficit: minimumBalance - balance
        }
      });
    }

    // Balance is sufficient, continue to next middleware
    next();

  } catch (error) {
    // Check if it's an authentication error
    if (error.response?.status === 401 || error.response?.data?.errorCode === 'INVALID_CREDENTIALS') {
      logger.error('Account authentication failed', {
        error: error.response?.data?.errorDetails || error.message
      });

      return res.status(401).json({
        success: false,
        message: "Account authentication failed. Unable to verify your account balance.",
        statusCode: 401
      });
    }

    logger.error('Error checking account balance', {
      error: error.message,
      status: error.response?.status,
      statusCode: error.code
    });

    // On other errors, allow the request to proceed (fail open)
    // You can change this to fail closed (return error) if preferred
    next();
  }
};
