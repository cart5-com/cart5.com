import { IS_PROD } from "@lib/utils/getEnvVariable";
import { createSeedUser } from "./createSeedUser";
import {
    addDomainToWebsite_Service,
    createWebsite_Service
} from "../services/website.service";
import { addMemberToTeam, getSupportTeamByHostname_Service, insertInvitation } from "@db/services/team.service";
import { TEAM_PERMISSIONS } from "@lib/consts";


const startSeed = async () => {
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
    const invitationForFlamesRestaurantAdminUser = await insertInvitation(flamesRestaurantAdminUser?.email!, flamesWebsite.ownerTeamId, [TEAM_PERMISSIONS.FULL_ACCESS], thushObite?.id!, flamesWebsite.name);
    await addMemberToTeam(flamesWebsite.ownerTeamId, flamesRestaurantAdminUser?.id!, [TEAM_PERMISSIONS.FULL_ACCESS], invitationForFlamesRestaurantAdminUser.id);
}



startSeed()