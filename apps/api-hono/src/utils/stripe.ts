import Stripe from "stripe";
import { getEnvVariable } from "@lib/utils/getEnvVariable";

export const stripe = new Stripe(getEnvVariable("STRIPE_SECRET_KEY"), {
    apiVersion: '2025-03-31.basil',
});