# iDAAS-Connect-BlueButton-JavaScript
Javascript codebase to connect to Blue Button and return data Blue Button data for processing into iDAAS

## Proxy to Blue Button API
This is a project to help to do OAuth2 authentication and make further requests to Blue Button API. The proxy server runs on NodeJS.

The user will need to login manually with a self selected unique ID and use program to make API calls.

## Prerequisites
1. Sign up for the blue button [developer sandbox](https://bluebutton.cms.gov/). 
2. Create a new application with the following. Then write down the resulting Client ID and Client Secret
* OAuth - Client Type: confidential
* OAuth - Grant Type: authorization-code
* Callback URLS: http://localhost:3000/callback (or another url more appropriate) 
3. `npm install client-oauth2 --save`
4. `npm install http-proxy --save`

## Getting Started
### Environmental variables
```
export BB_ID=<blue button client ID>
export BB_SECRET=<blue button client secret>
```
### Start the proxy
```
node bbproxy.js
```
You can also expose environmental variables inline with node command. You also need to modify the source file if you have configured a callback or redirect URL other than `http://localhost:3000/callback`
### Authentication
Use a browser to open
```
http://localhost:3000/login?uid=<uniq_id>
```
`uniq_id` is an unique session ID you pick for future API calls. You can use a random UUID generator.

Follow the login screen to type username and password. Download the [CSV file](https://bluebutton.cms.gov/synthetic_users_by_claim_count_full.csv) which contains 100 sample data with id, user name, and password.
### Make Blue Button API calls through the proxy
You can make API calls through the proxy by replacing `https://sandbox.bluebutton.cms.gov` with `http://localhost:3000` and insert a header `x-bb-uid` whose value is the unique ID you picked for authentication. For example
```
http://localhost:3000/v1/fhir/Patient/-20140000001827
```
Note you need to add a negative sign to the user ID in the CSV file.

### Authenticate and redirect
You can use the proxy to authenticate and redirect to an internal application server to further API calls
```
http://localhost:3000/api
```
It will ask you to authenticate and redirect to 
```
http://localhost:8080/bluebutton?token=<token>
```
You need to start the other server before the redirect.