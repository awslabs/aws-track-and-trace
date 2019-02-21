import { ConfigModel } from './config-model'

/**
 * Configuration file for your deployment. Enter the information in the fields
 */
let Config: ConfigModel = {
  general: {
    solutionName: 'AWSTrackAndTrace',
    description: 'Sample project for tracking your moving assets.'
  },
  administrator: {
    username: 'admin',
    email: 'john.doe@example.com',
    name: 'John Doe'
  },
  dns: {
    certificateArn: 'arn:aws:...',
    domainName: 'myfleet.example.com',
    hostedZoneId: 'AABBCCDD'
  }
}

export {
  Config
}
