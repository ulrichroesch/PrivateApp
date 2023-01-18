let payload = {};
let API_KEY = 'YWRtaW46YWRtaW4=';

let APPLICATION_CONFIG = {
    success: true,
    applicationType: {
        name: 'PV-Meter',
        type: 'Meter',
        version: '0.0.1',
        description: 'Demonstrate privateApp',
        mode: 'SEND_FETCH_ASYNC',
        backgroundColor: '#0099ff',
        allowEditVariables: true,
        isCustomerAllowed: true,
        minSelectVariables: 1,
        maxSelectVariables: 4,
        customUserFields: [
            {
                type: 'text',
                key: 'reference',
                displayName: 'PV-Var',
                required: true,
            },
        ],
        executionFrequencyMinutes: 15
    }
};

payload = APPLICATION_CONFIG;
msg.payload = payload;

return msg;