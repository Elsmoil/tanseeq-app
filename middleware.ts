import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. تحديد المسار الذي يحاول المستخدم الدخول إليه
  const path = request.nextUrl.pathname;

  // 2. التحقق مما إذا كان المسار هو مسار الإدارة
  const isAdminPath = path.startsWith('/admin');

  if (isAdminPath) {
    // 3. محاولة العثور على ملف تعريف ارتباط (Cookie) الخاص بـ Appwrite
    // ملاحظة: Appwrite عادة يخزن الجلسة في كوكي يبدأ بـ a_session_
    // بما أننا في خادم Edge للـ Middleware، نتحقق من وجود أي كوكي للجلسة كحل مبدئي
    const sessionCookie = request.cookies.getAll().find(cookie => cookie.name.startsWith('a_session_'));

    // 4. إذا لم يكن هناك جلسة، قم بتحويله إلى الصفحة الرئيسية أو صفحة تسجيل الدخول
    if (!sessionCookie) {
      // إعادة التوجيه إلى الصفحة الرئيسية (أو يمكنك تغييره إلى '/login' إذا كان لديك)
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // ⚠️ ملاحظة هامة: هذا فحص مبدئي فقط (يتحقق من تسجيل الدخول بشكل عام).
    // لحماية أقوى، يفضل أن تقوم صفحة /admin بطلب سريع (Fetch) 
    // للتحقق من أن هذا المستخدم تحديداً يملك صلاحية (Role) "مدير".
  }

  return NextResponse.next();
}

// 5. تحديد المسارات التي يجب أن يراقبها هذا الحارس
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
