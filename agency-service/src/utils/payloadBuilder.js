//Airtime
export const buildAirtimePayload = ({   amount,
  requestId,
  ccy,
  customerId,
  clientPhone
 }) => ({
  amount,
  toMemberId: '18',
  transferTypeId: '66',
  currencySymbol: ccy,
  description: 'Airtime Purchase',
  customValues: [
    {
          internalName: "trans_id",
          fieldId: "85",
          value: requestId
        },
        {
          internalName: "net_amount",
          fieldId: "87",
          value: amount
        },
        {
          internalName : "clientphone",
          fieldId : "90",
          value : customerId
        },
    
  ],
});
//Electricity
export const buildElecticityPayload = ({ 
  amount,
  requestId,
  ccy,
  customerId,
  clientPhone
}) => ({
  
    toMemberId: "18",
    amount: amount,
    transferTypeId: "70",
    currencySymbol: ccy,
    description: "Electricity Payment",
    customValues: [
      {
      internalName : "meterNumber",
      fieldId : "86",
      value :customerId
       },
      {
     internalName : "trans_id",
     fieldId : "85",
     value : requestId
      },
      {
        internalName : "net_amount",
        fieldId : "87",
        value : amount
      },
      {
        internalName : "clientphone",
        fieldId : "90",
        value : clientPhone
      }
    
    ]
});

//Startime
export const buildStartimePayload = ({ 
  amount,
  requestId,
  ccy,
  customerId,
  clientPhone
}) => ({
  
    toMemberId: "18",
    amount: amount,
    transferTypeId: "74",
    currencySymbol: "Rwf",
    description: "Startimes Subscription",
     customValues:[{
      internalName : "trans_id",
        fieldId : "85",
        value : requestId
         },
         {
          internalName : "net_amount",
          fieldId : "87",
          value : amount
          },
          {
            internalName : "clientphone",
            fieldId : "90",
            value : clientPhone
          }
        
        ]

});

//Startime
export const buildBulkSMSPindoPayload = ({ 
  amount,
  requestId,
  ccy,
  customerId,
  clientPhone
}) => ({
  
    toMemberId: "3",
    amount: amount,
    transferTypeId: "31",
    currencySymbol: "Rwf",
    description: "Bulk SMS"

});


//RRA
export const buildRRABillerPayload = ({
  amount,
  requestId,
  ccy,
  customerId,
  clientPhone,
  billerCode,
}) => ({

     toMemberId: "18",
      amount: amount,
      transferTypeId:"82",
      currencySymbol: ccy,
      description: "RRA Payment",
      customValues: [
       {
      internalName:"tax_identification_number",
      fieldId : "82",
      value : customerId
       },
        {
      internalName : "tax_document_id",
      fieldId : "84",
      value : clientPhone
        },
        {
      internalName : "taxpayer",
      fieldId : "89",
      value :clientPhone
        },
	    {
      internalName : "trans_id",
      fieldId : "118",
      value : requestId
        },
      {
          internalName : "net_amount",
          fieldId : "119",
          value :amount
         }
    ]
});

//Ecobank Cash In

export const buildEcoCashInPayload = ({ 
 amount,
  sendername,
  senderphone,
  senderaccount,
  narration,
  ccy,
}) => ({
    toMemberId: "142",
    amount: amount,
    transferTypeId: "121",
    currencySymbol: ccy,
    description: narration || "Agency Banking Client Deposit"
});

//Ecobank Cash In

export const  buildEcoCashOutPayload = ({ 
 amount,
  sendername,
  senderphone,
  senderaccount,
  narration,
  ccy,
  userId
}) => ({
     toMemberId: userId,
    amount: amount,
    transferTypeId: "122",
    currencySymbol: ccy,
    description: "Agency Banking Client Account Withdrawal"
});

//Generic
export const buildGenericBillerPayload = ({
  amount,
  requestId,
  ccy,
  customerId,
  clientPhone,
  billerCode,
}) => ({
  amount,
  toMemberId: '56', // Can vary by biller
  transferTypeId: '78', // Can vary by biller
  currencySymbol: ccy,
  description: `${billerCode.toUpperCase()} Payment`,
  customValues: [
    {
      internalName: 'trans_id',
      fieldId: '118',
      value: requestId,
    },
    {
      internalName: 'bill_account',
      fieldId: '120',
      value: customerId,
    },
    {
      internalName: 'phone_number',
      fieldId: '121',
      value: clientPhone,
    },
  ],
});
