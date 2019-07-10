/* global describe it expect before beforeEach cy Cypress process*/

require("dotenv").config();

// TEMPORARY: NOT BEST PRACTICE, see the following for more info
// https://docs.cypress.io/api/plugins/configuration-api.html#Usage
const baseUrl = Cypress.env("BASE_URL");

const oktaDomain = process.env.OKTA_DOMAIN;
const oktaServerId = process.env.OKTA_SERVER_ID || "default";
const userInfoUrl = `https://${oktaDomain}.okta.com/oauth2/${oktaServerId}/v1/userinfo`;

// TODO: test not logged in scenario
describe("when logged out and the user visits", () => {
  it("the front page, we are redirected to our login page", done => {
    const loginRouteHash = "login";

    cy.clearCookies();

    cy.on("url:changed", url => {
      console.info("url:changed:", url);

      if (url.includes(loginRouteHash)) {
        // this event will automatically be unbound when this
        // test ends because it's attached to 'cy'
        cy.on("window:before:unload", e => {
          expect(e.target.URL).to.contain(loginRouteHash);
        });

        cy.on("window:unload", e => {
          // using mocha's async done callback to finish
          // this test so we are guaranteed the application
          // was unloaded while navigating to the new page
          done();
        });

        // return false to prevent failing this test
        return false;
      }
      return true;
    });

    // cy.server();
    // cy.route('GET', '/login', { stubbedResponse: 'response data' });
    // cy.route('GET', '**.okta.com/**', { stubbedResponse: 'response data' });

    cy.visit(`${baseUrl}`);

    // cy.url().should('match', /login/);
  });

  after(() => {
    // cy.route('/login');
    // cy.route('**.okta.com/**');
  });
});

describe("when logged in and the user visits", () => {
  before(() => {
    //   // login via preset userId
    // cy.login('user1');
    //   // // login via (username, userpassword)
    //   // cy.login('test_user_1', 'test_user_1');
    //   // // login via user object, where the user object contains `name` & `password`
    //   // cy.login({ name: 'test_user_1', password: 'test_user_1' });
  });

  beforeEach(() => {
    cy.login("user1");
    // cy.login('test_user_1', 'test_user_1');
    // cy.login({ name: 'test_user_1', password: 'test_user_1' });

    // cy.server();
    cy.route({
      method: "GET",
      url: userInfoUrl,
      response: []
    });
  });

  it("most basic test", () => {
    cy.login("user1");
    expect(true).to.equal(true); // TODO: fix so it's properly chained
  });

  it("the front page, we see front page matter", () => {
    cy.login("test_user_2@sharklasers.com", "FishLasers42");
    cy.visit(`${baseUrl}/`)
      .get("p")
      .should("be.visible")
      .should("contain", "front page content goes here");
  });

  it("the test page, we see the secure page note", () => {
    cy.login({ name: "test_user_1@sharklasers.com", password: "FishLasers42" });
    cy.visit(`${baseUrl}/secure`)
      .get("h1")
      .should("be.visible")
      .should("contain", "secure page");
  });

  it("the front page, we see front page matter", () => {
    cy.login("test_user_2@sharklasers.com", "FishLasers42");
    cy.visit(`${baseUrl}/`)
      .get("p")
      .should("be.visible")
      .should("contain", "front page content goes here");
  });

  it("the test page, we see the secure page note", () => {
    cy.login({ name: "test_user_1@sharklasers.com", password: "FishLasers42" });
    cy.visit(`${baseUrl}/secure`)
      .get("h1")
      .should("be.visible")
      .should("contain", "secure page");
  });
});

// TODO: test not logged in scenario
describe("when logged out and the user visits", () => {
  it("the front page, we are redirected to our login page", done => {
    const loginRouteHash = "login";

    cy.clearCookies();

    cy.on("url:changed", url => {
      console.info("url:changed:", url);

      if (url.includes(loginRouteHash)) {
        // this event will automatically be unbound when this
        // test ends because it's attached to 'cy'
        cy.on("window:before:unload", e => {
          expect(e.target.URL).to.contain(loginRouteHash);
        });

        cy.on("window:unload", e => {
          // using mocha's async done callback to finish
          // this test so we are guaranteed the application
          // was unloaded while navigating to the new page
          done();
        });

        // return false to prevent failing this test
        return false;
      }
      return true;
    });

    // cy.server();
    // cy.route('GET', '/login', { stubbedResponse: 'response data' });
    // cy.route('GET', '**.okta.com/**', { stubbedResponse: 'response data' });

    cy.visit(`${baseUrl}`);

    // cy.url().should('match', /login/);
  });

  after(() => {
    // cy.route('/login');
    // cy.route('**.okta.com/**');
  });
});
