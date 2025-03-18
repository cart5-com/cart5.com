
import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { restaurantRouter } from "./restaurant/_router";
import { websiteRouter } from "./website/_router";
import { teamRouter } from "./team/_router";
import { mustHaveUser } from "@api-hono/middlewares/mustHaveUser";

export const apiDashboard = new Hono<HonoVariables>()
    .use(mustHaveUser)
    .route('/restaurant', restaurantRouter)
    .route('/website', websiteRouter)
    .route('/team', teamRouter)
