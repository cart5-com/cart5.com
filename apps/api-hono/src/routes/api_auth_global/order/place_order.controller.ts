import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getUserData_Service } from "@db/services/user_data.service";
import { getStoreData_CacheJSON } from "@db/cache_json/store.cache_json";
import { platformServiceFee } from "@lib/platformServiceFee";
import type { ServiceFee, CalculationType } from "@lib/zod/serviceFee";
import {
    calculateCartItemPrice,
    calculateCartTotalPrice
} from "@lib/utils/calculateCartItemPrice";

import { generateCartItemTextSummary } from "@lib/utils/generateCartItemTextSummary";
import {
    getSupportTeamWebsite_Service,
    getSupportTeamServiceFee_Service,
    getWebsiteByDefaultHostname,
    getWebsiteTeamServiceFee_Service
} from "@db/services/website.service";
import type { CartItem } from "@lib/zod/cartItemState";
import { calculateSubTotal } from "@lib/utils/calculateSubTotal";
import {
    calculateCartBreakdown
} from "@lib/utils/calculateCartBreakdown";

import { handleGeocode } from '@api-hono/routes/gmaps/mapsRoute.controller';
import { getAllVerifiedPhoneNumbers_Service } from '@db/services/phone.service';
import { checkUserDataBeforePlacingOrder, checkStoreDataBeforePlacingOrder, checkMinimumOrderValueForDelivery } from "@lib/utils/checkBeforePlacingOrder";
import { checkGeocodeDistance } from '@lib/utils/checkGeocodeDistance';

