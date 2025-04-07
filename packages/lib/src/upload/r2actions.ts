import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
    getEnvVariable,
    IS_PROD
} from "../utils/getEnvVariable";
import { KNOWN_ERROR } from "../types/errors";
import sharp from 'sharp';
import { devFakeUpload } from './devFakeUpload';

/*/
BUCKET_NAME_BLALALA

Location: Western Europe (WEUR)
Class: Standard

- CORS policy: [{"AllowedOrigins": ["https://*"],"AllowedMethods": ["GET"]}]

- how to get tokens
  - [R2 API tokens documentation](https://developers.cloudflare.com/r2/api/s3/tokens/)
  - [AWS CLI configuration guide](https://developers.cloudflare.com/r2/examples/aws/aws-cli/)


# EDGE CACHE CONFIG
CF Cache -> Cache Rules
use Cache Everything template
Custom filter expression: (http.host wildcard "BUCKET_PUBLIC_ORIGIN")
Cache eligibility -> Eligible for cache
Edge TTL : Ignore cache-control header and use this TTL: 10 minutes
Browser TTL: Override origin and use this TTL: 2 minutes

/*/


export const r2ImgUpload = async (file: File, key: string) => {
    const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${getEnvVariable("CLOUDFLARE_R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: getEnvVariable("CLOUDFLARE_R2_ACCESS_KEY_ID"),
            secretAccessKey: getEnvVariable("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
        },
    });

    const fileBuffer = await file.arrayBuffer();
    // const originalSize = fileBuffer.byteLength;

    try {
        const outputFormat = file.type === 'image/png' ? 'png' : 'jpeg';
        // Optimize the image
        const optimizedBuffer = await sharp(Buffer.from(fileBuffer))
            // Resizes the image to fit within 1024x1024 pixels while maintaining aspect ratio.
            // .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
            .toFormat(outputFormat, { quality: 80 })
            .toBuffer();

        // const optimizedSize = optimizedBuffer.byteLength;
        // const savedSize = originalSize - optimizedSize;
        // const savingsPercentage = ((savedSize / originalSize) * 100).toFixed(2);

        const url = getEnvVariable("CLOUDFLARE_R2_USER_UPLOADS_PUBLIC_ORIGIN") + "/" + key
        if (IS_PROD) {
            await s3Client.send(new PutObjectCommand({
                Bucket: getEnvVariable("CLOUDFLARE_R2_USER_UPLOADS_BUCKET_NAME"),
                Key: key,
                Body: optimizedBuffer,
                ContentType: file.type, // Maintain original content type
            }));
            // await r2PurgeCache([url]);
        } else {
            await devFakeUpload(optimizedBuffer, key);
        }

        return url;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new KNOWN_ERROR("FILE_UPLOAD_FAILED", "Failed to upload file");
    }
}

export const r2TextUpload = async (
    text: string,
    key: string,
    contentType: string = 'text/plain'
) => {
    const s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${getEnvVariable("CLOUDFLARE_R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: getEnvVariable("CLOUDFLARE_R2_ACCESS_KEY_ID"),
            secretAccessKey: getEnvVariable("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
        },
    });

    const textBuffer = Buffer.from(text);

    try {
        const url = getEnvVariable("CLOUDFLARE_R2_USER_UPLOADS_PUBLIC_ORIGIN") + "/" + key
        if (IS_PROD) {
            await s3Client.send(new PutObjectCommand({
                Bucket: getEnvVariable("CLOUDFLARE_R2_USER_UPLOADS_BUCKET_NAME"),
                Key: key,
                Body: textBuffer,
                ContentType: contentType,
            }));
            // await r2PurgeCache([url]);
        } else {
            await devFakeUpload(textBuffer, key);
        }
        return url;
    } catch (error) {
        console.error("Error uploading text:", error);
        throw new KNOWN_ERROR("TEXT_UPLOAD_FAILED", "Failed to upload text");
    }
}

export const r2PurgeCache = async (urls: string[]) => {
    const purgeUrl = `https://api.cloudflare.com/client/v4/zones/${getEnvVariable("CLOUDFLARE_PURGE_CACHE_ZONE_ID")}/purge_cache`
    const res = await fetch(purgeUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getEnvVariable("CLOUDFLARE_PURGE_CACHE_TOKEN")}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "files": urls
        })
    })
    console.log("Purge cache response:", await res.text());
    console.log("Purge cache response:");
}

export const cfPurgeAllEdgeCache = async () => {
    const purgeUrl = `https://api.cloudflare.com/client/v4/zones/${getEnvVariable("CLOUDFLARE_PURGE_CACHE_ZONE_ID")}/purge_cache`
    const res = await fetch(purgeUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getEnvVariable("CLOUDFLARE_PURGE_CACHE_TOKEN")}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "purge_everything": true
        })
    })
    console.log("Purge all cache response:", await res.text());
}

/*/

- CF PurgeCache
generate API TOKEN -> User API Tokens
all - zone - cache - purge API token summary
This API token will affect the below accounts and zones, along with their respective permissions
All zones - Cache Purge: Purge

curl - X POST https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_PURGE_CACHE_ZONE_ID/purge_cache \
-H "Authorization: Bearer $CLOUDFLARE_PURGE_CACHE_TOKEN" \
-H "Content-Type: application/json" \
--data '{"files":["https://$CLOUDFLARE_R2_USER_UPLOADS_PUBLIC_ORIGIN/path/to/purge"]}'

curl - X POST https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_PURGE_CACHE_ZONE_ID/purge_cache \
-H "Authorization: Bearer $CLOUDFLARE_PURGE_CACHE_TOKEN" \
-H "Content-Type: application/json" \
--data '{"purge_everything":true}'

/*/