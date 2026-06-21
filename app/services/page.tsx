// app/services/page.tsx
"use client";

import { Scale, HeartHandshake, Users, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ServicesPage() {
  const router = useRouter();

  const services = [
    {
      id: 1,
      title: "مأذون شرعي",
      description: "نوفر لك تواصلاً مباشراً مع مأذوني أنكحة معتمدين لتسهيل وتوثيق عقد الزواج بكل يسر وسهولة، وفق الإجراءات الرسمية.",
      icon: <Scale className="w-8 h-8 text-[#c29b57]" />,
      available: true
    },
    {
      id: 2,
      title: "خدمة الخطابات",
      description: "نخبة من الخطابات الموثوقات لمساعدتك في البحث الدقيق والمخصص عن شريك حياتك المناسب بسرية تامة وموثوقية عالية.",
      icon: <HeartHandshake className="w-8 h-8 text-[#c29b57]" />,
      available: true
    },
    {
      id: 3,
      title: "استشارات أسرية",
      description: "مستشارون أسريون متخصصون لتقديم التوجيه والنصح للمقبلين على الزواج، لضمان بناء أسرة مستقرة وسعيدة.",
      icon: <Users className="w-8 h-8 text-[#c29b57]" />,
      available: false // لتوضيح أنها قادمة قريباً
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24 md:pb-10" dir="rtl">
      
      {/* الهيدر */}
      <div className="bg-[#0f172a] pt-14 pb-24 px-6 text-center rounded-b-[3rem] relative shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c29b57] rounded-full blur-[100px] opacity-10 -mr-20 -mt-20"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10 max-w-5xl mx-auto px-2">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition backdrop-blur-sm">
            <ChevronRight size={20} />
          </button>
          <div className="w-10"></div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 relative z-10">خدمات ميثاق</h1>
        <p className="text-sm text-[#c29b57] relative z-10 max-w-md mx-auto leading-relaxed">
          نقدم لك مجموعة من الخدمات المساندة المتكاملة لتسهيل رحلتك نحو زواج ناجح ومستقر.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden">
              
              {/* تأثير جمالي عند التمرير */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#c29b57]/5 rounded-full blur-2xl group-hover:bg-[#c29b57]/10 transition-colors"></div>

              <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center mb-6 shadow-md relative z-10 transform group-hover:-translate-y-1 transition-transform">
                {service.icon}
              </div>
              
              <h2 className="text-xl font-bold text-[#0f172a] mb-3 relative z-10">{service.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 relative z-10">
                {service.description}
              </p>

              <div className="relative z-10">
                {service.available ? (
                  <a 
                    href={`https://wa.me/966527585083?text=السلام عليكم، أود الاستفسار عن خدمة (${service.title}).`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all shadow-sm bg-slate-50 text-[#0f172a] border border-slate-200 hover:bg-[#0f172a] hover:text-white hover:border-[#0f172a]"
                  >
                    طلب الخدمة
                  </a>
                ) : (
                  <div className="w-full py-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed">
                    <Sparkles size={16} /> قريباً
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* بانر سفلي تحفيزي */}
        <div className="mt-12 bg-[#c29b57] rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
           <h3 className="text-white font-bold text-xl mb-2 relative z-10">هل تحتاج لمساعدة خاصة؟</h3>
           <p className="text-[#0f172a] font-medium text-sm mb-6 relative z-10 max-w-lg mx-auto">
             فريق ميثاق متواجد دائماً للرد على استفساراتك وتقديم الدعم اللازم لك في أي وقت.
           </p>
           <a href="https://wa.me/966527585083" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#0f172a] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#1e293b] transition-colors relative z-10">
             تواصل مع الدعم الفني
           </a>
        </div>

      </div>
    </div>
  );
}
