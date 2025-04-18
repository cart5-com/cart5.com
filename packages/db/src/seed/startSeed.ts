import { IS_PROD } from "@lib/utils/getEnvVariable";
import { createSeedUser } from "./createSeedUser";
import {
    addDomainToWebsite_Service,
    upsertStoreToWebsite_Service,
    createWebsite_Service,
    getWebsiteInfo_Service,
    updateWebsite_Service
} from "../services/website.service";
import { addMemberToTeam, insertInvitation } from "@db/services/team.service";
import { TEAM_PERMISSIONS } from "@lib/consts";
import {
    createStore_Service,
    updateStore_Service,
    updateStoreAddress_Service,
    updateStoreDeliveryZones_Service,
    updateStoreOpenHours_Service,
    updateStorePaymentMethods_Service,
    updateStoreTaxSettings_Service
} from "@db/services/store.service";
import type { CloudflareObjectType } from "./CloudflareObjectType";
import { faker } from '@faker-js/faker';
import { getNearbyStores_Service } from "@db/services/distance.service";
import type {
    DeliveryZone
} from "@lib/zod/deliverySchema";
import { calcDiamondShapePolygon } from "@lib/utils/calcDiamondShapePolygon";
import { processDataToSaveDeliveryZones } from "@lib/utils/calculateDeliveryZoneMinsMaxs";
import { readFileSync } from "fs";
import { importMenuFromCSV } from "@lib/utils/menuImport";
import { updateStoreMenu_Service } from "@db/services/store.service";
import { fileURLToPath, URL } from 'node:url'
import { getAsTaxSettings } from "@lib/utils/sales_tax_rates";
import { getStoreData_CacheJSON } from "@db/cache_json/store.cache_json";

const sampleMenuRoot1 = importMenuFromCSV(readFileSync(fileURLToPath(new URL("./sample-menu-1.csv", import.meta.url)), "utf8"));
const sampleMenuRoot2 = importMenuFromCSV(readFileSync(fileURLToPath(new URL("./sample-menu-2.csv", import.meta.url)), "utf8"));

