import sequelize from '../db/config.js';
import logger from '../utils/logger.js';
import { createErrorResponse } from '@moola/shared';
import { decodeToken } from '../utils/helper.js';

/**
 * Middleware to check form submission limits per agent
 * Prevents agents from submitting more than 5 forms with the same formId
 */
export const checkFormSubmissionLimit = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const language = req.language || 'en';

    // Extract agent ID from token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Missing authorization token. Please log in again.",
      });
    }

    // Decode token to get agent ID
    let decodedToken = decodeToken(token);

    if (!decodedToken) {
      logger.warn('Invalid or malformed token');
      return res.status(401).json({
        success: false,
        message: "Invalid or malformed token. Please log in again.",
      });
    }

    const agentId = decodedToken.id;

    if (!agentId) {
      logger.warn('Unable to extract agent ID from token');
      return res.status(401).json({
        success: false,
        message: "Unable to identify your account. Please log in again.",
      });
    }

    // Check submission count for this formId and agentId combination where thirdPartyStatus is 'submitted'
    const countQuery = `
      SELECT COUNT(*) as submissionCount 
      FROM aqs_data_collection 
      WHERE formId = ? AND agentId = ? AND thirdPartyStatus = 'submitted'
    `;

    const results = await sequelize.query(countQuery, {
      replacements: [formId, agentId],
      type: sequelize.QueryTypes.SELECT
    });

    const submissionCount = results[0]?.submissionCount || 0;

    logger.info('Form submission limit check', {
      formId,
      agentId,
      currentSubmissions: submissionCount,
      limit: 5
    });

    // Check if limit exceeded
    if (submissionCount >= 10) {
      logger.warn('Form submission limit exceeded', {
        formId,
        agentId,
        currentSubmissions: submissionCount
      });

      return res.status(429).json({
        success: false,
        message: "You have reached your submission limit for this form. You can submit a maximum of 5 forms. Please contact support for assistance.",
        statusCode: 429,
        data: {
          limit: 5,
          currentSubmissions: submissionCount,
          formId
        }
      });
    }

    // Limit not exceeded, continue to next middleware
    next();

  } catch (error) {
    logger.error('Error checking form submission limit', {
      error: error.message,
      stack: error.stack
    });

    // On error, allow the request to proceed (fail open)
    next();
  }
};

export default checkFormSubmissionLimit;
