import aws from 'aws-sdk'
import jwtDecode from 'jwt-decode'
import ConfigurationService from './ConfigurationService'

export default class AuthService {
  constructor () {
    this.config = ConfigurationService.getInstance()

    this.poolId = this.config.get('USER_POOL_ID')
    this.poolClientId = this.config.get('USER_POOL_CLIENT_ID')
    this.idPoolId = this.config.get('IDENTITY_POOL_ID')
    this.cognitoDomain = this.config.get('COGNITO_CUSTOM_DOMAIN', true)
    this.customDomain = this.config.get('CUSTOM_LOGIN_DOMAIN', true)
    const region = this.awsRegion = this.config.get('AWS_REGION')
    this.cognito = new aws.CognitoIdentity({
      region
    })

    this.credentials = null

    // Load existing credentials
    this.getUnauthCredentials()
    this.getCredentials()
    this.getAccessToken()
  }

  decodeToken (token) {
    const decoded = jwtDecode(token)
    this.storeTokenInformation(decoded)
  }

  storeTokenInformation (token) {
    this.user = token['cognito:username']
    this.groups = token['cognito:groups']
    this.role = token['cognito:preferred_role']
    this.UserId = token.sub
    this.accessToken = token

    localStorage.setItem('auth-access-token', JSON.stringify(token))
  }

  getAccessToken () {
    if (this.accessToken) return this.accessToken

    const accessTokenStr = localStorage.getItem('auth-access-token')
    if (!accessTokenStr) {
      return null
    }

    const accessToken = JSON.parse(accessTokenStr)
    this.storeTokenInformation(accessToken)
    return accessToken
  }

  getPreferredLoginMethod () {
    const method = localStorage.getItem('quiz-preferred-login-provider')
    return method
  }

  getCredentials (api = false) {
    if (!this.credentials) {
      const retrievedCredentialsStr = localStorage.getItem('auth-credentials')
      if (!retrievedCredentialsStr) {
        return undefined
      }

      const retrievedCredentials = JSON.parse(retrievedCredentialsStr)
      if (!this.verifyCredentials(retrievedCredentials)) {
        return undefined
      }
      this.credentials = aws.config.credentials = retrievedCredentials
    }

    if (api) {
      return {
        accessKey: this.credentials.Credentials.AccessKeyId,
        secretKey: this.credentials.Credentials.SecretKey,
        sessionToken: this.credentials.Credentials.SessionToken
      }
    }

    return {
      accessKeyId: this.credentials.Credentials.AccessKeyId,
      secretAccessKey: this.credentials.Credentials.SecretKey,
      sessionToken: this.credentials.Credentials.SessionToken
    }
  }

  getUnauthCredentials (api = false) {
    if (!this.unauthCredentials) {
      const retrievedCredentialsStr = localStorage.getItem('unauth-credentials')
      if (!retrievedCredentialsStr) {
        return undefined
      }

      const retrievedCredentials = JSON.parse(retrievedCredentialsStr)
      if (!this.verifyCredentials(retrievedCredentials)) {
        return undefined
      }
      this.unauthCredentials = aws.config.credentials = retrievedCredentials
    }

    if (api) {
      return {
        accessKey: this.unauthCredentials.Credentials.AccessKeyId,
        secretKey: this.unauthCredentials.Credentials.SecretKey,
        sessionToken: this.unauthCredentials.Credentials.SessionToken
      }
    }

    return {
      accessKeyId: this.unauthCredentials.Credentials.AccessKeyId,
      secretAccessKey: this.unauthCredentials.Credentials.SecretKey,
      sessionToken: this.unauthCredentials.Credentials.SessionToken
    }
  }

  getIdentity () {
    const identity = localStorage.getItem('auth-identity')
    return identity
  }

  getUnauthIdentity () {
    const identity = localStorage.getItem('unauth-identity')
    return identity
  }

  unauthLogin () {
    const AccountId = this.config.get('AWS_ACCOUNT_ID')
    const request = {
      IdentityPoolId: this.idPoolId,
      AccountId
    }

    return new Promise((resolve, reject) => {
      this.getCognitoId(request, true)
        .then(resolve)
        .catch(reject)
    })
  }

  login () {
    if (this.customDomain) {
      window.location.href = `https://${this.customDomain}/login?response_type=token&client_id=${this.poolClientId}&redirect_uri=${encodeURIComponent(window.location.href.split('/').slice(0, 3).join('/') + '/login')}`
    } else {
      window.location.href = `https://${this.cognitoDomain}.auth.${this.awsRegion}.amazoncognito.com/login?response_type=token&client_id=${this.poolClientId}&redirect_uri=${encodeURIComponent(window.location.href.split('/').slice(0, 3).join('/') + '/login')}`
    }
  }

  tokenExpired () {
    // TODO Implement with Refresh token
    this.login();
  }

  postAuth (token) {
    this.decodeToken(token)
    const AccountId = this.config.get('AWS_ACCOUNT_ID')
    const Logins = {}
    Logins[`cognito-idp.${this.awsRegion}.amazonaws.com/${this.poolId}`] = token
    const req = {
      IdentityPoolId: this.idPoolId,
      AccountId,
      Logins
    }

    localStorage.setItem('quiz-preferred-login-provider', 'cognito')

    return new Promise((resolve, reject) => {
      this.getCognitoId(req)
        .then(resolve)
        .catch(reject)
    })
  }

  getCognitoId (request, unauth = false) {
    const { Logins } = request
    return new Promise((resolve, reject) => {
      this.cognito.getId(request, (err, data) => {
        if (err) {
          console.error('ERROR: Failed to authenticate.')
          reject(err)
        } else {
          console.log('INFO: Successfully authenticated.')
          const { IdentityId } = data
          this.finalizeLogin(IdentityId, Logins, unauth)
            .then(resolve)
            .catch(reject)
        }
      })
    })
  }

  finalizeLogin (IdentityId, Logins, unauth = false) {
    return new Promise((resolve, reject) => {
      this.cognito.getCredentialsForIdentity({
        IdentityId,
        Logins
      }, (err, creds) => {
        if (err) {
          console.error('Failed to get credentials')
          reject(err)
        } else {
          console.log('INFO: Successfully fetched credentials.')
          aws.config.credentials = creds
          if (unauth) {
            this.unauthCredentials = creds
            localStorage.setItem('unauth-credentials', JSON.stringify(creds))
            localStorage.setItem('unauth-identity', IdentityId)
          } else {
            this.credentials = creds
            localStorage.setItem('quiz-preferred-login-provider', 'cognito')
            localStorage.setItem('auth-credentials', JSON.stringify(creds))
            localStorage.setItem('auth-identity', IdentityId)
          }
          resolve(creds)
        }
      })
    })
  }

  verifyCredentials (creds) {
    const expiration = new Date(creds.Credentials.Expiration).getTime()
    const now = new Date().getTime()

    return now < expiration
  }

  static getInstance () {
    if (!AuthService._instance) {
      AuthService._instance = new AuthService()
    }
    return AuthService._instance
  }
}
