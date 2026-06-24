"use client";

import { useEffect, useState } from "react";
import { Loader2, Menu, Heart, Search, CheckCircle2, AlertCircle, LayoutDashboard, Users, User, Settings, X, ShieldCheck, Clock, XCircle, Bell, ChevronLeft, Save, Eye, MapPin, Edit2, Briefcase, Plus } from "lucide-react";
import PlaceholderAvatar from "@/components/PlaceholderAvatar";

const RingIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 7.5L12 3l3.5 4.5h-7z" />
    <circle cx="12" cy="15" r="5.5" />
  </svg>
);

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); 
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<"overview" | "users" | "services" | "settings">("users");

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 💡 حالات التعديل الجديدة
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch('/api/admin/requests');
      const data = await res.json();
      
      if (data.success) {
        setRequests(data.documents);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      setErrorMsg("حدث خطأ أثناء جلب البيانات. تأكد من إعدادات قاعدة البيانات.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id, newStatus })
      });
      const data = await res.json();

      if (data.success) {
        setRequests(requests.map(req => req.$id === id ? { ...req, status: newStatus } : req));
        if (selectedUser && selectedUser.$id === id) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("حدث خطأ أثناء التحديث.");
    } finally {
      setActionLoading(null);
    }
  };

  // 💡 دالة حفظ التعديلات الجديدة
  const saveEdits = async () => {
    if (!selectedUser) return;
    setActionLoading('saving_edits');
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedUser.$id, updates: editFormData })
      });
      const data = await res.json();

      if (data.success) {
        // تحديث البيانات محلياً لتعكس التغيير فوراً
        setRequests(requests.map(req => req.$id === selectedUser.$id ? { ...req, ...editFormData } : req));
        setSelectedUser({ ...selectedUser, ...editFormData });
        setIsEditing(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error saving edits:", error);
      alert("حدث خطأ أثناء حفظ التعديلات.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("هل أنت متأكد من تسجيل الخروج؟")) {
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/login';
      } catch (error) {
        console.error("Logout error", error);
      }
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "pending" && (!req.status || req.status === "قيد المراجعة" || req.status === "pending")) ||
      (activeTab === "approved" && (req.status === "منشور" || req.status === "مقبول" || req.status === "approved")) ||
      (activeTab === "rejected" && (req.status === "مرفوض" || req.status === "rejected"));
    
    const matchesSearch = 
      req.request_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.$id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.whatsapp_number?.includes(searchQuery) ||
      req.region?.includes(searchQuery) ||
      req.city?.includes(searchQuery);

    return matchesTab && matchesSearch;
  });

  const handleOpenDetails = (user: any) => {
    setSelectedUser(user);
    setEditFormData({ ...user }); // تجهيز البيانات للتعديل المحتمل
    setIsEditing(false); // التأكد من أن وضع التعديل مغلق عند فتح نافذة جديدة
    setIsModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  return (
    <div className="font-sans bg-[#fcfaf6] text-[#0f172a] antialiased flex min-h-screen" dir="rtl">
      
      {/* القائمة الجانبية */}
      <nav className={`fixed inset-y-0 right-0 z-40 w-64 bg-[#0f172a] shadow-2xl flex flex-col transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute top-0 right-0 w-full h-40 bg-gradient-to-b from-[#c29b57]/20 to-transparent pointer-events-none"></div>

        <div className="p-6 mb-4 flex justify-between items-center relative z-10 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              ميثاق <span className="bg-[#c29b57] text-[#0f172a] text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold">Admin</span>
            </h2>
          </div>
          <button className="md:hidden text-white/50 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <ul className="flex flex-col space-y-1.5 px-4 relative z-10 flex-1 mt-4">
          <li>
            <button onClick={() => { setCurrentMenu("overview"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${currentMenu === "overview" ? "bg-[#c29b57] text-[#0f172a] font-bold shadow-md" : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"}`}>
              <LayoutDashboard size={20} /> <span className="text-sm">نظرة عامة</span>
            </button>
          </li>
          <li>
            <button onClick={() => { setCurrentMenu("users"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${currentMenu === "users" ? "bg-[#c29b57] text-[#0f172a] font-bold shadow-md" : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"}`}>
              <Users size={20} /> <span className="text-sm">إدارة الطلبات</span>
            </button>
          </li>
          <li>
            <button onClick={() => { setCurrentMenu("services"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${currentMenu === "services" ? "bg-[#c29b57] text-[#0f172a] font-bold shadow-md" : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"}`}>
              <Briefcase size={20} /> <span className="text-sm">إدارة الخدمات</span>
            </button>
          </li>
          <li>
            <button onClick={() => { setCurrentMenu("settings"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${currentMenu === "settings" ? "bg-[#c29b57] text-[#0f172a] font-bold shadow-md" : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"}`}>
              <Settings size={20} /> <span className="text-sm">إعدادات النظام</span>
            </button>
          </li>
        </ul>

        <div className="p-4 border-t border-white/10 flex flex-col gap-3">
          <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 text-xs font-bold transition flex items-center justify-center gap-2 bg-white/5 py-2 rounded-lg">
            تسجيل الخروج
          </button>
          <p className="text-[10px] text-slate-500 font-medium text-center">نظام إدارة ميثاق V1.1</p>
        </div>
      </nav>

      {isSidebarOpen && <div className="fixed inset-0 bg-[#0f172a]/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="flex-1 flex flex-col md:mr-64 relative z-10 w-full min-h-screen">
        <header className="w-full top-0 sticky bg-[#fcfaf6]/80 backdrop-blur-xl border-b border-slate-200 z-20 flex justify-between items-center px-4 md:px-8 py-3 h-16 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[#0f172a] p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-extrabold text-[#0f172a]">
              {currentMenu === "overview" && "نظرة عامة والإحصائيات"}
              {currentMenu === "users" && "إدارة ومراجعة الطلبات"}
              {currentMenu === "services" && "إدارة الخدمات والباقات"}
              {currentMenu === "settings" && "إعدادات النظام"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#c29b57] transition-colors shadow-sm"><Bell size={18} /></button>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#c29b57] bg-[#fdfaf4] flex items-center justify-center shadow-sm"><ShieldCheck size={18} className="text-[#c29b57]" /></div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 pb-32 max-w-[1400px] mx-auto w-full">
          
          {/* نظرة عامة */}
          {currentMenu === "overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
              {!loading && !errorMsg ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-8">
                    <div className="bg-[#0f172a] rounded-[1.5rem] p-5 shadow-lg border border-[#c29b57]/30 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute -left-4 -bottom-4 opacity-5 text-white transform group-hover:scale-110 transition-transform"><Users size={100} /></div>
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-[#c29b57] text-[11px] md:text-sm font-bold">إجمالي المسجلين</span>
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"><Users size={14} className="text-white" /></div>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-white relative z-10 mt-2">{requests.length}</h3>
                    </div>
                    {/* ... (باقي البطاقات الإحصائية كما هي في الكود السابق) ... */}
                    <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-emerald-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-500 text-[11px] md:text-sm font-bold leading-tight">الطلبات النشطة</span>
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center"><CheckCircle2 size={16} className="text-emerald-500" /></div>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-[#0f172a] mt-2">{requests.filter(r => r.status === 'منشور' || r.status === 'مقبول').length}</h3>
                    </div>
                    <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-amber-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-500 text-[11px] md:text-sm font-bold">قيد المراجعة</span>
                        <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center"><Clock size={16} className="text-amber-500" /></div>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-[#0f172a] mt-2">{requests.filter(r => !r.status || r.status === 'قيد المراجعة' || r.status === 'pending').length}</h3>
                    </div>
                    <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-rose-100 flex flex-col justify-between group hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-500 text-[11px] md:text-sm font-bold leading-tight">مرفوضة</span>
                        <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center"><XCircle size={16} className="text-rose-500" /></div>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-[#0f172a] mt-2">{requests.filter(r => r.status === 'مرفوض' || r.status === 'rejected').length}</h3>
                    </div>
                  </div>
                </>
              ) : (
                 <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#c29b57] animate-spin" /></div>
              )}
            </div>
          )}

          {/* 💡 الجدول الاحترافي لإدارة الطلبات */}
          {currentMenu === "users" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:border-[#c29b57] focus:ring-1 focus:ring-[#c29b57] py-2.5 pr-11 pl-4 text-xs md:text-sm text-[#0f172a] outline-none transition-all" 
                    placeholder="البحث برقم الملف، الاسم، أو المدينة..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {[{ id: 'all', label: 'الكل' }, { id: 'pending', label: 'قيد المراجعة' }, { id: 'approved', label: 'النشطة' }, { id: 'rejected', label: 'المرفوضة' }].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${activeTab === tab.id ? 'bg-[#0f172a] text-white border border-[#0f172a]' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm"><Loader2 className="w-8 h-8 text-[#c29b57] animate-spin" /></div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex flex-col items-center"><Search className="w-8 h-8 text-slate-300 mb-3" /><p className="text-slate-500 font-bold">لا توجد ملفات تطابق بحثك حالياً.</p></div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-[1.5rem] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">رقم الملف</th>
                          <th className="px-6 py-4">المستخدم</th>
                          <th className="px-6 py-4">العمر / الجنس</th>
                          <th className="px-6 py-4">المدينة</th>
                          <th className="px-6 py-4">تاريخ التسجيل</th>
                          <th className="px-6 py-4">الحالة</th>
                          <th className="px-6 py-4 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredRequests.map((req) => (
                          <tr key={req.$id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4 font-bold text-slate-400" dir="ltr">#{req.request_id || req.$id.substring(0,4)}</td>
                            <td className="px-6 py-4 font-extrabold text-[#0f172a] cursor-pointer hover:text-[#c29b57]" onClick={() => handleOpenDetails(req)}>
                              {req.first_name || 'مستخدم غير معروف'}
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">
                              {req.age} سنة • {req.type === 'women' ? 'أنثى' : 'ذكر'}
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{req.city || req.region || '-'}</td>
                            <td className="px-6 py-4 text-slate-500 text-xs font-medium" dir="ltr">{new Date(req.$createdAt).toLocaleDateString('en-GB')}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-md text-[10px] font-bold border ${
                                req.status === 'منشور' || req.status === 'مقبول' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                req.status === 'مرفوض' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {req.status || "قيد المراجعة"}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex items-center justify-center gap-2">
                              <button onClick={() => handleOpenDetails(req)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-[#c29b57] hover:text-white flex items-center justify-center transition" title="عرض وتعديل التفاصيل">
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 💡 إدارة الخدمات والباقات (جديد) */}
          {currentMenu === "services" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0f172a]">باقات الخدمات الإضافية</h2>
                  <p className="text-sm text-slate-500">إدارة الخدمات المدفوعة التي تقدمها المنصة للمسجلين</p>
                </div>
                <button className="bg-[#0f172a] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#16213b] transition">
                  <Plus size={16} /> إضافة خدمة جديدة
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><ShieldCheck size={24} /></div>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100">مفعل</span>
                  </div>
                  <h3 className="font-extrabold text-[#0f172a] text-lg mb-1">الباقة الماسية (توفيق)</h3>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">خدمة ترشيح ومطابقة يدوية دقيقة من قبل إدارة المنصة مع متابعة خاصة حتى الزواج.</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="font-black text-[#c29b57] text-lg">500 ريال</span>
                    <button className="text-sm font-bold text-slate-400 hover:text-[#0f172a] flex items-center gap-1"><Edit2 size={14} /> تعديل</button>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm opacity-60">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Heart size={24} /></div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200">معطل</span>
                  </div>
                  <h3 className="font-extrabold text-[#0f172a] text-lg mb-1">استشارة أسرية قبل الزواج</h3>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">جلسة استشارية متخصصة مع مستشار أسري معتمد لضمان التوافق النفسي والفكري.</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="font-black text-slate-400 text-lg">250 ريال</span>
                    <button className="text-sm font-bold text-slate-400 hover:text-[#0f172a] flex items-center gap-1"><Edit2 size={14} /> تعديل</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* إعدادات النظام */}
          {currentMenu === "settings" && (
            <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
              <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-[#0f172a] mb-6 border-b border-slate-100 pb-4">الإعدادات العامة للمنصة</h3>
                {/* ... (محتوى الإعدادات كما هو في الكود القديم) ... */}
                <p className="text-sm text-slate-500">واجهة الإعدادات تم تثبيتها كجزء من النسخة الأولية.</p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 💡 النافذة المنبثقة للتفاصيل والتعديل */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* الهيدر */}
            <div className="bg-[#0f172a] p-5 flex justify-between items-center relative shrink-0">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#c29b57]">
                  {isEditing ? <Edit2 size={18} /> : <Eye size={18} />}
                </div>
                <div>
                  <h3 className="font-black text-sm md:text-base">{isEditing ? "تعديل بيانات الطلب" : "تفاصيل طلب الزواج"}</h3>
                  <p className="text-[10px] text-slate-400" dir="ltr">#{selectedUser.request_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-[#c29b57] text-[#0f172a] text-xs font-bold rounded-lg hover:bg-[#dcb466] transition flex items-center gap-1">
                    <Edit2 size={12} /> تعديل
                  </button>
                )}
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-white/10 text-white/70 hover:text-white rounded-full flex items-center justify-center transition"><X size={16} /></button>
              </div>
            </div>

            {/* المحتوى */}
            <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
              
              {!isEditing ? (
                // --- وضع العرض (View Mode) ---
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-[#fcfaf6] border border-[#ebd9b4]/40 p-4 rounded-2xl">
                    <div className="w-14 h-14 bg-white border border-[#ebd9b4] rounded-full overflow-hidden shrink-0">
                      <PlaceholderAvatar gender={selectedUser.type} className="w-full h-full" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg text-[#0f172a]">{selectedUser.first_name || "مستخدم غير معروف"}</h4>
                      <p className="text-xs font-bold text-slate-500 mt-1" dir="ltr">{selectedUser.whatsapp_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 mb-1">العمر / الجنس</span>
                      <div className="text-xs font-bold text-[#0f172a]">{selectedUser.age} سنة • {selectedUser.type === 'women' ? 'أنثى' : 'ذكر'}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 mb-1">المدينة</span>
                      <div className="text-xs font-bold text-[#0f172a]">{selectedUser.city || selectedUser.region || "-"}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 mb-1">الحالة الاجتماعية</span>
                      <div className="text-xs font-bold text-[#0f172a]">{selectedUser.social_status || "-"}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 mb-1">نوع الزواج المطلوب</span>
                      <div className="text-xs font-bold text-[#0f172a]">{selectedUser.marriage_type || "-"}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 mb-1">المهنة</span>
                      <div className="text-xs font-bold text-[#0f172a]">{selectedUser.job || "-"}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 mb-1">الأصل / القبيلة</span>
                      <div className="text-xs font-bold text-[#0f172a]">{selectedUser.origin || "-"} {selectedUser.tribe_name ? `(${selectedUser.tribe_name})` : ''}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-2">النبذة التعريفية:</span>
                    <div className="bg-[#fcfaf6] p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                      {selectedUser.bio || "لا توجد تفاصيل إضافية."}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-2">المواصفات المطلوبة:</span>
                    <div className="bg-[#fcfaf6] p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                      {selectedUser.requirements || "لم يتم كتابة المواصفات."}
                    </div>
                  </div>
                </div>
              ) : (
                // --- وضع التعديل (Edit Mode) ---
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0f172a] mb-1">الاسم الأول أو المستعار</label>
                      <input type="text" name="first_name" value={editFormData.first_name || ""} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c29b57]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0f172a] mb-1">العمر</label>
                      <input type="number" name="age" value={editFormData.age || ""} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c29b57]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0f172a] mb-1">المدينة / المنطقة</label>
                      <input type="text" name="region" value={editFormData.region || editFormData.city || ""} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c29b57]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0f172a] mb-1">الحالة الاجتماعية</label>
                      <input type="text" name="social_status" value={editFormData.social_status || ""} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c29b57]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0f172a] mb-1">النبذة التعريفية عنك</label>
                    <textarea name="bio" value={editFormData.bio || ""} onChange={handleEditChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c29b57] resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0f172a] mb-1">المواصفات المطلوبة</label>
                    <textarea name="requirements" value={editFormData.requirements || ""} onChange={handleEditChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#c29b57] resize-none" />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition">إلغاء</button>
                    <button onClick={saveEdits} disabled={actionLoading === 'saving_edits'} className="px-4 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-lg hover:bg-[#16213b] transition flex items-center gap-2">
                      {actionLoading === 'saving_edits' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save size={14} /> حفظ التعديلات</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* الفوتر (أزرار القبول والرفض تظهر فقط في وضع العرض) */}
            {!isEditing && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 shrink-0">
                {actionLoading === selectedUser.$id ? (
                  <div className="w-full flex justify-center py-2"><Loader2 className="w-6 h-6 text-[#c29b57] animate-spin" /></div>
                ) : (
                  <>
                    {(!selectedUser.status || selectedUser.status === 'قيد المراجعة' || selectedUser.status === 'pending') && (
                      <>
                        <button onClick={() => updateStatus(selectedUser.$id, 'منشور')} className="flex-1 bg-[#0f172a] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#16213b] transition shadow-sm">قبول واعتماد الملف</button>
                        <button onClick={() => updateStatus(selectedUser.$id, 'مرفوض')} className="flex-1 bg-white border border-rose-200 text-rose-600 py-3 rounded-xl text-xs font-bold hover:bg-rose-50 transition shadow-sm">رفض الطلب</button>
                      </>
                    )}
                    {(selectedUser.status === 'منشور' || selectedUser.status === 'مرفوض' || selectedUser.status === 'مقبول') && (
                      <button onClick={() => updateStatus(selectedUser.$id, 'قيد المراجعة')} className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 transition shadow-sm flex items-center justify-center gap-2">
                        إعادة الملف إلى وضع قيد المراجعة
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
