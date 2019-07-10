/*
    Custom Cypress Okta login command
*/
const jwtDecode = require('jwt-decode');

// TODO: delete `temp` directory
const fixturesDir = 'fixtures';
const tempFixturesDir = '.temp/coralCore';

/**
 * Function to add valid user credentials to the Cypress environment
 *
 * Params are overloaded to support a variety of user data configuration,
 *   e.g. each of the following is a valid way to log in the same user:
 *   - via a preset userId:
 *     - `login('user1')`
 *   - via a string username & password:
 *     - `login('test_user_1@sharklasers.com', 'FishLasers42')`
 *   - via an object with `name` & `password`
 *     - `login({name: 'test_user_1@sharklasers.com', password: 'FishLasers42'})`

 * @arg {string|Object} userIdNameOrOptions - **userId** _OR_ **userName** _OR_ **user object**
 *      - userId (currently available userIds: `user1`, `user1`, `user1`); no password is needed if a valid userId is provided
 *      - userName (e.g. `test_user_1@sharklasers.com`); a password will be needed as the second parameter
 *      - user object - at a minimum it MUST include `name` & `password`, e.g. *        `{
 *          name: 'test_user_1@sharklasers.com',
 *          password: 'FishLasers42',
 *          displayName: 'Test User_1',
 *          nickname: '',
 *        }`
 *
 * @arg {string} [password] (e.g. `FishLasers42`)
 */