export const startSeed = async () => {
    if (IS_PROD) {
        console.log("❌❌❌ SEED NOT ALLOWED IN PROD MODE ❌❌❌");
        return;
    }

    // first user kerem
    const email = "admin@mooisay.com";
    const password = "mooisaymoomoo";
    const name = "Moo";
    const profilePhotoUrl = "https://i.imgur.com/CUhzDlj_d.webp?maxwidth=760&fidelity=grand";


    const cart5DevAdminUser = await createSeedUser(email, password, name, profilePhotoUrl);
    const cart5DevWebsite = await createWebsite_Service(cart5DevAdminUser?.id!, "cart5dev", null, false, "web_cart5dev_id_123");
    await addDomainToWebsite_Service(cart5DevWebsite!.id, cart5DevWebsite!, "cart5dev.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(cart5DevWebsite!.id, cart5DevWebsite!, "www.cart5dev.com"); // default domain add as last one
    const cart5WebsiteInfo = await getWebsiteInfo_Service("www.cart5dev.com")

    const cuneytObite = await createSeedUser("cuneyt@obite.co.uk", password, "Cuneyt");
    const obiteWebsite = await createWebsite_Service(cuneytObite?.id!, "obite", cart5WebsiteInfo?.partnerInfo?.partnerTeamId!, false, "web_obite_id_456");
    await updateWebsite_Service(obiteWebsite!.id, {
        isPartner: true,
    })
    await addDomainToWebsite_Service(obiteWebsite!.id, obiteWebsite!, "obite.cart5dev.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(obiteWebsite!.id, obiteWebsite!, "obite.co.uk"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(obiteWebsite!.id, obiteWebsite!, "obite.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(obiteWebsite!.id, obiteWebsite!, "www.obite.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(obiteWebsite!.id, obiteWebsite!, "www.obite.co.uk"); // default domain

    const thushObite = await createSeedUser("thush@obite.co.uk", password, "thush");
    const invitation = await insertInvitation(thushObite?.email!, obiteWebsite!.ownerTeamId, [TEAM_PERMISSIONS.FULL_ACCESS], cuneytObite?.id!, obiteWebsite!.name);
    await addMemberToTeam(obiteWebsite!.ownerTeamId, thushObite?.id!, [TEAM_PERMISSIONS.FULL_ACCESS], invitation!.id);

    //flames.obite.com created by thush inside obite website
    const obiteTeamWebsiteInfo = await getWebsiteInfo_Service("www.obite.co.uk")
    const flamesWebsite = await createWebsite_Service(thushObite?.id!, "flames", obiteTeamWebsiteInfo?.partnerInfo?.partnerTeamId!, true, "web_flames_id_789");
    await addDomainToWebsite_Service(flamesWebsite!.id, flamesWebsite!, "flames.obite.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(flamesWebsite!.id, flamesWebsite!, "flames.obite.co.uk"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(flamesWebsite!.id, flamesWebsite!, "flames.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(flamesWebsite!.id, flamesWebsite!, "www.flames.com"); // default domain

    await updateWebsite_Service(flamesWebsite!.id, {
        isMarketplace: false,
    })

    const flamesStoreAdminUser = await createSeedUser("flames_admin@flames.com", password, "Flames Admin");
    const invitationForFlamesStoreAdminUser = await insertInvitation(
        flamesStoreAdminUser?.email!,
        flamesWebsite!.ownerTeamId,
        [TEAM_PERMISSIONS.FULL_ACCESS],
        thushObite?.id!,
        flamesWebsite!.name
    );
    await addMemberToTeam(flamesWebsite!.ownerTeamId, flamesStoreAdminUser?.id!, [TEAM_PERMISSIONS.FULL_ACCESS], invitationForFlamesStoreAdminUser!.id);
    const cfRaw: CloudflareObjectType = (await (await fetch("https://workers.cloudflare.com/cf.json")).json());
    // create 300 stores with 5th one being real flames store
    const storesByThush = [];
    const baseLat = parseFloat(cfRaw.latitude);
    const baseLng = parseFloat(cfRaw.longitude);

    for (let i = 0; i < 300; i++) {
        let name = faker.company.name();

        const store = await createStore_Service(
            thushObite?.id!,
            name,
            obiteTeamWebsiteInfo?.partnerInfo?.partnerTeamId!,
            true,
            `str_${i}_${i}_${i}`
        );

        // Use Cloudflare data as a base for more realistic locations
        // For non-flame stores, spread them around the base location
        let lat, lng, city, state, postalCode;

        // Generate locations within reasonable distance from base
        lat = faker.location.latitude({ min: baseLat - 0.1, max: baseLat + 0.1, precision: 6 });
        lng = faker.location.longitude({ min: baseLng - 0.1, max: baseLng + 0.1, precision: 6 });
        if (i === 4) {
            lat = baseLat;
            lng = baseLng;
        }

        // Sometimes use the same city as base location
        if (faker.number.int({ min: 1, max: 10 }) <= 7) {
            city = cfRaw.city;
            state = cfRaw.regionCode;
            postalCode = cfRaw.postalCode;
        } else {
            city = faker.location.city();
            state = faker.location.state({ abbreviated: true });
            postalCode = faker.location.zipCode();
        }

        const streetNumber = faker.number.int({ min: 1, max: 9999 });
        const streetName = faker.location.street();
        const address2 = faker.helpers.maybe(() => `Apt ${faker.number.int({ min: 1, max: 999 })}`, { probability: 0.7 });

        await updateStoreAddress_Service(store!.id, {
            address1: `${streetNumber} ${streetName}`,
            address2: address2 || "",
            city: city,
            state: state,
            postalCode: postalCode,
            lat: lat,
            lng: lng
        });

        let offersDelivery = faker.number.int({ min: 0, max: 100 }) <= 70; // 70% chance of offering delivery
        let offersPickup = faker.number.int({ min: 0, max: 1 }) === 1;
        if (i === 4) {
            offersDelivery = true;
            offersPickup = true;
        }

        await updateStore_Service(store!.id, {
            offersDelivery,
            offersPickup,
        })

        await updateStoreTaxSettings_Service(store!.id, getAsTaxSettings(cfRaw.country, cfRaw.regionCode))

        if (offersDelivery) {
            let zones: DeliveryZone[] = [
                {
                    id: faker.string.uuid(),
                    name: "Circle Zone 1",
                    minCart: faker.number.int({ min: 0, max: 10 }),
                    deliveryFee: faker.number.int({ min: 0, max: 10 }),
                    deliveryFeePerKm: faker.number.int({ min: 0, max: 10 }),
                    shapeType: 'circle',
                    circleArea: {
                        center: {
                            lat: lat,
                            lng: lng
                        },
                        radius: faker.number.int({ min: 1000, max: 10000 })
                    },
                    isActive: faker.number.int({ min: 0, max: 1 }) === 1,
                },
                // add polygon zone
                {
                    id: faker.string.uuid(),
                    name: "Polygon Zone 1",
                    minCart: faker.number.int({ min: 0, max: 10 }),
                    deliveryFee: faker.number.int({ min: 0, max: 10 }),
                    deliveryFeePerKm: faker.number.int({ min: 0, max: 10 }),
                    shapeType: 'polygon',
                    polygonArea: calcDiamondShapePolygon(lat, lng, faker.number.float({ min: 0.01, max: 0.03 })),
                    isActive: faker.number.int({ min: 0, max: 1 }) === 1,
                },
                // add rectangle zone
                {
                    id: faker.string.uuid(),
                    name: "Rectangle Zone 1",
                    minCart: faker.number.int({ min: 0, max: 10 }),
                    deliveryFee: faker.number.int({ min: 0, max: 10 }),
                    deliveryFeePerKm: faker.number.int({ min: 0, max: 10 }),
                    shapeType: 'rectangle',
                    rectangleArea: {
                        topLeft: {
                            lat: lat - faker.number.float({ min: 0.01, max: 0.03 }),
                            lng: lng - faker.number.float({ min: 0.01, max: 0.03 })
                        },
                        bottomRight: {
                            lat: lat + faker.number.float({ min: 0.01, max: 0.03 }),
                            lng: lng + faker.number.float({ min: 0.01, max: 0.03 })
                        }
                    },
                    isActive: faker.number.int({ min: 0, max: 1 }) === 1,
                }
            ];
            await updateStoreDeliveryZones_Service(store!.id, processDataToSaveDeliveryZones({
                zones
            }))
        }
        await updateStoreMenu_Service(store!.id, {
            menuRoot: Math.random() > 0.5 ? sampleMenuRoot1 : sampleMenuRoot2
        });

        await updateStoreOpenHours_Service(store!.id, {
            timezone: cfRaw.timezone,
            defaultOpenHours: {
                isActive: true,
                days: {
                    "0": {
                        // Sunday closed
                        isOpen24: false,
                        hours: []
                    },
                    "1": {
                        isOpen24: false,
                        hours: [
                            {
                                open: "09:00",
                                close: "23:00"
                            }
                        ]
                    },
                    "2": {
                        isOpen24: false,
                        hours: [
                            {
                                open: "09:00",
                                close: "23:00"
                            }
                        ]
                    },
                    "3": {
                        isOpen24: false,
                        hours: [
                            {
                                open: "09:00",
                                close: "23:00"
                            }
                        ]
                    },
                    "4": {
                        isOpen24: false,
                        hours: [
                            {
                                open: "09:00",
                                close: "23:00"
                            }
                        ]
                    },
                    "5": {
                        isOpen24: false,
                        hours: [
                            {
                                open: "09:00",
                                close: "23:00"
                            }
                        ]
                    },
                    "6": {
                        isOpen24: false,
                        hours: [
                            {
                                open: "09:00",
                                close: "23:00"
                            }
                        ]
                    },

                }
            }
        })

        await updateStorePaymentMethods_Service(store!.id, {
            defaultPaymentMethods: {
                isActive: true,
                cash: true,
                cardTerminal: true,
                customMethods: []
            }
        })

        storesByThush.push(store);
    }

    const flamesStore = storesByThush[4];
    await updateStore_Service(flamesStore!.id, {
        name: "Flames Store",
    })
    await updateStoreMenu_Service(flamesStore!.id, {
        menuRoot: sampleMenuRoot2
    });
    // invite flames admin to Real Flames store
    const invitationForFlamesStoreAdminUserRes = await insertInvitation(
        flamesStoreAdminUser?.email!,
        flamesStore?.ownerTeamId!,
        [TEAM_PERMISSIONS.FULL_ACCESS],
        thushObite?.id!,
        flamesStore?.name!
    );
    await addMemberToTeam(
        flamesStore?.ownerTeamId!,
        flamesStoreAdminUser?.id!,
        [TEAM_PERMISSIONS.FULL_ACCESS],
        invitationForFlamesStoreAdminUserRes!.id
    );

    await upsertStoreToWebsite_Service(
        flamesWebsite!.id,
        flamesStore!.id
    );

    console.time("storeDataJsonCron");
    for (const store of storesByThush) {
        await getStoreData_CacheJSON(store!.id, true);
    }
    console.timeEnd("storeDataJsonCron");


    const nearbyStores = await getNearbyStores_Service(
        baseLat,
        baseLng,
        null,
        "km",
        10,
        1,
        20, // 20 km
        "delivery",
        "distance_asc"
    );
    console.log("nearbyStores.stores.length:", nearbyStores.stores.length);

}

startSeed()