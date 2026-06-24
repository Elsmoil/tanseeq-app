import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { cookies } from 'next/headers';

// تهيئة عميل السيرفر الآمن
const getSecureClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)
    .setKey(process.env.APPWRITE_API_KEY as string);
  return new Databases(client);
};

//  دالة حماية: تتحقق من وجود جلسة الإدارة التي زرعناها (mithaq_admin_session)
const verifyAdminSession = async () => {
  const cookieStore = await cookies();
  return cookieStore.has('mithaq_admin_session');
};
// 1. جلب جميع الطلبات
export async function GET() {
  try {
    //  التحقق الأمني قبل فعل أي شيء
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالدخول (Unauthorized)' }, { status: 401 });
    }

    const databases = getSecureClient();
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID as string,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string,
      [Query.limit(100), Query.orderDesc('$createdAt')]
    );
    return NextResponse.json({ success: true, documents: response.documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. تحديث حالة الطلب
export async function PATCH(req: Request) {
  try {
    const isAuthorized = await verifyAdminSession();
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك بالدخول (Unauthorized)' }, { status: 401 });
    }

    const body = await req.json();
    const { documentId, updates, newStatus } = body;

    //  ذكاء برمجي: دعم التوافقية! إذا أرسلت الواجهة 'newStatus' نستخدمه، وإذا أرسلت 'updates' نستخدمها
    const dataToUpdate = updates || (newStatus ? { status: newStatus } : null);

    if (!documentId || !dataToUpdate) {
      return NextResponse.json({ error: 'بيانات التحديث مفقودة' }, { status: 400 });
    }

    // تنظيف البيانات (إزالة حقول Appwrite المحمية حتى لا يحدث خطأ إذا أرسلت الواجهة الكائن بالكامل)
    delete dataToUpdate.$id;
    delete dataToUpdate.$createdAt;
    delete dataToUpdate.$updatedAt;
    delete dataToUpdate.$permissions;
    delete dataToUpdate.$databaseId;
    delete dataToUpdate.$collectionId;

    const databases = getSecureClient();
    const response = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID as string,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string,
      documentId,
      dataToUpdate
    );
    
    return NextResponse.json({ success: true, document: response });
  } catch (error: any) {
    console.error("API Patch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
