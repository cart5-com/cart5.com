import { KNOWN_ERROR } from '@lib/types/errors';
import type { User } from "@lib/types/UserType";
import { getUserData_Service } from "./user_data.service";
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
import type { OrderedItemsType } from "@lib/types/orderedItemsType";
import { getEstimatedTimeJSON } from "@lib/utils/estimatedTimeText";
import { ORDER_STATUS_OBJ } from "@lib/types/orderStatus";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { generateNumberOnlyOtp } from "@api-hono/utils/generateRandomOtp";

export const generateOrderData_Service = async (
    user: User,
    host: string,
    storeId: string,
) => {
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
        const url = 'https://' + getEnvVariable('PUBLIC_DOMAIN_NAME') + '/__p_api/gmaps/geocode?address=' + deliveryAddress.address1 + '&components=country:' + deliveryAddress.country
        const mapResult = await handleGeocode(url);
        checkGeocodeDistance(mapResult.data, {
            lat: deliveryAddress.lat!,
            lng: deliveryAddress.lng!
        });
    }
    const pickupNickname = (userData?.rememberLastNickname || user.name || 'unknown');
    const storeData = await getStoreData_CacheJSON(storeId);
    const { menuRoot, taxSettings, currentPaymentMethod, storeTimezone } = checkStoreDataBeforePlacingOrder(storeData, currentOrderType, userData);
    const orderedItems: OrderedItemsType = [];
    // TODO: should I save cart state to have a reorder button?
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
        lat: storeData?.address?.lat ?? 0,
        lng: storeData?.address?.lng ?? 0
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
    if (!WEBSITE || !WEBSITE.id || !WEBSITE.defaultHostname) {
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
    const subtotalJSON = subTotalWithDeliveryAndServiceFees;
    const estimatedTimeJSON = getEstimatedTimeJSON(
        currentOrderType,
        subTotalWithDeliveryAndServiceFees.bestDeliveryZone?.customEstimatedDeliveryTime,
        storeData?.defaultEstimatedDeliveryTime ?? undefined,
        storeData?.defaultEstimatedPickupTime ?? undefined
    )
    const orderStatus = currentPaymentMethod.id === 'stripe' ? ORDER_STATUS_OBJ.PENDING_PAYMENT_AUTHORIZATION : ORDER_STATUS_OBJ.CREATED;
    return {
        order: {
            shortOtp: generateNumberOnlyOtp(6),
            orderStatus,
            userId: user.id,
            userEmail: user.email,
            userVerifiedPhoneNumbers: userVerifiedPhoneNumbers.map(phone => phone.phoneNumber).join('|'),
            userName: user.name,
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
            storeAddress1: storeData?.address?.address1 ?? '',
            storeTimezone: storeTimezone,
            paymentId: userData?.rememberLastPaymentMethodId ?? '',
            isOnlinePayment: currentPaymentMethod.isOnline,
            orderNote: currentCart.orderNote,
            finalAmount: cartBreakdown.buyerPays,
            estimatedTimeJSON,
            // JSONs
            paymentMethodJSON: currentPaymentMethod,
            orderedItemsJSON: orderedItems,
            cartTotalsJSON: cartTotals,
            subtotalJSON,
            cartBreakdownJSON: cartBreakdown,
            deliveryAddressJSON: deliveryAddress,
            taxSettingsJSON: taxSettings,
        },
        carts: userData?.carts,
        storeData
    }
}