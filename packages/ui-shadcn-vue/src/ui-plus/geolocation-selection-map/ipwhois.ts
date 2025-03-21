import { IpWhoResponse } from "@/ui-plus/PhoneNumber/basePhoneInput"

export const ipwhois = async (): Promise<IpWhoResponse> => {
    return await (await fetch('https://ipwho.is')).json()
}