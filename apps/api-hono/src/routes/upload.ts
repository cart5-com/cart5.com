import { Hono } from "hono";
import type { HonoVariables } from "../types/HonoVariables";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { r2ImgUpload } from "@lib/upload/r2actions";
const MAX_FILE_SIZE = 5_242_880; // 5MB (5 * 1024 * 1024)
const MAX_FILE_SIZE_MB = 5;

export const apiUpload = new Hono<HonoVariables>()
    // will not work because of csrf checks
    // also zod file validation may fail in html forms

    // .get('/', async (c) => {
    //     return c.html(`
    //         <form action="upload/upload" method="post" enctype="multipart/form-data">
    //             <input type="text" name="title" />
    //             <input type="file" name="upload_file" />
    //             <input type="submit" />
    //         </form>
    //     `);
    // })
    .post(
        '/',
        zValidator('form', z.object({
            title: z.string().min(1, "Title is required"),
            file: z.instanceof(File)
                .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than ${MAX_FILE_SIZE_MB}MB`)
                .refine((file) => ['image/jpeg', 'image/png']
                    .includes(file.type), "Only JPEG and PNG files are allowed")
        })),
        async (c) => {
            const { title, file } = c.req.valid('form')
            return c.json({
                url: await r2ImgUpload(file, title),
                title,
                fileType: file.type,
                fileSize: file.size,
                fileName: file.name,
            });
        }
    )


export type ApiUploadType = typeof apiUpload;