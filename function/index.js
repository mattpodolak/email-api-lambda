const nodemailer = require('nodemailer');

const transport = {
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.USER,
    pass: process.env.PASS
  }
}

// Handler
exports.handler = async function(event, context) {
  console.log('## CONTEXT: ' + serialize(context))
  console.log('## EVENT: ' + serialize(event))
  
  try {
    return await sendMail(event).then(
      message => formatResponse(message)
    ).catch(
      error => formatError(error)
    );
  } catch(error) {
    return formatError(error)
  }
}

var formatResponse = function(body){
  var response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": body
  }
  return response
}

var formatError = function(error){
  var response = {
    "statusCode": error.statusCode,
    "headers": {
      "Content-Type": "text/plain",
      "x-amzn-ErrorType": error.code
    },
    "isBase64Encoded": false,
    "body": error.code + ": " + error.message
  }
  return response
}

var serialize = function(object) {
  return JSON.stringify(object, null, 2)
}

var sendMail = function(event){
  const transporter = nodemailer.createTransport(transport);
  return new Promise(
    (resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.log("Email Verify Error: ", error);
          reject(error)
        } else {
          console.log('Ready to send an email');
          var name = event.body.name
          var email = event.body.email
          var text = event.body.message
          var content = 'name: '+ name + '\nemail: ' + email + '\nmessage: ' + text;
        
          var mail = {
            from: name,
            to: 'sample@gmail.com', 
            subject: '[Your Website] - Contact Form New Message',
            text: content
          }
          transporter.sendMail(mail, (error, data) => {
              if (error) {
                console.log("Email Send Error: ", error)
                reject(error)
              } else {             
                let message = "Message Sent";
                console.log(message)
                resolve(message);
              }
          })
        }
      });
    }
  );
}