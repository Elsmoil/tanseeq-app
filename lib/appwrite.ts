import { Client, Databases, Account, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

export const databases = new Databases(client);
export const account = new Account(client); // 🌟 هذا هو السطر الجديد الذي أضفناه
export const uniqueId = ID.unique();
