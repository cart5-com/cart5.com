import { parsePhoneNumberWithError } from 'libphonenumber-js/max'

export function parsePhone(phoneNumber: string) {
    return parsePhoneNumberWithError(phoneNumber)
}

// SAMPLE USAGE
// import { parsePhone } from 'lib/utils/phoneNumber'
// const phone = parsePhone('+15302404155')
// console.log(phone)
// const resultSample = {
//     "country": "US",
//     "countryCallingCode": "1",
//     "nationalNumber": "5302404155",
//     "number": "+15302404155",
//     "__countryCallingCodeSource": "FROM_NUMBER_WITH_PLUS_SIGN"
// }
// console.log("phone.getType()", phone.getType()); //FIXED_LINE_OR_MOBILE
// console.log("phone.isValid()", phone.isValid()); //true
// console.log("phone.isPossible()", phone.isPossible()); //true
// console.log("phone.formatInternational()", phone.formatInternational()); //+1 530 240 4155
// console.log("phone.formatNational()", phone.formatNational()); //(530) 240-4155
// console.log("phone.formatInternational()", phone.formatInternational()); //+1 530 240 4155