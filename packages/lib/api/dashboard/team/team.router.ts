import { Hono } from "hono"
import type { HonoVariables } from "../../../hono/HonoVariables"
import { getMyTeams_Handler } from "./my_teams/team.my_teams.handler";

export const teamRouter = new Hono<HonoVariables>()
    .get(
        '/my_teams',
        getMyTeams_Handler
    ); 