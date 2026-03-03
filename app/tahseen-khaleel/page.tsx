"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface DocsTopic {
  id: string;
  title: string;
  content: string;
  order: number;
  published: boolean;
  updatedAt: string;
}

interface DocsResponse {
  topics: DocsTopic[];
  updatedAt: string;
}

export default function TahseenKhaleelPage() {
  const [topics, setTopics] = useState<DocsTopic[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [mobileTopicsOpen, setMobileTopicsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/docs", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load docs");
        const data = (await res.json()) as DocsResponse;
        if (cancelled) return;
        const nextTopics = Array.isArray(data.topics) ? data.topics : [];
        setTopics(nextTopics);
        if (nextTopics.length > 0) setActiveId(nextTopics[0].id);
      } catch {
        if (!cancelled) setTopics([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Handle anchor navigation for privacy-terms
    if (window.location.hash === "#privacy-terms") {
      setActiveId("privacy-terms");
      setTimeout(() => {
        document.getElementById("privacy-terms")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const activeTopic = useMemo(
    () => topics.find((topic) => topic.id === activeId) ?? topics[0] ?? null,
    [topics, activeId]
  );

  return (
    <main className="min-h-screen" dir="rtl" style={{ background: "#ebebec" }}>
      <header
        className="px-4 md:px-6 py-4 flex items-center justify-between"
        style={{ background: "#ffffff", borderBottom: "1px solid #e5e5e5" }}
      >
        <div>
          <h1 className="font-ui text-xl md:text-2xl font-bold" style={{ color: "#231f20" }}>
            تحسين خليل
          </h1>
          <p className="font-ui text-xs md:text-sm mt-1" style={{ color: "#767676" }}>
            التوثيق الرسمي لخليل
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="font-ui text-xs md:text-sm px-3 py-2 rounded-lg"
            style={{ background: "var(--color-accent-tint-12)", color: "var(--color-accent)" }}
          >
            العودة للمحادثة
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-8">
        <div className="md:hidden mb-4">
          <button
            type="button"
            onClick={() => setMobileTopicsOpen((prev) => !prev)}
            className="w-full px-4 py-3 rounded-xl font-ui text-sm font-medium text-right"
            style={{ background: "#ffffff", border: "1px solid #e5e5e5", color: "#231f20" }}
          >
            {mobileTopicsOpen ? "إخفاء الموضوعات" : "إظهار الموضوعات"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-5 md:gap-6">
          <section
            className="rounded-2xl p-5 md:p-6"
            style={{ background: "#ffffff", border: "1px solid #e5e5e5", minHeight: 420 }}
          >
            {loading ? (
              <p className="font-ui text-sm" style={{ color: "#767676" }}>جاري تحميل التوثيق...</p>
            ) : activeId === "privacy-terms" ? (
              <article id="privacy-terms">
                <h2 className="font-ui text-2xl font-bold mb-6" style={{ color: "#231f20" }}>
                  شروط الاستخدام وسياسة الخصوصية
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="font-ui text-xl font-bold mb-4" style={{ color: "#231f20" }}>
                      شروط الاستخدام (Terms of Use)
                    </h3>
                    <div className="space-y-4 font-ui leading-8 text-sm md:text-base" style={{ color: "#2f2f2f" }}>
                      <p>باستخدامك لتطبيق خليل، فإنك توافق على الالتزام بالشروط التالية:</p>
                      
                      <p><strong>القبول:</strong> استخدامك للتطبيق يعد موافقة كاملة على هذه الشروط. إذا كنت لا توافق على أي منها، يرجى التوقف عن استخدام الخدمة.</p>
                      
                      <div>
                        <p><strong>طبيعة الخدمة والشخصيات الافتراضية:</strong></p>
                        <ul className="list-disc mr-6 mt-2 space-y-2">
                          <li>يعتمد التطبيق على خوارزميات الذكاء الاصطناعي لتوليد الردود.</li>
                          <li><strong>تنبيه الهوية:</strong> جميع الشخصيات المتوفرة في التطبيق (مثل خليل، صاحب، ميحانة.. إلخ) هي نماذج افتراضية ذكية تهدف لمحاكاة أساليب معينة في الحوار وليست شخصيات حقيقية.</li>
                          <li>قد يقدم التطبيق أحياناً معلومات غير دقيقة؛ لذا فالردود ليست بديلاً عن الاستشارة المهنية المتخصصة (الطبية، القانونية، أو المالية).</li>
                        </ul>
                      </div>
                      
                      <p><strong>الحساب والأمن:</strong> أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور.</p>
                      
                      <div>
                        <p><strong>الاستخدام المسموح والمحظور:</strong></p>
                        <ul className="list-disc mr-6 mt-2 space-y-2">
                          <li>يُستخدم التطبيق للأغراض الشخصية فقط.</li>
                          <li>يُمنع استخدام التطبيق لإنتاج محتوى مسيء، أو يحض على الكراهية، أو ينتهك حقوق الآخرين.</li>
                          <li>يُمنع استخدام أي أدوات آلية لاستخراج البيانات (Scraping) من التطبيق.</li>
                        </ul>
                      </div>
                      
                      <p><strong>الملكية الفكرية:</strong> العلامة التجارية &quot;خليل&quot; وكافة البرمجيات والواجهات هي ملك للتطبيق.</p>
                      
                      <p><strong>التعديلات وإنهاء الخدمة:</strong> نحتفظ بالحق في تحديث هذه الشروط أو إغلاق الحسابات المخالفة في أي وقت.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-ui text-xl font-bold mb-4" style={{ color: "#231f20" }}>
                      سياسة الخصوصية (Privacy Policy)
                    </h3>
                    <div className="space-y-4 font-ui leading-8 text-sm md:text-base" style={{ color: "#2f2f2f" }}>
                      <p>نحن في خليل نلتزم بحماية خصوصيتك وبياناتك وفق المعايير التالية:</p>
                      
                      <div>
                        <p><strong>المعلومات التي نجمعها:</strong></p>
                        <ul className="list-disc mr-6 mt-2 space-y-2">
                          <li>بيانات الحساب: (الاسم، البريد الإلكتروني).</li>
                          <li>بيانات المحادثة: يتم تخزين نصوص المحادثات لتتمكن من العودة إليها لاحقاً.</li>
                          <li>بيانات تقنية: مثل نوع الجهاز وعنوان الـ IP لتحسين الأداء التقني.</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p><strong>كيفية استخدام المعلومات:</strong></p>
                        <ul className="list-disc mr-6 mt-2 space-y-2">
                          <li>توليد الردود الذكية وتخصيص تجربة المستخدم.</li>
                          <li>تطوير جودة النماذج (يتم ذلك بعد إخفاء هوية البيانات تماماً لضمان عدم نسبتها إليك).</li>
                        </ul>
                      </div>
                      
                      <p><strong>حماية وأمن البيانات:</strong> نستخدم تقنيات تشفير متطورة (Encryption) لحماية محادثاتك من الوصول غير المصرح به.</p>
                      
                      <div>
                        <p><strong>مشاركة البيانات:</strong></p>
                        <ul className="list-disc mr-6 mt-2 space-y-2">
                          <li>لا نقوم ببيع بياناتك الشخصية لأي طرف ثالث.</li>
                          <li>تتم معالجة البيانات عبر مزودي تقنيات الذكاء الاصطناعي كأطراف ثالثة تلتزم باتفاقيات سرية صارمة.</li>
                        </ul>
                      </div>
                      
                      <p><strong>حقوقك كمستخدم:</strong> يمكنك في أي وقت طلب تصحيح بياناتك، أو حذف حسابك نهائياً، مما سيؤدي لمسح كافة محادثاتك من خوادمنا فوراً.</p>
                      
                      <p><strong>ملفات تعريف الارتباط (Cookies):</strong> نستخدمها فقط لتسهيل تسجيل الدخول وحفظ تفضيلاتك.</p>
                      
                      <p><strong>للتواصل والاستفسار:</strong> إذا كان لديك أي سؤال، يمكنك مراسلتنا عبر: support@khaleel.app</p>
                    </div>
                  </div>
                </div>
              </article>
            ) : !activeTopic ? (
              <p className="font-ui text-sm" style={{ color: "#767676" }}>
                لا توجد موضوعات منشورة بعد. يمكن للإدارة إضافتها من لوحة التحكم.
              </p>
            ) : (
              <article>
                <h2 className="font-ui text-2xl font-bold mb-3" style={{ color: "#231f20" }}>
                  {activeTopic.title}
                </h2>
                <div className="space-y-4">
                  {activeTopic.content.split(/\n{2,}/).map((paragraph, idx) => (
                    <p
                      key={`${activeTopic.id}_${idx}`}
                      className="font-ui leading-8 text-sm md:text-base whitespace-pre-wrap"
                      style={{ color: "#2f2f2f" }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            )}
          </section>

          <aside
            className={`${mobileTopicsOpen ? "block" : "hidden"} md:block rounded-2xl p-4 md:p-5 h-fit md:sticky md:top-5`}
            style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}
          >
            <h3 className="font-ui text-sm font-semibold mb-3" style={{ color: "#555" }}>
              الموضوعات
            </h3>
            {loading ? (
              <p className="font-ui text-xs" style={{ color: "#888" }}>تحميل...</p>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveId("privacy-terms");
                    setMobileTopicsOpen(false);
                  }}
                  className="w-full text-right rounded-xl px-3 py-2.5 font-ui text-sm transition-colors"
                  style={{
                    background: activeId === "privacy-terms" ? "var(--color-accent-tint-12)" : "transparent",
                    border: activeId === "privacy-terms" ? "1px solid var(--color-accent-tint-25)" : "1px solid #efefef",
                    color: activeId === "privacy-terms" ? "var(--color-accent)" : "#444",
                    fontWeight: activeId === "privacy-terms" ? 700 : 500,
                  }}
                >
                  الشروط والخصوصية
                </button>
                
                {topics.map((topic) => {
                  const active = activeTopic?.id === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        setActiveId(topic.id);
                        setMobileTopicsOpen(false);
                      }}
                      className="w-full text-right rounded-xl px-3 py-2.5 font-ui text-sm transition-colors"
                      style={{
                        background: active ? "var(--color-accent-tint-12)" : "transparent",
                        border: active ? "1px solid var(--color-accent-tint-25)" : "1px solid #efefef",
                        color: active ? "var(--color-accent)" : "#444",
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {topic.title}
                    </button>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

