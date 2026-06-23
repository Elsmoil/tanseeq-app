import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

// تهيئة عميل السيرفر الآمن
const getSecureClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)
    .setKey(process.env.APPWRITE_API_KEY as string);
  return new Databases(client);
};

// 1. جلب جميع الطلبات
export async function GET() {
  try {
    const databases = getSecureClient();
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID as string,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string,
      [Query.limit(100), Query.orderDesc('$createdAt')] // جلب وترتيب من السيرفر مباشرة
    );
    return NextResponse.json({ success: true, documents: response.documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. تحديث حالة الطلب
export async function PATCH(req: Request) {
  try {
    const { documentId, newStatus } = await req.json();
    if (!documentId || !newStatus) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const databases = getSecureClient();
    const response = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID as string,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string,
      documentId,
      { status: newStatus }
    );
    return NextResponse.json({ success: true, document: response });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
