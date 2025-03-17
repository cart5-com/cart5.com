import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getMyTeams_Handler } from "./my_teams.controller";

export const teamRouter = new Hono<HonoVariables>()
    .get(
        '/my_teams',
        getMyTeams_Handler
    )