import { IS_PROD } from "@lib/utils/getEnvVariable";
import { createSeedUser } from "./createSeedUser";
import {
    addDomainToWebsite_Service,
    createWebsite_Service
} from "../services/website.service";
import { addMemberToTeam, getSupportTeamByHostname_Service, insertInvitation } from "@db/services/team.service";
import { TEAM_PERMISSIONS } from "@lib/consts";
import {
    createRestaurant_Service,
    updateRestaurant_Service,
    updateRestaurantAddress_Service,
    updateRestaurantOpenHours_Service
} from "@db/services/restaurant.service";
import type { CloudflareObjectType } from "./CloudflareObjectType";
import { faker } from '@faker-js/faker';
import { getNearbyRestaurants } from "@db/services/distance.service";



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
    const cart5DevWebsite = await createWebsite_Service(cart5DevAdminUser?.id!, "cart5dev", null, false);
    await addDomainToWebsite_Service(cart5DevWebsite.id, cart5DevWebsite, "cart5dev.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(cart5DevWebsite.id, cart5DevWebsite, "www.cart5dev.com"); // default domain add as last one
    const cart5Team_asSupportTeam = await getSupportTeamByHostname_Service("www.cart5dev.com")

    const cuneytObite = await createSeedUser("cuneyt@obite.co.uk", password, "Cuneyt");
    const obiteWebsite = await createWebsite_Service(cuneytObite?.id!, "obite", cart5Team_asSupportTeam?.teamId!, false);
    await addDomainToWebsite_Service(obiteWebsite.id, obiteWebsite, "obite.cart5dev.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(obiteWebsite.id, obiteWebsite, "obite.co.uk"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(obiteWebsite.id, obiteWebsite, "obite.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(obiteWebsite.id, obiteWebsite, "www.obite.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(obiteWebsite.id, obiteWebsite, "www.obite.co.uk"); // default domain

    const thushObite = await createSeedUser("thush@obite.co.uk", password, "thush");
    const invitation = await insertInvitation(thushObite?.email!, obiteWebsite.ownerTeamId, [TEAM_PERMISSIONS.FULL_ACCESS], cuneytObite?.id!, obiteWebsite.name);
    await addMemberToTeam(obiteWebsite.ownerTeamId, thushObite?.id!, [TEAM_PERMISSIONS.FULL_ACCESS], invitation.id);

    //flames.obite.com created by thush inside obite website
    const obiteTeam_asSupportTeam = await getSupportTeamByHostname_Service("www.obite.co.uk")
    const flamesWebsite = await createWebsite_Service(thushObite?.id!, "flames", obiteTeam_asSupportTeam?.teamId!, true);
    await addDomainToWebsite_Service(flamesWebsite.id, flamesWebsite, "flames.obite.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(flamesWebsite.id, flamesWebsite, "flames.obite.co.uk"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(flamesWebsite.id, flamesWebsite, "flames.com"); // secondary domain to redirect to default domain
    await addDomainToWebsite_Service(flamesWebsite.id, flamesWebsite, "www.flames.com"); // default domain

    const flamesRestaurantAdminUser = await createSeedUser("flames_admin@flames.com", password, "Flames Admin");
    const invitationForFlamesRestaurantAdminUser = await insertInvitation(
        flamesRestaurantAdminUser?.email!,
        flamesWebsite.ownerTeamId,
        [TEAM_PERMISSIONS.FULL_ACCESS],
        thushObite?.id!,
        flamesWebsite.name
    );
    await addMemberToTeam(flamesWebsite.ownerTeamId, flamesRestaurantAdminUser?.id!, [TEAM_PERMISSIONS.FULL_ACCESS], invitationForFlamesRestaurantAdminUser.id);
    const cfRaw: CloudflareObjectType = (await (await fetch("https://workers.cloudflare.com/cf.json")).json());
    // create 300 restaurants with 5th one being real flames restaurant
    const restaurantsByThush = [];
    const baseLat = parseFloat(cfRaw.latitude);
    const baseLng = parseFloat(cfRaw.longitude);

    for (let i = 0; i < 300; i++) {
        let name = faker.company.name();

        const rest = await createRestaurant_Service(
            thushObite?.id!,
            name,
            obiteTeam_asSupportTeam?.teamId!,
            true,
            `rest_${i}_${i}_${i}`
        );

        // Use Cloudflare data as a base for more realistic locations
        // For non-flame restaurants, spread them around the base location
        let lat, lng, city, state, postalCode;

        // Generate locations within reasonable distance from base
        lat = faker.location.latitude({ min: baseLat - 0.1, max: baseLat + 0.1, precision: 6 });
        lng = faker.location.longitude({ min: baseLng - 0.1, max: baseLng + 0.1, precision: 6 });

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

        await updateRestaurantAddress_Service(rest.id, {
            address1: `${streetNumber} ${streetName}`,
            address2: address2 || "",
            city: city,
            state: state,
            postalCode: postalCode,
            lat: lat,
            lng: lng
        });

        restaurantsByThush.push(rest);
    }

    const realFlamesRestaurant = restaurantsByThush[4];
    await updateRestaurant_Service(realFlamesRestaurant.id, {
        name: "Flames Restaurant",
    })
    await updateRestaurantAddress_Service(realFlamesRestaurant.id, {
        lat: baseLat,
        lng: baseLng
    })
    await updateRestaurantOpenHours_Service(realFlamesRestaurant.id, {
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
    // invite flames admin to Real Flames restaurant
    const invitationForFlamesRestaurantAdminUserRes = await insertInvitation(
        flamesRestaurantAdminUser?.email!,
        realFlamesRestaurant?.ownerTeamId!,
        [TEAM_PERMISSIONS.FULL_ACCESS],
        thushObite?.id!,
        realFlamesRestaurant?.name!
    );
    await addMemberToTeam(
        realFlamesRestaurant?.ownerTeamId!,
        flamesRestaurantAdminUser?.id!,
        [TEAM_PERMISSIONS.FULL_ACCESS],
        invitationForFlamesRestaurantAdminUserRes.id
    );


    const nearbyRestaurants = await getNearbyRestaurants(
        baseLat,
        baseLng,
        null,
        "km",
        10,
        1,
        1,
        "delivery",
        "distance_asc"
    );
    console.log(nearbyRestaurants);
}

startSeed()