import path from 'path';
import fs from 'fs';
import { getEnvVariable } from '../utils/getEnvVariable';

// const directory = path.join(getEnvVariable("FAKE_CDN_FOLDER"), 'sample-upload-folder');
const directory = getEnvVariable("FAKE_CDN_FOLDER");
if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
}

export const devFakeUpload = async (optimizedBuffer: Buffer, key: string) => {
    const filePath = path.join(directory, key);
    const folderPath = path.dirname(filePath);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(filePath, optimizedBuffer);
    return filePath;
}