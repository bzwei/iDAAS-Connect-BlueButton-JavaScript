var ClientOAuth2 = require('client-oauth2')
 
var tokens = {};

var querystring = require('querystring');
var url = require('url');
var http = require('http');

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  const token = tokens[req.headers['x-bb-uid']]
  proxyReq.setHeader('Authorization', 'Bearer ' + token);
});

function getOAuthClient(state) {
  return new ClientOAuth2({
    clientId: process.env.BB_ID,
    clientSecret: process.env.BB_SECRET,
    accessTokenUri: 'https://sandbox.bluebutton.cms.gov/v1/o/token/',
    authorizationUri: 'https://sandbox.bluebutton.cms.gov/v1/o/authorize/',
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['patient/Patient.read', 'patient/Coverage.read', 'patient/ExplanationOfBenefit.read', 'profile'],
    state: state
  });
}

http.createServer(function (req, res) {
  const parts = url.parse(req.url);
  const route = parts.pathname;

  if (route == '/login') {
    const query = querystring.parse(parts.query);
    if (query['uid'] == undefined) {
      res.statusCode = 400;
      res.write("Missing uid in query parameter");
      res.end();
      return;
    }

    const authorizationUri = getOAuthClient(query['uid']).code.getUri();

    res.writeHead(301, { "Location": authorizationUri});
    res.end();
  }
  else if(route == '/api') {
    res.writeHead(301, { "Location": getOAuthClient(null).code.getUri()});
    res.end();   
  }
  else if(route == '/callback') {
    const query = querystring.parse(parts.query);
    getOAuthClient(query['state']).code.getToken(req.url)
      .then(function(user) {
        console.log(user);
        if(user.client.options['state'] == undefined) {
          res.writeHead(301, { "Location": "http://localhost:8080/bluebutton?token=" + user.accessToken});          
        }
        else {
          tokens[user.client.options['state']] = user.accessToken;
          res.write('Login succeeded!')
        }
        res.end();
      });
  }
  else {
    proxy.web(req, res, {
      target: 'https://sandbox.bluebutton.cms.gov',
      changeOrigin: true
    });
  }
}).listen(3000);
