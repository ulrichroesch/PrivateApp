let payload = {};
let API_KEY = 'YWRtaW46YWRtaW4=';

var date = new Date();
var now = date.getTime();
//now = parseInt((now / 1000),10);



let APPLICATION_FETCH = {
    success: true,

    variablesTimeSeries: 
        [
            {
                variable:  "Hallo 1",
                timeSeries: [
                    {
                        timestamp:  now,
                        value: 1
                    },
                ]
            },
            {
                variable: "Hallo 2",
                timeSeries: [
                    {
                        timestamp: now,
                        value: 2
                               },
                ]
            },
            {
                variable: "Hallo 3",
                timeSeries: [
                    {
                        timestamp: now,
                        value: 3
                               },
                ]
            }  
        ]    
        
}


payload = APPLICATION_FETCH;
msg.payload = payload;

node.status({ fill: "blue", shape: "ring", text: now });

return msg;