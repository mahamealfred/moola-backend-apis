CREATE TABLE `RefreshTokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(255) NOT NULL,
  `userId` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `agentCategory` VARCHAR(100) NOT NULL,
  `userAuth` VARCHAR(255) NOT NULL,
  `expiresAt` DATETIME NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_refreshtokens_token` (`token`),
  KEY `idx_refreshtokens_expiresat` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE transactions_status (
    ID INT(11) NOT NULL AUTO_INCREMENT,
    transactionId VARCHAR(10) DEFAULT NULL,
    customerId VARCHAR(50) DEFAULT NULL,
    token VARCHAR(255) DEFAULT NULL,
    thirdpart_status VARCHAR(20) DEFAULT NULL,
    service_name VARCHAR(25) DEFAULT NULL,
    status VARCHAR(20) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    amount DECIMAL(10,2) DEFAULT NULL,
    agent_name VARCHAR(20) DEFAULT NULL,
    transaction_reference VARCHAR(50) DEFAULT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE transactions_status
ADD COLUMN customerId VARCHAR(50) NULL AFTER transactionId,
ADD COLUMN token VARCHAR(255) NULL AFTER customerId;

ALTER TABLE transactions_status
ADD COLUMN agent_id VARCHAR(50) NULL AFTER agent_name;

ALTER TABLE transactions_status
ADD COLUMN customer_charge DECIMAL(10,2) DEFAULT NULL AFTER amount;

CREATE TABLE `aqs_data_collection` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `formId` VARCHAR(100) NOT NULL,
  `submissionId` VARCHAR(100) UNIQUE,
  `customerId` VARCHAR(50) NOT NULL,
  `agentId` VARCHAR(50),
  `formData` LONGTEXT NOT NULL COMMENT 'JSON formatted form data',
  `status` VARCHAR(50) NOT NULL DEFAULT 'submitted' COMMENT 'submitted, processing, completed, failed',
  `thirdPartyStatus` VARCHAR(50) DEFAULT NULL COMMENT 'Status from external API',
  `externalResponse` LONGTEXT COMMENT 'Full response from external API',
  `formTitle` VARCHAR(255),
  `formDescription` TEXT,
  `organizationId` VARCHAR(100),
  `organizationName` VARCHAR(255),
  `syncStatus` VARCHAR(50) DEFAULT NULL COMMENT 'synced, pending, failed',
  `submitterType` VARCHAR(50) DEFAULT 'api' COMMENT 'api, web, mobile',
  `submitterDisplay` VARCHAR(255),
  `submitterApiKeyName` VARCHAR(255),
  `validationStatus` VARCHAR(50) DEFAULT NULL COMMENT 'valid, invalid',
  `validationErrors` LONGTEXT COMMENT 'JSON array of validation errors',
  `workflowCurrentStep` VARCHAR(100),
  `workflowSteps` LONGTEXT COMMENT 'JSON array of workflow steps',
  `isFlagged` BOOLEAN DEFAULT FALSE,
  `apiKeyName` VARCHAR(255),
  `externalId` VARCHAR(100),
  `errorMessage` TEXT,
  `submittedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processedAt` DATETIME,
  `completedAt` DATETIME,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_asq_submission` (`submissionId`),
  KEY `idx_asq_formId` (`formId`),
  KEY `idx_asq_customerId` (`customerId`),
  KEY `idx_asq_agentId` (`agentId`),
  KEY `idx_asq_status` (`status`),
  KEY `idx_asq_submittedAt` (`submittedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores ASQ data collection form submissions';