export const placeOrderRoute = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    if (!storeId) {
        throw new KNOWN_ERROR("Store ID not found", "STORE_ID_NOT_FOUND");
    }
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }
    const origin = c.req.header()['origin'];
    if (!origin) {
        throw new KNOWN_ERROR("Origin not found", "ORIGIN_NOT_FOUND");
    }
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (user.hasVerifiedPhoneNumber === 0) {
        throw new KNOWN_ERROR("User phone number not verified", "USER_PHONE_NUMBER_NOT_VERIFIED");
    }

    const userData = await getUserData_Service(user.id, {
        rememberLastAddress: true,
        rememberLastCountry: true,
        rememberLastLat: true,
        rememberLastLng: true,
        rememberLastPaymentMethodId: true,
        rememberLastOrderType: true,
        rememberLastNickname: true,
        rememberLastAddressId: true,
        addresses: true,
        carts: true,
    });
    const { currentCart, currentOrderType, deliveryAddress } = checkUserDataBeforePlacingOrder(userData, host, storeId);
    // check address location is close(300 meters) to geocoded address lat,lng
    if (currentOrderType === 'delivery' && deliveryAddress) {
        const mapResult = await handleGeocode(origin + '/__p_api/gmaps/geocode?address=' + deliveryAddress.address1 + '&components=country:' + deliveryAddress.country);
        checkGeocodeDistance(mapResult.data, {
            lat: deliveryAddress.lat!,
            lng: deliveryAddress.lng!
        });
    }
    const pickupNickname = (userData?.rememberLastNickname || user.name || 'unknown');
    const storeData = await getStoreData_CacheJSON(storeId);
    const { menuRoot, taxSettings, currentPaymentMethod } = checkStoreDataBeforePlacingOrder(storeData, currentOrderType, userData);
    const orderedItems: {
        name: string;
        quantity: number;
        details: string;
        shownFee: string;
    }[] = [];
    currentCart.items?.forEach((item: CartItem) => {
        const menuItem = menuRoot.allItems?.[item.itemId!];
        if (menuItem && menuItem.lbl) {
            const price = calculateCartItemPrice(item, menuRoot, taxSettings, userData?.rememberLastOrderType ?? 'delivery');
            if (price.isValid) {
                orderedItems.push({
                    name: menuItem.lbl ?? '',
                    quantity: item.quantity ?? 1,
                    details: generateCartItemTextSummary(item, menuRoot),
                    shownFee: (taxSettings.currencySymbol ?? '') + price.shownFee,
                });
            }
        }
    });
    if (orderedItems.length === 0) {
        throw new KNOWN_ERROR("Cart is empty", "CART_EMPTY");
    }


    const calculationType: CalculationType = storeData?.serviceFees?.calculationType ?? "INCLUDE";
    const tolerableServiceFeeRate = storeData?.serviceFees?.tolerableServiceFeeRate ?? 0;
    const offerDiscountIfPossible = storeData?.serviceFees?.offerDiscountIfPossible ?? true;
    const customServiceFees = storeData?.serviceFees?.customServiceFees ?? [];

    const cartTotals = calculateCartTotalPrice(currentCart, menuRoot ?? undefined, taxSettings, currentOrderType)
    // const subtotalShownFee = `${taxSettings.currencySymbol}${cartTotals.shownFee}`
    const storeLocation = {
        lat: storeData?.address?.lat!,
        lng: storeData?.address?.lng!
    }
    const subTotalWithDeliveryAndServiceFees = calculateSubTotal(
        currentCart, menuRoot ?? undefined, taxSettings, currentOrderType,
        {
            lat: deliveryAddress?.lat ?? userData?.rememberLastLat!,
            lng: deliveryAddress?.lng ?? userData?.rememberLastLng!
        },
        storeData?.deliveryZones?.zones ?? [],
        storeLocation,
        customServiceFees
    );

    checkMinimumOrderValueForDelivery(
        subTotalWithDeliveryAndServiceFees,
        taxSettings,
        currentOrderType,
        cartTotals
    );
    // ALL CHECKS UNTIL HERE ARE ALSO CHECKING IN CLIENTSIDE (CartContainer.vue)


    const WEBSITE = await getWebsiteByDefaultHostname(host ?? '');
    if (!WEBSITE || !WEBSITE.id) {
        throw new KNOWN_ERROR("Website not found", "WEBSITE_NOT_FOUND");
    }
    const websiteTeamServiceFee = await getWebsiteTeamServiceFee_Service(
        WEBSITE?.id ?? "",
        storeId,
        WEBSITE?.defaultMarketplaceFee ?? null
    )
    const supportTeamServiceFee = await getSupportTeamServiceFee_Service(storeId);
    const supportPartnerServiceFee: ServiceFee | null = supportTeamServiceFee;
    const marketingPartnerServiceFee: ServiceFee | null = websiteTeamServiceFee;

    const cartBreakdown = calculateCartBreakdown(
        subTotalWithDeliveryAndServiceFees,
        platformServiceFee,
        supportPartnerServiceFee,
        marketingPartnerServiceFee,
        taxSettings,
        calculationType,
        tolerableServiceFeeRate,
        offerDiscountIfPossible,
        userData?.rememberLastPaymentMethodId === "stripe" && (storeData?.stripeSettings?.isStripeEnabled ?? false),
        {
            name: "Stripe Fee",
            ratePerOrder: storeData?.stripeSettings?.stripeRatePerOrder ?? 0,
            feePerOrder: storeData?.stripeSettings?.stripeFeePerOrder ?? 0,
            whoPaysFee: storeData?.stripeSettings?.whoPaysStripeFee ?? "STORE"
        }
    )

    const userVerifiedPhoneNumbers = await getAllVerifiedPhoneNumbers_Service(user.id);
    const supportTeamWebsite = await getSupportTeamWebsite_Service(storeId);
    const subtotalJSON = {
        ...subTotalWithDeliveryAndServiceFees,
        bestDeliveryZone: subTotalWithDeliveryAndServiceFees.bestDeliveryZone ?
            {
                itemTotal: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.itemTotal,
                tax: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.tax,
                totalWithTax: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.totalWithTax,
                shownFee: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.shownFee,
                distanceFromStoreKm: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.distanceFromStoreKm,
                totalDeliveryFee: subTotalWithDeliveryAndServiceFees.bestDeliveryZone.totalDeliveryFee,
            }
            : undefined
    };

    const orderData = {
        userId: user.id,
        userEmail: user.email,
        userVerifiedPhoneNumber: userVerifiedPhoneNumbers.map(phone => phone.phoneNumber).join('|'),
        websiteId: WEBSITE.id,
        websiteDefaultHostname: WEBSITE.defaultHostname,
        supportTeamWebsiteId: supportTeamWebsite?.id,
        supportTeamWebsiteDefaultHostname: supportTeamWebsite?.defaultHostname,
        storeId,
        orderType: currentOrderType,
        pickupNickname,
        storeLocationLat: storeLocation.lat,
        storeLocationLng: storeLocation.lng,
        storeName: storeData?.name,
        storeAddress1: storeData?.address?.address1,
        paymentId: userData?.rememberLastPaymentMethodId,
        currentPaymentMethod,
        isOnlinePayment: currentPaymentMethod.isOnline,
        orderNote: currentCart.orderNote,
        finalAmount: cartBreakdown.buyerPays,
        // JSONs
        orderedItemsJSON: orderedItems,
        subtotalJSON,
        cartBreakdownJSON: cartBreakdown,
        deliveryAddressJSON: deliveryAddress,
        taxSettingsJSON: taxSettings,
    }

    return c.json({
        data: orderData,
        error: null as ErrorType
    }, 200);
}



