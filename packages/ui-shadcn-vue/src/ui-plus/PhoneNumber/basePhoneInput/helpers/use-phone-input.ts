import {
    type CountryCode,
    getCountries,
    getCountryCallingCode,
} from 'libphonenumber-js'
import type { Country, IpWhoResponse } from './types'

export function getBrowserLocale() {
    if (typeof window === 'undefined') {
        return
    }

    const browserLocale = window.navigator.language

    if (!browserLocale) {
        return
    }

    let locale = browserLocale.slice(3, 7).toUpperCase()

    if (locale === '') {
        locale = browserLocale.slice(0, 2).toUpperCase()
    }

    if (locale === 'EN') {
        locale = 'US'
    }
    if (locale === 'JA') {
        locale = 'JP'
    }

    return {
        locale,
        browserLocale,
    }
}

let displayNamesInstance: Intl.DisplayNames | undefined
let displayNamesLocale: string | undefined

export function getCountryName(
    locale: string,
    code: CountryCode | string,
    customCountriesNameListByIsoCode?: Record<CountryCode, string>
): string | undefined {
    //@ts-ignore
    if (customCountriesNameListByIsoCode?.[code]) {
        //@ts-ignore
        return customCountriesNameListByIsoCode[code]
    }

    if (displayNamesLocale !== locale || !displayNamesInstance) {
        displayNamesLocale = locale
        displayNamesInstance = new Intl.DisplayNames([locale], {
            type: 'region',
        })
    }

    return displayNamesInstance.of(code)
}

export function getCountriesList(
    locale?: string,
    customCountriesNameListByIsoCode?: Record<CountryCode, string>
): Country[] | undefined {
    const countriesList: Country[] = []
    const isoList = getCountries()

    locale = locale ?? getBrowserLocale()?.browserLocale ?? 'en-US'

    for (const iso2 of isoList) {
        const name = getCountryName(
            locale,
            iso2,
            customCountriesNameListByIsoCode
        )

        if (name) {
            try {
                const dialCode = getCountryCallingCode(iso2)
                countriesList.push({
                    iso2,
                    dialCode,
                    name,
                })
            } catch (error) {
                console.error(`(getCountryCallingCode) ${error}`)
            }
        }
    }

    // move first item to the end
    const firstItem = countriesList.shift()
    if (firstItem) {
        countriesList.push(firstItem)
    }
    // find 'ta' and move to the end
    const taIndex = countriesList.findIndex(country => country.iso2 === 'TA')
    if (taIndex !== -1) {
        const ta = countriesList.splice(taIndex, 1)[0]
        countriesList.push(ta)
    }

    return countriesList
}

export async function fetchCountryCode() {
    // alternative: https://workers.cloudflare.com/cf.json // nope it is not working, CORS errors
    // alternative: https://ip2c.org/self
    // alternative: https://geolocation.onetrust.com/cookieconsentpub/v1/geo/location
    try {
        const reponse = await fetch('https://ipwho.is')
        const { country_code } = (await reponse.json()) as IpWhoResponse

        return country_code
    } catch (error) {
        throw new Error(`(fetchCountryCode) ${error}`)
    }
}

function sanitizePhoneNumber(input?: string) {
    if (!input) {
        return ''
    }
    const regex = new RegExp(/[^\d ()+-]/g) // Keep only digits, (), - and + characters
    //@ts-ignore
    return input.replaceAll(regex, '').trim() // Keep only digits, (), - and + characters
}

export function usePhoneInput() {
    return {
        sanitizePhoneNumber,
        fetchCountryCode,
        getBrowserLocale,
        getCountriesList,
    }
}
