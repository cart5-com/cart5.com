import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";

export const teamRouter = new Hono<HonoVariables>()