export const sampleOrderData = {
    "userId": "u_fivft6y5dymlu",
    "userEmail": "thush@obite.co.uk",
    "userVerifiedPhoneNumber": "+16474250116",
    "websiteId": "web_obite_id_456",
    "websiteDefaultHostname": "www.obite.co.uk",
    "supportTeamWebsiteId": "web_obite_id_456",
    "supportTeamWebsiteDefaultHostname": "www.obite.co.uk",
    "storeId": "str_4_4_4",
    "orderType": "delivery",
    "pickupNickname": "thush",
    "storeLocationLat": 43.6654,
    "storeLocationLng": -79.4208,
    "storeName": "Flames Store",
    "storeAddress1": "122 Noemie Crossing",
    "paymentId": "stripe",
    "currentPaymentMethod": {
        "isOnline": true,
        "id": "stripe",
        "name": "Pay online",
        "description": "Stripe checkout (Credit/Debit Card, Apple Pay, Google Pay, Link...)",
        "icon": "CreditCard"
    },
    "isOnlinePayment": true,
    "finalAmount": 135.32,
    "orderedItemsJSON": [
        {
            "name": "Med Fries [350.0 Cals]",
            "quantity": 7,
            "details": "Select Option\n  1x Med Fries [350.0 Cals]\n",
            "shownFee": "$70"
        },
        {
            "name": "Big Mac Extra Value Meal [710-1140 Cals]",
            "quantity": 3,
            "details": "Side Item\n  1x Med Fries [350.0 Cals]\nDrink\n  1x Soft Drinks\n    1x Sml Diet Coke [1.0 Cals]\n      0x Ice [0.0 Cals]\n",
            "shownFee": "$30"
        }
    ],
    "subtotalJSON": {
        "itemTotal": 116.02,
        "tax": 15.08,
        "totalWithTax": 131.1,
        "shownFee": 116.02,
        "calculatedCustomServiceFees": [
            {
                "name": "Service Fee 1",
                "itemTotal": 11.78,
                "tax": 1.53,
                "totalWithTax": 13.31,
                "shownFee": 11.78
            }
        ],
        "bestDeliveryZone": {
            "itemTotal": 4.24,
            "tax": 0.55,
            "totalWithTax": 4.79,
            "shownFee": 4.24,
            "distanceFromStoreKm": 4.24,
            "totalDeliveryFee": 4.24
        }
    },
    "cartBreakdownJSON": {
        "buyerPays": 135.32,
        "tax": 15.08,
        "paymentProcessorFee": 4.22,
        "storeRevenue": 106.74,
        "allTransparencyBreakdown": [
            {
                "type": "tax",
                "currencyShownFee": "$15.08"
            },
            {
                "type": "paymentProcessorFee",
                "currencyShownFee": "$4.22"
            },
            {
                "type": "platform",
                "currencyShownFee": "$1.16"
            },
            {
                "type": "support",
                "currencyShownFee": "$2.32"
            },
            {
                "type": "marketing",
                "currencyShownFee": "$5.81"
            },
            {
                "type": "store",
                "currencyShownFee": "$106.74"
            }
        ],
        "buyerPaysTaxAndFeesName": "Taxes & Other Fees",
        "buyerPaysTaxAndFees": [
            {
                "type": "tax",
                "currencyShownFee": "$15.08"
            },
            {
                "type": "paymentProcessorFee",
                "currencyShownFee": "$4.22"
            }
        ],
        "buyerPaysTaxAndFeesShownFee": 19.3,
        "discount": 0,
        "platformFeeBreakdown": {
            "platform": {
                "totalWithTax": 1.31,
                "itemTotal": 1.16,
                "tax": 0.15
            },
            "support": {
                "totalWithTax": 2.62,
                "itemTotal": 2.32,
                "tax": 0.3
            },
            "marketing": {
                "totalWithTax": 6.56,
                "itemTotal": 5.81,
                "tax": 0.75
            }
        },
        "applicationFeeWithTax": 10.49,
        "applicationFeeWithoutTax": 9.29,
        "applicationFeeTax": 1.2
    },
    "deliveryAddressJSON": {
        "addressId": "1b8f6c7a-8e7f-4173-9a50-f41d0fa2171d",
        "country": "CA",
        "address1": "25 The Esplanade, Unit 604",
        "city": "Toronto",
        "state": "ON",
        "lat": 43.6462317,
        "lng": -79.37523929999999,
        "phoneNumber": "+16474250116",
        "nickname": "thush",
        "lastUpdatedTS": 1746236955089
    },
    "taxSettingsJSON": {
        "currency": "CAD",
        "currencySymbol": "$",
        "salesTaxType": "APPLY_TAX_ON_TOP_OF_PRICES",
        "taxCategories": [
            {
                "id": "2cb30fd1-48ba-4dfa-93c3-02df6c967809",
                "name": "TAX1",
                "deliveryRate": 13,
                "pickupRate": 13
            }
        ],
        "taxName": "GST-HST",
        "taxRateForDelivery": 13,
        "taxRateForServiceFees": 13
    }
}