function cypressLogin(userIdNameOrOptions, password) {
    function processParams() {
        let user = {
            name: 'NO USERNAME',
            displayName: 'NO DISPLAY NAME',
            nickname: 'NO NICKNAME',
            password: 'NO PASSWORD',
        };
        // TODO: modularize preset users object
        const presetUsers = {
            user1: {
                name: 'test_user_1@sharklasers.com',
                displayName: 'Test User_1',
                nickname: '',
                password: 'FishLasers42',
            },
            user2: {
                name: 'test_user_2@sharklasers.com',
                displayName: 'Test User_2',
                nickname: '',
                password: 'FishLasers42',
            },
            user3: {
                name: 'test_user_3@sharklasers.com',
                displayName: 'Test User_3',
                nickname: '',
                password: 'FishLasers42',
            },
        };

        // TODO: ADD MORE ERROR HANDLING AND NOTIFICATIONS!
        if (typeof userIdNameOrOptions === 'string') {
            if (password === undefined) { /* userId */
                user = presetUsers[userIdNameOrOptions];
            } else if (typeof password === 'string') { /* userName, userPassword */
                user.password = password;
                user.name = userIdNameOrOptions;
            } else { /* userName, ?invalid? */
                return 'ERROR: invalid subsequent login parameter';
            }
        } else if (userIdNameOrOptions instanceof Object) { /* {userOptions} */
            user = { ...user, ...userIdNameOrOptions };
        } else { /* ?invalid? */
            return 'ERROR: invalid first login parameters';
        }
        return user;
    }

    // TEMPORARY: NOT BEST PRACTICE, see the following for more info
    // https://docs.cypress.io/api/plugins/configuration-api.html#Usage
    const baseUrl = Cypress.env("BASE_URL");

    // TODO: Move to an env or config file, possibly to a configuration plugin,
    //       see the following for more info on the config plugin option
    // https://docs.cypress.io/api/plugins/configuration-api.html#Usage
    const oktaDomain = process.env.OKTA_DOMAIN;
    const oktaServerId = process.env.OKTA_SERVER_ID || "default";
    const oktaUris = {
        token: `https://${oktaDomain}.okta.com/oauth2/${oktaServerId}/v1/token`,
        userInfo: `https://${oktaDomain}.okta.com/oauth2/${oktaServerId}/v1/userinfo`,
        authorize: `https://${oktaDomain}.okta.com/oauth2/${oktaServerId}/v1/authorize`,
        login: 'https://myriad.okta.com/login/*',
    };

    // token request
    /* NOTE: There's probably a better way to get the `Authorization` value.
             I ran the equivalent of the following in Postman
             e.g.
                curl --request POST \
                --url <_TOKEN_BASE_URL_> \
                --user <_CLIENT_ID_>:<_CLIENT_SECRET_> \
                --header 'accept: application/json' \
                --header 'content-type: application/x-www-form-urlencoded' \
                --data "grant_type=password&username=<_USERNAME_>&password=<_USER_PASSWORD_>&scope=openid"

            POST to oktaUris.token
            Authorization set to
                - Basic Auth
                - Username: _CLIENT_ID_
                - Password: _CLIENT_SECRET_
            Headers set to
                - Accept: application/json
                - Content-Type: application/x-www-form-urlencoded
            Body set to
                - grant_type: password
                - username: _USERNAME_
                - password: _USER_PASSWORD_
                - scope: openid
            Send the request to make sure everything is set up correctly.
            In the upper-right corner, open the "Code" view, copy the bearer token entry _after_ "Authorization: "    
    */
    const oktaBasicAuth = 'Basic MG9hczEzOXNvTzR3TjE2WTQzNTY6Ykk1YklpYVVlYzc2clRjZTR1N3BNSm1ERFE4VkJBbHJ4SFR2bWpvRQ==';

    /**
     *  Make a Cypress log entry indicating a completed login, and whether
     *  the auth data is from a fresh Okta request or is using previously
     *  saved data.
     *
     * @arg { Object } user - object with user-related properties
     *                 - NOTE: the user object must include a `name` value
     * @arg { Boolean } isUsingFixtureData - whether auth data is from the fixture file or not
     */

    function makeNewRequest(user) {
        return (
            cy.request({
                method: 'POST',
                url: oktaUris.token,
                headers: {
                    'cache-control': 'no-cache',
                    Authorization: oktaBasicAuth,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                form: true,
                body: {
                    grant_type: 'password',
                    username: user.name,
                    password: user.password,
                    scope: 'openid profile',
                },
                log: false,
            })
                .then((response) => {
                    const oktaAuthData = response.body; // use body of the response
                    const jwt = jwtDecode(oktaAuthData.access_token);

                    // verify response
                    if (jwt.appusername !== user.name) {
                        cy.log('INVALID JWT!');
                    } else {
                        // buffer —in seconds— before the token should be considered invalid
                        const buffer = 5;
                        const millisTillTokenInvalid = (3600 - buffer) * 1000;
                        // add an expiry timestamp for subsequent checks
                        response.body.expires_at = Date.now() + millisTillTokenInvalid;

                        // save a copy of the data as a fixture for subsequent tests
                        cy.writeFile(
                            `${fixturesDir}/${tempFixturesDir}/${user.name}.json`,
                            response.body,
                            { log: false }
                        );

                        Promise.resolve(response);
                    }
                })
        );
    }

    function logIn() {
        let isUsingFixtureData;

        // process params into a usable user object
        const user = processParams();

        // start up the Cypress server to provide stubbed api call responses
        cy.server();

        // determine if a corresponding fixture already exists
        // note that `cy.task('checkFileExistence')` is a custom
        // CORAL Core Cypress plugin
        cy.task(
            'checkFileExistence',
            `${fixturesDir}/${tempFixturesDir}/${user.name}.json`,
            { log: false },
        )
            .then(exists => {
                if (!exists) {
                    console.warn('!exists');
                    isUsingFixtureData = false; // set the notification flag
                    // no fixture file exists, so make the actual Okta auth request
                    makeNewRequest(user);
                } else {
                    // a fixture file does exist, so get its contents
                    return cy.readFile(
                        `${fixturesDir}/${tempFixturesDir}/${user.name}.json`,
                        { log: false },
                    )
                        .then(fixtureData => {
                            if (fixtureData.expires_at < Date.now()) {
                                // the token is invalid, so make a new request
                                console.warn('expired');
                                isUsingFixtureData = false; // set the notification flag
                                makeNewRequest(user);
                            } else {
                                // the token is still valid, so we'll just let the fixture data be returned to the next `then`
                                console.warn('using fixture data');
                                isUsingFixtureData = true; // set the notification flag
                            }
                        });
                }
            })
            .then(authRes => {
                const bearerToken = `Bearer ${authRes.access_token}`;

                // cookies that are normally set upon a successful login
                cy.setCookie('auth._refresh_token.okta', 'false', { log: false });
                cy.setCookie('auth._token.okta', bearerToken, { log: false });
                cy.setCookie('auth.id_token', `${authRes.id_token}`, { log: false });
                cy.setCookie('auth.strategy', 'okta', { log: false });

                cy.server();

                // Provide a stubbed response for POST token calls
                // NOTE: These are calls that ONLY *_our custom Cypress login command_*
                //       uses to get actual tokens
                cy.route({
                    method: 'POST',
                    url: oktaUris.token,
                    headers: {
                        'cache-control': 'no-cache',
                        Authorization: bearerToken,
                        Accept: 'application/json',
                    },
                    response: authRes,
                });

                /*
                  // Provide a stubbed response for GET authorize calls
                  // NOTE: These are calls that the app itself uses to check authorization
                  //       and which ultimately will lead to users being redirected to
                  //       okta.com to login
                  cy.route({
                    method: 'GET',
                    url: oktaUris.authorization,
                    headers: {
                      'cache-control': 'no-cache',
                      Authorization: bearerToken,
                      Accept: 'application/json',
                    },
                    onRequest: (xhr) => {
                      console.info('YO: onRequest');
                      console.info('xhr response:', xhr);
                    },
                    response: ['nothing to see here'],
                  });
                */

                cy.route({
                    method: 'GET',
                    url: oktaUris.login,
                    response: [],
                });

                cy.server();
                // Provide a stubbed response for GET userinfo calls
                cy.route('GET', 'https://myriad.okta.com/oauth2/ausqm6yrog9OXpHL7356/v1/userinfo');
                // cy.route({
                //   method: 'GET',
                //   url: 'https://myriad.okta.com/oauth2/ausqm6yrog9OXpHL7356/v1/userinfo',
                //   // url: oktaUris.userInfo,
                //   // headers: {
                //   //   'cache-control': 'no-cache',
                //   //   Authorization: bearerToken,
                //   //   Accept: 'application/json',
                //   // },
                //   response: [],
                // });

                // update the Command Log with some useful login data
                Cypress.log({
                    name: isUsingFixtureData
                        ? 'Used fixture data to simulate login'
                        : 'Made an actual Myriad Okta token request',
                    displayName: isUsingFixtureData ? 'Login ♻️' : 'Login ↗️',
                    message: user.name,
                    consoleProps: () => ({ User: user }),
                });
            });
    }

    logIn();
}

// -- As a parent command --
Cypress.Commands.add('login', cypressLogin);


// -- As a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
// Cypress.Commands.add('login', { prevSubject: 'optional' }, cypressLogin);
