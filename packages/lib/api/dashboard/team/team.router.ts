import { Hono } from "hono"
import type { HonoVariables } from "../../../hono/HonoVariables"

export const teamRouter = new Hono<HonoVariables>()