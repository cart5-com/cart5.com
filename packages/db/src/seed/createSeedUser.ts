import { upsertUserService } from "../services/user.service";
import { hashPassword } from '@api-hono/utils/password';
import { updateUserNameService } from "../services/user.service";
import { markEmailAsVerifiedService } from "../services/user.service";
import { updateUserPictureUrlService } from "../services/user.service";
import { IS_PROD } from "@lib/utils/getEnvVariable";


export const createSeedUser = async (
    email: string,
    password: string,
    name: string,
    profilePhotoUrl?: string
) => {
    if (IS_PROD) {
        console.log("❌❌❌ createSeedUser NOT ALLOWED IN PROD MODE ❌❌❌");
        return;
    }
    const user = await upsertUserService(email, await hashPassword(password));
    await updateUserNameService(user.id, name);
    await markEmailAsVerifiedService(email);
    if (profilePhotoUrl) {
        await updateUserPictureUrlService(user.id, profilePhotoUrl);
    }
    return user;
}