# codesandbox-nuxt

> Nuxt starter for CodeSandBox (used for https://template.nuxtjs.org)

## IMPORTANT usage notes:

If manually exploring this instance, you'll need to open https://4jbdu.sse.codesandbox.io/ in a new window or tab. (This is because Okta is not configured to play nice with CodeSandbox's i-frame.)

If the user isn't logged in, they will be auto-redirected to their Okta.com login page. The testable user name & password combo is:

> okta@sharklasers.com  
> FishLasers42

## Configuration notes:

- Followed https://github.com/nuxt-community/auth-module/blob/6f6a1fa310eb362d85485fe3da47d207049cf5ea/docs/providers/okta.md for the basic set-up
  - Instead of `npm install @nuxtjs/auth @nuxtjs/axios @nuxtjs/dotenv`:
  - added the following to `package.json` then re-ran the install:
  ```
    "@nuxtjs/auth": "git+https://github.com/metasean/auth-module.git#okta",
    "@nuxtjs/axios": "^5.5.4",
    "@nuxtjs/dotenv": "^1.3.0",
  ```
  - Until the okta pull request is accepted, you can include this branch via:
    `npm install git+https://github.com:metasean/auth-module.git\#okta @nuxtjs/axios @nuxtjs/dotenv`
- In Okta admin app, accounted for CodeSandbox by
  - adding `https://4jbdu.sse.codesandbox.io/implicit/callback` as a "Login redirect URIs"
  - adding `https://4jbdu.sse.codesandbox.io/login` as a "Logout redirect URIs"
- Used Codesandbox's "Secret Keys" to override `.env`'s values for:
  - `OKTA_DOMAIN`
  - `OKTA_CLIENT_ID`
  - `OKTA_SERVER_ID`

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn run dev

# build for production and launch server
$ yarn run build
$ yarn start

# generate static project
$ yarn run generate
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).
