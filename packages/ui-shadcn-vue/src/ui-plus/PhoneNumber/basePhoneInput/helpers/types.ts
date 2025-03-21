import type {
    CountryCallingCode,
    CountryCode,
    NationalNumber,
    NumberType,
} from 'libphonenumber-js'

import type { defaultLocales } from './default-locales'
import { Ref } from 'vue'

export interface Results {
    isValid: boolean
    isPossible?: boolean
    countryCode?: CountryCode
    countryCallingCode?: CountryCallingCode
    nationalNumber?: NationalNumber
    type?: NumberType
    formatInternational?: string
    formatNational?: string
    uri?: string
    e164?: string
    rfc3966?: string
    phoneNumber?: string
}

export interface InjectedData {
    selectedCountry: Ref<CountryCode | undefined>
    phoneNumber: Ref<string>
    results: Ref<Results>
}

export type Translations = typeof defaultLocales

export interface Country {
    iso2: CountryCode
    dialCode: CountryCallingCode
    name: string
}

