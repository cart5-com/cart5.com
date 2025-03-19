import { IS_PROD } from "@lib/utils/getEnvVariable";
import { createSeedUser } from "./createUser";
// import db from "../drizzle"
// import type { CloudflareObjectType } from "./cloudflareObjectType";


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

    // const cfRaw: CloudflareObjectType = (await (await fetch("https://workers.cloudflare.com/cf.json")).json());
    const user = await createSeedUser(email, password, name, profilePhotoUrl);
}



startSeed()