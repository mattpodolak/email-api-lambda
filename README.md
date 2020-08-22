# Email API using Node with API Gateway and AWS Lambda

This sample application is a Lambda function that processes events from an API Gateway REST API. The API provides a public endpoint that you can access with a web browser or other HTTP client. When you send a request to the endpoint, the API serializes the request and sends it to the function. The function uses the nodemailer package to send out an email to a set Gmail address. This is useful for websites which incorporate a contact form.

:warning: The application creates a public API endpoint that is accessible over the internet. When you're done testing, run the cleanup script to delete it.

![Architecture](/images/flow.png)

The project source includes function code and supporting resources:

- `function` - A Node.js function.
- `template.yml` - An AWS CloudFormation template that creates an application.
- `0-run-tests.sh`, `1-create-bucket.sh`, `2-deploy.sh`, etc. - Shell scripts that use the AWS CLI to deploy and manage the application.

Use the following instructions to deploy the email application.

# Requirements
- [Node.js 10 with npm](https://nodejs.org/en/download/releases/)
- The Bash shell. For Linux and macOS, this is included by default. In Windows 10, you can install the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) to get a Windows-integrated version of Ubuntu and Bash.
- [The AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) v1.17 or newer.

If you use the AWS CLI v2, add the following to your [configuration file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) (`~/.aws/config`):

```
cli_binary_format=raw-in-base64-out
```

This setting enables the AWS CLI v2 to load JSON events from a file, matching the v1 behavior.

# Local Testing
Create a file named `setEnvVars.js` in the `jest` folder with the required environment variables `USER` and `PASS`, these values are from the Gmail account you will be sending emails from:

    process.env.USER = 'sample@email.com'
    process.env.PASS = 'password'

To test the email function locally using Jest, run `0-run-tests.sh`.

    email-api-lambda$ ./scripts/0-run-tests.sh

# Setup
Download or clone this repository.

    $ git clone https://github.com/mattpodolak/email-api-lambda.git
    $ cd email-api-lambda

To create a new bucket for deployment artifacts, run `1-create-bucket.sh`.

    email-api-lambda$ ./scripts/1-create-bucket.sh


# Deploy
To deploy the application, run `2-deploy.sh`.

    email-api-lambda$ ./scripts/2-deploy.sh

This script uses AWS CloudFormation to deploy the Lambda functions and an IAM role. If the AWS CloudFormation stack that contains the resources already exists, the script updates it with any changes to the template or function code.

# Manual Lambda Configuration
## Set ENV Variables
In the [AWS Lambda Console](https://console.aws.amazon.com/lambda/home), select your function that was deployed and select "Manage environment variables", add both the `USER` and `PASS` variables for the Gmail account that will send the emails.

## Create Node Modules Layer
To create a layer which incorporates the required node_modules for the email application, run `3-create-layer.sh`.

    email-api-lambda$ ./scripts/3-create-layer.sh

Send the nodejs folder to a zip file named `nodejs.zip`. 

In the AWS Lambda Console, navigate to [Layers](https://console.aws.amazon.com/lambda/home#/layers) and select "Create Layer".

Name your layer and upload the `nodejs.zip` file you created. Select the `Node.js 12.x` Runtime, and click "Create".

![Create Layer](/images/create-layer.png)

## Add Layer to Function
Navigate back to your Lambda function in the AWS Console. Select "Layers" in the Designer area.

![Layers](/images/layers.png)

In the Layers section which appears, select "Add a layer".

![Add a layer](/images/add-layer.png)

Select "Custom layers" and find the layer you have just created, select the "Version" and click Add. Your Lambda function can now use the Node modules that are installed in the layer you have just added.


# Test
To invoke the function directly with a test event (`event.json`), run `4-invoke.sh`.

    email-api-lambda$ ./scripts/4-invoke.sh

Let the script invoke the function a few times and then press `CRTL+C` to exit.

To invoke the function with the REST API, run the `5-post.sh` script. This script uses cURL to send a GET request to the API endpoint.

    email-api-lambda$ ./scripts/5-post.sh

The application uses AWS X-Ray to trace requests. Open the [X-Ray console](https://console.aws.amazon.com/xray/home#/service-map) to view the service map. 

# Cleanup
To delete the application, run `6-cleanup.sh`.

    email-api-lambda$ ./scripts/6-cleanup.sh

If you are using Git Bash, the command to delete the log group will fail because / is a special mount. Add `MSYS_NO_PATHCONV=1` to the front of the aws logs command in `6-cleanup.sh`:
    MSYS_NO_PATHCONV=1 aws logs delete-log-group --log-group-name /aws/lambda/$FUNCTION

# Future Consideration
- Automated layer creation for Lambda Function
- Automated environment variable creation
- Use Terraform instead of CloudFormation for IaC
