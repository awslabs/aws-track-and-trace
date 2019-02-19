import { ConfigService } from 'aws-sdk'
import DefaultConfig from '@/assets/config.json'

export default class ConfigurationService {
  static ITEM_DOES_NOT_EXIST_EXCEPTION = item => new Error(`ITEM_DOES_NOT_EXIST: ${item}`)
  static ITEM_ALREADY_EXISTS_EXCEPTION = item => new Error(`ITEM_ALREADY_EXISTS: ${item}`)

  constructor () {
    this.data = DefaultConfig
  }

  get (item, optional = false) {
    const value = this.data[item]
    if (!value && !optional) {
      throw ConfigurationService.ITEM_DOES_NOT_EXIST_EXCEPTION(item)
    }

    if (!value && optional) {
      console.log(`WARN: Parameter ${item} does not exist`)
    }

    return value
  }

  set (item, value, overwrite = false) {
    const existing = this.data[item]
    if (existing !== undefined && !overwrite) {
      throw ConfigService.ITEM_ALREADY_EXISTS_EXCEPTION(item)
    }

    this.data[item] = value

    return this.get(item)
  }

  static getInstance () {
    if (!ConfigurationService._instance) {
      ConfigurationService._instance = new ConfigurationService()
    }
    return ConfigurationService._instance
  }
}
