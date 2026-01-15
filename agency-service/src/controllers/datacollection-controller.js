import axios from 'axios';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
import { createResponse, createErrorResponse } from '@moola/shared';
import jwt from 'jsonwebtoken';
import { decodeToken } from '../utils/helper.js';
import sequelize from '../db/config.js';
import { generateAgentCommission } from '../services/agentCommissionService.js';
import { insertLogs, updateLogs, updateTransfersTable } from '../utils/logsData.js';
dotenv.config();

const API_KEY = process.env.DATA_COLLECTION_API_KEY || 'ak_686b17e73ff609c38ade4afa536764032e04695cbc5fec3c14b23af15ee1b403';
const BASE_URL = process.env.DATA_COLLECTION_BASE_URL || 'https://afriqollect.com/api';

/**
 * Get External Forms Endpoint
 * GET /external/forms
 * Retrieves available forms from external data collection service
 * Supports language parameter for localized responses
 */
export const getExternalForms = async (req, res) => {
  try {
    const language = req.language || 'en'; // Language from middleware
    
    logger.info('Fetching external forms', {
      language,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Call external forms API
    const response = await axios.get(
      `${BASE_URL}/external/forms`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'Accept-Language': language,
          'User-Agent': 'Moola-DataCollection-Service/1.0'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Format response with language support
    logger.info('Forms retrieved successfully', {
      language,
      formsCount: response.data?.forms?.length || 0
    });

    return res.status(200).json(createResponse(
      true,
      'data_collection.forms_retrieved_successfully',
      response.data,
      language
    ));

  } catch (error) {
    logger.error('Error fetching external forms', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      return res.status(401).json(
        createErrorResponse(
          'data_collection.authentication_failed',
          req.language || 'en',
          401
        )
      );
    }

    if (error.response?.status === 404) {
      return res.status(404).json(
        createErrorResponse(
          'data_collection.forms_not_found',
          req.language || 'en',
          404
        )
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json(
        createErrorResponse(
          'data_collection.service_unavailable',
          req.language || 'en',
          503
        )
      );
    }

    return res.status(500).json(
      createErrorResponse(
        'common.server_error',
        req.language || 'en',
        500,
        {
          error: error.message,
          requestId: req.id
        }
      )
    );
  }
};

/**
 * Submit Form Data Endpoint
 * POST /external/forms/:formId/submit
 * Submits form data to external data collection service
 * Handles form data with file uploads
 */
export const submitFormData = async (req, res) => {
  let dbRecord = null;
  let logTransactionId = null; // Track log transaction ID for updates
  
  try {
    const language = req.language || 'en';
    const { formId } = req.params;
    const { data, status } = req.body;
       
    const username = process.env.AQS_USERNAME;
    const password = process.env.AQS_USERPASS
    const agencyBankingUserAuth = Buffer.from(`${username}:${password}`).toString('base64');
    
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const bearerToken = token;
    
    if (!token) {
        logger.warn("Missing authorization token");
        return res.status(401).json({
            success: false,
            message: "Missing authorization token. Please log in again.",
        });
    }
    
    let decodedToken = decodeToken(token);
    
    if (!decodedToken) {
        logger.warn("Invalid or malformed token");
        return res.status(401).json({
            success: false,
            message: "Invalid or malformed token. Please log in again.",
        });
    }
    
    const agentCategory = decodedToken.agentCategory;
    let agent_name = decodedToken.name || "UnknownAgent";
    let userAuth = decodedToken.userAuth || null;
    let agent_id = decodedToken.id || 0;
    const customerId = decodedToken.id;

    logger.info('Submitting form data', {
      formId,
      language,
      ip: req.ip,
      customerId,
      agentId: agent_id
    });

    // Validate required fields
    if (!formId) {
      return res.status(400).json(
        createErrorResponse(
          'validation.missing_form_id',
          language,
          400,
          { missingFields: ['formId'] }
        )
      );
    }

    if (!data) {
      return res.status(400).json(
        createErrorResponse(
          'validation.missing_form_fields',
          language,
          400,
          { missingFields: ['data'] }
        )
      );
    }

    // Insert initial log entry with pending status (ONCE)
    try {
      const initialDescription = `AQS Form Submission - Form ID: ${formId}, Agent: ${agent_name}`;
      
      await insertLogs(
        null, // Transaction ID will be updated when commission is generated
        'pending',
        initialDescription,
        0, // amount
        0, // customer_charge
        agent_id,
        agent_name,
        'pending', // initial status
        'AQS', // service_name
        formId, // transaction_reference (form ID initially)
        customerId,
        null // token
      );
      
      logger.info('Initial AQS form submission log created', {
        formId,
        agentId: agent_id
      });
    } catch (logError) {
      logger.error('Error creating initial log', {
        error: logError.message,
        formId
      });
      // Continue even if initial log fails
    }

    // Save initial submission record to database with 'submitted' status
    try {
      const insertQuery = `
        INSERT INTO aqs_data_collection 
        (formId, customerId, agentId, formData, status, submittedAt, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())
      `;
      
      const result = await sequelize.query(insertQuery, {
        replacements: [
          formId,
          customerId,
          agent_id,
          JSON.stringify(data),
          'submitted'
        ],
        type: sequelize.QueryTypes.INSERT
      });

      dbRecord = {
        id: result[0],
        formId,
        customerId,
        agentId: agent_id,
        status: 'submitted'
      };

      logger.info('Form submission saved to database', {
        dbId: dbRecord.id,
        formId,
        status: 'submitted'
      });
    } catch (dbError) {
      logger.error('Error saving form submission to database', {
        error: dbError.message,
        formId
      });
      // Continue with API submission even if DB save fails
    }

    // Prepare payload
    const payload = {
      data,
      status: status || 'submitted'
    };

    // Submit to external API
    const response = await axios.post(
      `${BASE_URL}/external/forms/${formId}/submit`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'Accept-Language': language,
          'User-Agent': 'Moola-DataCollection-Service/1.0',
          'Authorization': `Bearer ${bearerToken}`
        },
        timeout: 30000
      }
    );

    const submissionId = response.data?.submissionId || response.data?.apiDetails?.submissionId || response.data?.submission?._id;
    const externalStatus = response.data?.submission?.status || response.data?.status || 'processing';
    
    // Extract data from API response
    const submission = response.data?.submission || {};
    const apiDetails = response.data?.apiDetails || {};
    const form = submission.form || {};
    const organization = submission.organization || {};
    const validation = submission.validation || {};
    const workflow = submission.workflow || {};
    const submitterDisplay = submission.submitterDisplay || {};

    // Update database record with full API response data
    if (dbRecord) {
      try {
        const updateQuery = `
          UPDATE aqs_data_collection 
          SET submissionId = ?, 
              status = ?, 
              thirdPartyStatus = ?,
              externalResponse = ?,
              formTitle = ?,
              formDescription = ?,
              organizationId = ?,
              organizationName = ?,
              syncStatus = ?,
              submitterType = ?,
              submitterDisplay = ?,
              submitterApiKeyName = ?,
              validationStatus = ?,
              validationErrors = ?,
              workflowCurrentStep = ?,
              workflowSteps = ?,
              isFlagged = ?,
              apiKeyName = ?,
              externalId = ?,
              processedAt = NOW(),
              updatedAt = NOW()
          WHERE id = ?
        `;
        
        await sequelize.query(updateQuery, {
          replacements: [
            submissionId,
            'processing',
            externalStatus,
            JSON.stringify(response.data),
            form.title || null,
            form.description || null,
            organization._id || null,
            organization.name || null,
            submission.syncStatus || 'synced',
            submission.submissionType || 'api',
            submitterDisplay.displayName || null,
            submitterDisplay.apiKeyName || apiDetails.apiKeyName || null,
            validation.isValid ? 'valid' : 'invalid',
            validation.errors ? JSON.stringify(validation.errors) : null,
            workflow.currentStep || null,
            workflow.steps ? JSON.stringify(workflow.steps) : null,
            submission.flags?.isFlagged ? 1 : 0,
            apiDetails.apiKeyName || null,
            apiDetails.externalId || null,
            dbRecord.id
          ]
        });

        logger.info('Form submission updated with API response', {
          dbId: dbRecord.id,
          submissionId,
          status: 'processing',
          externalStatus,
          formTitle: form.title,
          organizationName: organization.name
        });
      } catch (dbError) {
        logger.error('Error updating form submission in database', {
          error: dbError.message,
          dbId: dbRecord.id
        });
      }
    }

    logger.info('Form submitted successfully', {
      formId,
      submissionId: submissionId,
      language,
      dbId: dbRecord?.id
    });
    console.log('External form submission response:', response.data);

    // Generate agent commission after successful form submission
    let commissionResult = null;
    try {
      commissionResult = await generateAgentCommission(agent_id, agent_name);
      
      logger.info('Commission generation attempt completed', {
        agentId: agent_id,
        transactionId: commissionResult?.transactionId,
        success: commissionResult.success,
        message: commissionResult.message
      });
    } catch (commissionError) {
      logger.error('Error generating commission', {
        agentId: agent_id,
        error: commissionError.message
      });
      // Don't fail the form submission if commission generation fails
    }

    // Log AQS form submission transaction - UPDATE existing log with commission ID as transaction ID
    try {
      const transactionId = commissionResult?.transactionId || commissionResult?.data?.id || null;
      const thirdPartyStatus = response.data?.status || externalStatus || 'submitted';
      const description = `AQS Form Submission - Submission ID: ${submissionId}, Form ID: ${formId}, Agent: ${agent_name}, Commission ID: ${transactionId || 'N/A'}`;
      
      // Update the log with the actual transaction ID (commission ID from Cyclos)
      await updateLogs(
        transactionId, // Update using commission ID as the main transaction ID
        'success',
        thirdPartyStatus,
        submissionId, // store submission ID as token for reference
        description
      );

      // Update transfers table with AQS submission details if applicable
      if (submissionId) {
        const transferDescription = `AQS Form Submission - Form ID: ${formId}, Submission ID: ${submissionId}, Agent: ${agent_name}, Commission ID: ${transactionId || 'N/A'}`;
        
        // Try to update transfers table if a related transfer record exists
        await updateTransfersTable(transferDescription, submissionId);
      }

      logger.info('AQS form submission log updated to success', {
        transactionId,
        submissionId,
        agentId: agent_id
      });
    } catch (logError) {
      logger.error('Error updating AQS form submission log', {
        error: logError.message,
        submissionId,
        agentId: agent_id
      });
      // Don't fail the form submission if logging fails
    }

    return res.status(201).json(createResponse(
      true,
      'data_collection.form_submitted_successfully',
      {
        ...response.data,
        dbId: dbRecord?.id,
        status: 'processing',
        commission: commissionResult ? {
          success: commissionResult.success,
          message: commissionResult.message,
          data: commissionResult.data,
          error: commissionResult.error
        } : null
      },
      language
    ));

  } catch (error) {
    logger.error('Error submitting form data', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
      dbId: dbRecord?.id
    });

    // Update the log entry to failed status
    try {
      const errorDescription = `AQS Form Submission Failed - Form ID: ${req.params.formId}, Error: ${error.message}, Agent: ${agent_name}`;
      
      // Update with null transaction ID (since we don't have a commission ID on failure)
      await updateLogs(
        null, // Use null to find and update the pending entry
        'failed',
        'failed',
        null, // no token on failure
        errorDescription
      );

      logger.info('Failed AQS form submission log updated', {
        formId: req.params.formId,
        agentId: agent_id,
        error: error.message
      });
    } catch (logError) {
      logger.error('Error updating failed AQS form submission log', {
        error: logError.message,
        formId: req.params.formId
      });
    }

    // Update database record with error status if it exists
    if (dbRecord) {
      try {
        const updateQuery = `
          UPDATE aqs_data_collection 
          SET status = ?, 
              errorMessage = ?,
              updatedAt = NOW()
          WHERE id = ?
        `;
        
        await sequelize.query(updateQuery, {
          replacements: [
            'failed',
            error.message || 'Unknown error occurred',
            dbRecord.id
          ]
        });

        logger.info('Form submission marked as failed in database', {
          dbId: dbRecord.id,
          error: error.message
        });
      } catch (dbError) {
        logger.error('Error updating failed form submission in database', {
          error: dbError.message,
          dbId: dbRecord?.id
        });
      }
    }

    if (error.response?.status === 400) {
      return res.status(400).json(
        createErrorResponse(
          'data_collection.invalid_form_data',
          req.language || 'en',
          400,
          { details: error.response?.data?.details }
        )
      );
    }

    if (error.response?.status === 401) {
      return res.status(401).json(
        createErrorResponse(
          'data_collection.authentication_failed',
          req.language || 'en',
          401
        )
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json(
        createErrorResponse(
          'data_collection.service_unavailable',
          req.language || 'en',
          503
        )
      );
    }

    return res.status(500).json(
      createErrorResponse(
        'common.server_error',
        req.language || 'en',
        500,
        { error: error.message, requestId: req.id }
      )
    );
  }
};
