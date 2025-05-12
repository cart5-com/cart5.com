import { getUserAsAStripeCustomer_Service, updateUserAsAStripeCustomer_Service } from "@db/services/user_data.service";
import { stripe } from "./stripe";

export const getStripeCustomerId_inStripePlatformAccount = async (
    userId: string,
    email: string,
    userVerifiedPhoneNumbers: string
) => {
    const userAsAStripeCustomer = await getUserAsAStripeCustomer_Service(userId, {
        stripeCustomerId: true,
    });
    let customerId = userAsAStripeCustomer?.stripeCustomerId ?? null;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: email,
            phone: userVerifiedPhoneNumbers,
            metadata: {
                userVerifiedPhoneNumbers,
                userId: userId,
                email: email,
            },
        });
        await updateUserAsAStripeCustomer_Service(userId, customer.id, {
            stripeCustomerId: customer.id
        });
        customerId = customer.id;
    }
    return customerId;
}
