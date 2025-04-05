
import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { storeRouter } from "./store/_router";
import { websiteRouter } from "./website/_router";
import { teamRouter } from "./team/_router";
import { mustHaveUser } from "@api-hono/middlewares/mustHaveUser";

export const apiDashboard = new Hono<HonoVariables>()
    .basePath('/dashboard')
    .use(mustHaveUser)
    .route('/store', storeRouter)
    .route('/website', websiteRouter)
    .route('/team', teamRouter)

export type ApiDashboardType = typeof apiDashboard;