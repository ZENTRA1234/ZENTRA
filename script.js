/* ZENTRA Intelligence — frontend script compatible with the current index.html */
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const STORAGE_KEY = "zentraData:guest";
  const DEFAULT_DATA = {
    projects: [], tasks: [], notes: [], ideas: [], xp: 0,
    calendar: [], communityPosts: [], privateCommunities: [], groupChats: [],
    friends: [], messageRequests: [], messages: [], notifications: [], files: [], trash: [],
    displayName: "", email: "", language: "tr", theme: "dark"
  };

  let data = { ...DEFAULT_DATA };
  let storageKey = STORAGE_KEY;
  let currentUser = null;
  let chatHistory = [];
  let csrfToken = null;

  const translations = {
    tr: {
      dashboard:"Kontrol Paneli", subtitle:"Kişisel zekâ ve çalışma alanın.",
      overview:"🏠 Genel Bakış", projects:"📁 Projeler", tasks:"✓ Görevler", ai:"🧠 ZENTRA AI", ideas:"💡 Fikirler", notes:"📝 Notlar",
      personal:"KİŞİSEL", rewards:"🏆 Ödüller", settings:"⚙️ Ayarlar", account:"👤 Hesabım",
      welcomeSmall:"GELECEĞE HOŞ GELDİN", welcomeTitle:"ZENTRA'ya Hoş Geldin.", welcomeText:"Fikirlerini keşfet, projelerini geliştir ve geleceğini tasarla.",
      explore:"Çalışma Alanını Keşfet →", yourOverview:"Genel Bakışın", yourProjects:"PROJELERİN", completedTasks:"TAMAMLANAN GÖREVLER", totalXP:"TOPLAM XP", exploreZentra:"ZENTRA'yı Keşfet",
      projectsTitle:"Projeler", projectsText:"Projelerini oluştur ve yönet.", tasksTitle:"Görevler", tasksText:"Günlük iş akışını düzenle.", aiTitle:"ZENTRA AI", aiText:"Akıllı yapay zekâ çalışma alanın.", ideasTitle:"Fikirler", ideasText:"Fikirlerini gerçeğe dönüştür.", notesTitle:"Notlar", notesText:"Notlarını kaydet ve düzenle.", rewardsTitle:"Ödüller", rewardsText:"XP kazan ve başarılar aç.", settingsTitle:"Ayarlar", settingsText:"Deneyimini kişiselleştir.",
      workspace:"ÇALIŞMA ALANI", projectsIntro:"Projelerini tek bir yerde oluştur ve takip et.", projectName:"Proje adı", projectDescription:"Açıklama", addProject:"+ Proje oluştur",
      tasksIntro:"Yapılacaklarını planla ve tamamladıkça XP kazan.", taskName:"Görev adı", taskProject:"İlgili proje (isteğe bağlı)", addTask:"+ Görev ekle",
      aiIntro:"Fikirlerini yaz, planlarını düzenle.", demoMode:"Gemini bağlantısı", aiWelcome:"Merhaba! Ben ZENTRA. Sana nasıl yardımcı olabilirim?", send:"Gönder",
      ideasIntro:"Aklına gelen fikirleri kaybetmeden sakla.", ideaTitle:"Fikir başlığı", ideaDescription:"Fikir açıklaması", saveIdea:"+ Fikir kaydet",
      notesIntro:"Önemli notlarını burada sakla.", noteTitle:"Not başlığı", noteContent:"Not içeriği", addNote:"+ Not kaydet",
      rewardsIntro:"Görevlerini tamamla, XP biriktir.", yourXP:"TOPLAM XP'N", achievements:"Başarımlar",
      settingsIntro:"Uygulama tercihlerini düzenle.", language:"Uygulama dili", dataTitle:"Yerel veriler", dataText:"Projelerin, görevlerin, notların ve fikirlerin bu tarayıcıda saklanır.", export:"Verileri dışa aktar", resetTitle:"Uygulama verilerini sıfırla", resetText:"Bu işlem bu tarayıcıdaki ZENTRA kayıtlarını siler.", reset:"Verileri sıfırla",
      accountTitle:"Hesabım", accountIntro:"Profil bilgilerini bu cihazda düzenle.", displayName:"Görünen ad", emailLabel:"E-posta (isteğe bağlı)", saveProfile:"Profili kaydet", accountNotice:"Profil bilgileri bu tarayıcıda saklanır.",
      premiumText:"Potansiyelini keşfet.", premiumOpen:"Premium'u keşfet →", premiumDescription:"Daha gelişmiş çalışma araçları için Premium alanı.", comingSoon:"YAKINDA", premiumFeature1:"Gelişmiş AI araçları", premiumFeature1Text:"AI bağlantısıyla gelişmiş özellikler.", premiumFeature2:"Bulut senkronizasyonu", premiumFeature2Text:"Cihazlar arası senkronizasyon.", premiumFeature3:"Gelişmiş raporlar", premiumFeature3Text:"Çalışma ilerlemeni ayrıntılı görüntüle.", premiumNotice:"Premium satın alma veya ödeme sistemi bu sürümde etkin değildir.", footer:"Fikirlerini Gerçeğe Dönüştür.",
      emptyProjects:"Henüz proje yok.", emptyTasks:"Henüz görev yok.", emptyIdeas:"Henüz fikir yok.", emptyNotes:"Henüz not yok.", delete:"Sil", done:"Tamamlandı", undo:"Geri al", noDescription:"Açıklama eklenmemiş.",
      projectAdded:"Proje kaydedildi.", taskAdded:"Görev kaydedildi.", ideaAdded:"Fikir kaydedildi.", noteAdded:"Not kaydedildi.", saved:"Kaydedildi.", confirmReset:"ZENTRA verilerini sıfırlamak istiyor musun?", aiError:"AI yanıtı alınamadı. Giriş yapmış olduğundan ve sunucunun çalıştığından emin ol."
    },
    en: {
      dashboard:"Dashboard", subtitle:"Your personal intelligence workspace.", overview:"🏠 Overview", projects:"📁 Projects", tasks:"✓ Tasks", ai:"🧠 ZENTRA AI", ideas:"💡 Ideas", notes:"📝 Notes", personal:"PERSONAL", rewards:"🏆 Rewards", settings:"⚙️ Settings", account:"👤 My Account",
      welcomeSmall:"WELCOME TO THE FUTURE", welcomeTitle:"Welcome to ZENTRA.", welcomeText:"Discover your ideas, develop your projects and design your future.", explore:"Explore Workspace →", yourOverview:"Your Overview", yourProjects:"YOUR PROJECTS", completedTasks:"COMPLETED TASKS", totalXP:"TOTAL XP", exploreZentra:"Explore ZENTRA",
      projectsTitle:"Projects", projectsText:"Create and manage your projects.", tasksTitle:"Tasks", tasksText:"Organize your daily workflow.", aiTitle:"ZENTRA AI", aiText:"Your intelligent AI workspace.", ideasTitle:"Ideas", ideasText:"Turn your ideas into reality.", notesTitle:"Notes", notesText:"Save and organize your notes.", rewardsTitle:"Rewards", rewardsText:"Earn XP and unlock achievements.", settingsTitle:"Settings", settingsText:"Personalize your experience.", workspace:"WORKSPACE", projectsIntro:"Create and track your projects in one place.", projectName:"Project name", projectDescription:"Description", addProject:"+ Create project", tasksIntro:"Plan your work and earn XP as you complete tasks.", taskName:"Task name", taskProject:"Related project (optional)", addTask:"+ Add task", aiIntro:"Write your ideas and organize your plans.", demoMode:"Gemini connection", aiWelcome:"Hello! I'm ZENTRA. How can I help you?", send:"Send", ideasIntro:"Save your ideas so you don't lose them.", ideaTitle:"Idea title", ideaDescription:"Idea description", saveIdea:"+ Save idea", notesIntro:"Keep your important notes here.", noteTitle:"Note title", noteContent:"Note content", addNote:"+ Save note", rewardsIntro:"Complete tasks and collect XP.", yourXP:"TOTAL XP", achievements:"Achievements", settingsIntro:"Manage application preferences.", language:"Application language", dataTitle:"Local data", dataText:"Your projects, tasks, notes and ideas are stored in this browser.", export:"Export data", resetTitle:"Reset application data", resetText:"This deletes ZENTRA records in this browser.", reset:"Reset data", accountTitle:"My Account", accountIntro:"Edit your profile on this device.", displayName:"Display name", emailLabel:"Email (optional)", saveProfile:"Save profile", accountNotice:"Profile information is stored in this browser.", premiumText:"Unlock your potential.", premiumOpen:"Explore Premium →", premiumDescription:"A space for advanced productivity tools.", comingSoon:"COMING SOON", premiumFeature1:"Advanced AI tools", premiumFeature1Text:"Advanced features with AI connection.", premiumFeature2:"Cloud sync", premiumFeature2Text:"Sync across devices.", premiumFeature3:"Advanced reports", premiumFeature3Text:"View your progress in detail.", premiumNotice:"Purchases and payments are not enabled in this version.", footer:"Turn Your Ideas Into Reality.", emptyProjects:"No projects yet.", emptyTasks:"No tasks yet.", emptyIdeas:"No ideas yet.", emptyNotes:"No notes yet.", delete:"Delete", done:"Completed", undo:"Undo", noDescription:"No description added.", projectAdded:"Project saved.", taskAdded:"Task saved.", ideaAdded:"Idea saved.", noteAdded:"Note saved.", saved:"Saved.", confirmReset:"Reset ZENTRA data?", aiError:"Could not get an AI response. Check that you are signed in and the server is running."
    }, 
    ar: {
      dashboard:"لوحة التحكم", subtitle:"مساحة عملك الذكية الشخصية.", overview:"🏠 نظرة عامة", projects:"📁 المشاريع", tasks:"✓ المهام", ai:"🧠 ZENTRA AI", ideas:"💡 الأفكار", notes:"📝 الملاحظات", personal:"شخصي", rewards:"🏆 المكافآت", settings:"⚙️ الإعدادات", account:"👤 حسابي",
      welcomeSmall:"مرحباً بك في المستقبل", welcomeTitle:"مرحباً بك في ZENTRA.", welcomeText:"اكتشف أفكارك وطوّر مشاريعك وصمّم مستقبلك.", explore:"استكشف مساحة العمل ←", yourOverview:"نظرة عامة", yourProjects:"مشاريعك", completedTasks:"المهام المكتملة", totalXP:"مجموع النقاط", exploreZentra:"اكتشف ZENTRA",
      projectsTitle:"المشاريع", projectsText:"أنشئ مشاريعك وأدرها.", tasksTitle:"المهام", tasksText:"نظّم سير عملك اليومي.", aiTitle:"ZENTRA AI", aiText:"مساحة عملك الذكية.", ideasTitle:"الأفكار", ideasText:"حوّل أفكارك إلى واقع.", notesTitle:"الملاحظات", notesText:"احفظ ملاحظاتك ونظّمها.", rewardsTitle:"المكافآت", rewardsText:"اكسب النقاط وافتح الإنجازات.", settingsTitle:"الإعدادات", settingsText:"خصّص تجربتك.", workspace:"مساحة العمل", projectsIntro:"أنشئ مشاريعك وتابعها في مكان واحد.", projectName:"اسم المشروع", projectDescription:"الوصف", addProject:"+ إنشاء مشروع", tasksIntro:"خطط لمهامك واكسب النقاط عند إكمالها.", taskName:"اسم المهمة", taskProject:"المشروع المرتبط (اختياري)", addTask:"+ إضافة مهمة", aiIntro:"اكتب أفكارك ونظّم خططك.", demoMode:"اتصال Gemini", aiWelcome:"مرحباً! أنا ZENTRA. كيف يمكنني مساعدتك؟", send:"إرسال", ideasIntro:"احفظ أفكارك حتى لا تفقدها.", ideaTitle:"عنوان الفكرة", ideaDescription:"وصف الفكرة", saveIdea:"+ حفظ الفكرة", notesIntro:"احتفظ بملاحظاتك المهمة هنا.", noteTitle:"عنوان الملاحظة", noteContent:"محتوى الملاحظة", addNote:"+ حفظ الملاحظة", rewardsIntro:"أكمل المهام واجمع النقاط.", yourXP:"مجموع النقاط", achievements:"الإنجازات", settingsIntro:"إدارة تفضيلات التطبيق.", language:"لغة التطبيق", dataTitle:"البيانات المحلية", dataText:"تُحفظ مشاريعك ومهامك وملاحظاتك وأفكارك في هذا المتصفح.", export:"تصدير البيانات", resetTitle:"إعادة ضبط البيانات", resetText:"سيؤدي هذا إلى حذف سجلات ZENTRA في هذا المتصفح.", reset:"إعادة ضبط", accountTitle:"حسابي", accountIntro:"عدّل ملفك الشخصي على هذا الجهاز.", displayName:"الاسم الظاهر", emailLabel:"البريد الإلكتروني (اختياري)", saveProfile:"حفظ الملف الشخصي", accountNotice:"تُحفظ معلومات الملف الشخصي في هذا المتصفح.", premiumText:"اكتشف إمكاناتك.", premiumOpen:"استكشف Premium ←", premiumDescription:"مساحة لأدوات عمل أكثر تقدماً.", comingSoon:"قريباً", premiumFeature1:"أدوات AI متقدمة", premiumFeature1Text:"ميزات متقدمة مع اتصال AI.", premiumFeature2:"مزامنة سحابية", premiumFeature2Text:"المزامنة بين الأجهزة.", premiumFeature3:"تقارير متقدمة", premiumFeature3Text:"اعرض تقدمك بالتفصيل.", premiumNotice:"الشراء والدفع غير متاحين في هذا الإصدار.", footer:"حوّل أفكارك إلى واقع.", emptyProjects:"لا توجد مشاريع بعد.", emptyTasks:"لا توجد مهام بعد.", emptyIdeas:"لا توجد أفكار بعد.", emptyNotes:"لا توجد ملاحظات بعد.", delete:"حذف", done:"مكتمل", undo:"تراجع", noDescription:"لم تتم إضافة وصف.", projectAdded:"تم حفظ المشروع.", taskAdded:"تم حفظ المهمة.", ideaAdded:"تم حفظ الفكرة.", noteAdded:"تم حفظ الملاحظة.", saved:"تم الحفظ.", confirmReset:"هل تريد إعادة ضبط بيانات ZENTRA؟", aiError:"تعذّر الحصول على رد AI. تحقق من تسجيل الدخول وتشغيل الخادم."
    }
  };

  function tr(key) {
    const lang = data.language === "ar" ? "ar" : (data.language === "en" || data.language === "de") ? "en" : "tr";
    return translations[lang]?.[key] || translations.tr[key] || key;
  }
  function uid() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`; }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(data)); }
    catch (error) { console.error("ZENTRA kayıt hatası:", error); alert("Veriler kaydedilemedi. Tarayıcı depolama alanını kontrol et."); }
    renderDashboard();
  }
  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === "object") data = { ...DEFAULT_DATA, ...saved };
      }
    } catch (error) { console.warn("ZENTRA kayıtları okunamadı:", error); }
    ["projects", "tasks", "notes", "ideas", "calendar", "communityPosts", "privateCommunities", "groupChats", "friends", "messageRequests", "messages", "notifications", "files", "trash"].forEach(key => { if (!Array.isArray(data[key])) data[key] = []; });
  }

  function applyLanguage() {
    const lang = ["tr", "en", "ar", "de"].includes(data.language) ? data.language : "tr";
    const effective = lang === "de" ? "en" : lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(el => {
      if (!el.dataset.originalText) el.dataset.originalText = el.textContent;
      const key = el.dataset.i18n;
      el.textContent = translations[effective]?.[key] || (effective === "tr" ? el.dataset.originalText : translations.en[key] || el.dataset.originalText);
    });
    const languageSelect = $("languageSelect");
    const settingsLanguage = $("settingsLanguage");
    if (languageSelect) languageSelect.value = lang;
    if (settingsLanguage) settingsLanguage.value = lang;
  }

  function showPage(id, updateHash = true) {
    const page = $("page-" + id) || $(id);
    if (!page) return;
    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
    page.classList.add("active");
    document.querySelectorAll(".menu-link").forEach(link => link.classList.toggle("active", link.dataset.page === id));
    const title = page.querySelector("h2")?.textContent || (id === "home" ? tr("dashboard") : "ZENTRA");
    if ($("pageTitle")) $("pageTitle").textContent = title;
    if (updateHash && location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    if (id === "tasks") renderTasks();
    if (id === "projects") renderProjects();
    if (id === "ideas") renderIdeas();
    if (id === "notes") renderNotes();
    if (id === "calendar") renderCalendar();
    if (id === "community" || id === "general-community") renderCommunity();
    if (id === "private-community") renderPrivateCommunities();
    if (id === "group-chat") renderGroupChat();
    if (id === "friends") renderFriends();
    if (id === "messages") renderMessages();
    if (id === "message-requests") renderMessageRequests();
    if (id === "files") renderFiles();
    if (id === "notifications") renderNotifications();
    if (id === "statistics") renderStatistics();
    if (id === "trash") renderTrash();
    if (id === "permissions") renderPermissions();
  }

  function renderDashboard() {
    if ($("statProjects")) $("statProjects").textContent = data.projects.length;
    if ($("statTasks")) $("statTasks").textContent = data.tasks.filter(task => task.completed).length;
    if ($("statXP")) $("statXP").textContent = data.xp || 0;
    if ($("rewardXP")) $("rewardXP").textContent = `${data.xp || 0} XP`;
    if ($("rewardLevel")) $("rewardLevel").textContent = `${data.language === "en" ? "Level" : data.language === "ar" ? "المستوى" : "Seviye"} ${Math.floor((data.xp || 0) / 100) + 1}`;
    renderAchievements();
  }
  function renderAchievements() {
    const host = $("achievementList"); if (!host) return;
    const completed = data.tasks.filter(t => t.completed).length;
    const achievements = [
      { icon:"🌱", title:"İlk adım", desc:"İlk görevini tamamla", unlocked:completed >= 1 },
      { icon:"🔥", title:"İstikrar", desc:"5 görev tamamla", unlocked:completed >= 5 },
      { icon:"🏆", title:"Görev ustası", desc:"10 görev tamamla", unlocked:completed >= 10 },
      { icon:"💡", title:"Fikir üreticisi", desc:"3 fikir kaydet", unlocked:data.ideas.length >= 3 }
    ];
    host.innerHTML = achievements.map(a => `<article class="panel"><h3>${a.icon} ${escapeHTML(a.title)}</h3><p>${escapeHTML(a.desc)}</p><small>${a.unlocked ? "✓ Açıldı" : "🔒 Kilitli"}</small></article>`).join("");
  }
  function renderProjects() {
    const host = $("projectList"); if (!host) return;
    $("projectCount").textContent = data.projects.length;
    if (!data.projects.length) { host.innerHTML = `<p class="notice">${tr("emptyProjects")}</p>`; return; }
    host.innerHTML = data.projects.map(p => `<article class="panel"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description || tr("noDescription"))}</p><small>${new Date(p.createdAt).toLocaleDateString()}</small><div class="item-actions"><button type="button" class="danger-button" data-delete-project="${p.id}">${tr("delete")}</button></div></article>`).join("");
  }
  function renderTasks() {
    const host = $("taskList"); if (!host) return;
    $("taskCount").textContent = data.tasks.length;
    const select = $("taskProject");
    if (select) {
      const selected = select.value;
      select.innerHTML = `<option value="">${data.language === "en" ? "General task" : "Genel görev"}</option>` + data.projects.map(p => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("");
      select.value = selected;
    }
    if (!data.tasks.length) { host.innerHTML = `<p class="notice">${tr("emptyTasks")}</p>`; return; }
    host.innerHTML = data.tasks.map(task => `<article class="panel task-item"><div><h3 style="${task.completed ? "text-decoration:line-through;opacity:.65" : ""}">${escapeHTML(task.name)}</h3><small>${escapeHTML(data.projects.find(p => p.id === task.projectId)?.name || "")}</small></div><div class="item-actions"><button type="button" class="button" data-toggle-task="${task.id}">${task.completed ? tr("undo") : tr("done")}</button><button type="button" class="danger-button" data-delete-task="${task.id}">${tr("delete")}</button></div></article>`).join("");
  }
  function renderIdeas() {
    const host = $("ideaList"); if (!host) return;
    $("ideaCount").textContent = data.ideas.length;
    if (!data.ideas.length) { host.innerHTML = `<p class="notice">${tr("emptyIdeas")}</p>`; return; }
    host.innerHTML = data.ideas.map(idea => `<article class="panel"><h3>${escapeHTML(idea.title)}</h3><p>${escapeHTML(idea.description || tr("noDescription"))}</p><button type="button" class="danger-button" data-delete-idea="${idea.id}">${tr("delete")}</button></article>`).join("");
  }
  function renderNotes() {
    const host = $("noteList"); if (!host) return;
    $("noteCount").textContent = data.notes.length;
    if (!data.notes.length) { host.innerHTML = `<p class="notice">${tr("emptyNotes")}</p>`; return; }
    host.innerHTML = data.notes.map(note => `<article class="panel"><h3>${escapeHTML(note.title)}</h3><p>${escapeHTML(note.content).replace(/\n/g,"<br>")}</p><small>${new Date(note.createdAt).toLocaleString()}</small><div class="item-actions"><button type="button" class="danger-button" data-delete-note="${note.id}">${tr("delete")}</button></div></article>`).join("");
  }

  function addNotification(message) {
    data.notifications.unshift({ id:uid(), message:String(message), date:new Date().toISOString(), read:false });
    data.notifications = data.notifications.slice(0, 100);
  }

  function moveToTrash(type, item) {
    if (!item) return;
    data.trash.unshift({ id:uid(), type, item, deletedAt:new Date().toISOString() });
    addNotification("Bir öğe Geri Dönüşüm Kutusu'na taşındı.");
  }

  function renderCalendar() {
    const host = $("calendarList"); if (!host) return;
    if (!data.calendar.length) { host.innerHTML = '<p class="notice">Henüz takvim etkinliği yok.</p>'; return; }
    host.innerHTML = data.calendar.slice().sort((a,b) => String(a.date).localeCompare(String(b.date))).map(item => `<article class="panel"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description || "")}</p><small>${escapeHTML(item.date || "Tarih belirtilmedi")}</small><div class="item-actions"><button type="button" class="danger-button" data-delete-calendar="${item.id}">Sil</button></div></article>`).join("");
  }

  function renderCommunity() {
    const host = $("communityFeed"); if (!host) return;
    if (!data.communityPosts.length) { host.innerHTML = '<p class="notice">Henüz topluluk gönderisi yok.</p>'; return; }
    host.innerHTML = data.communityPosts.map(post => `<article class="panel"><p>${escapeHTML(post.text)}</p><small>${escapeHTML(post.author || "Ben")} · ${new Date(post.createdAt).toLocaleString()}</small></article>`).join("");
  }

  function renderPrivateCommunities() {
    const host = $("privateCommunityList"); if (!host) return;
    if (!data.privateCommunities.length) { host.innerHTML = '<p class="notice">Henüz özel topluluk oluşturulmadı.</p>'; return; }
    host.innerHTML = data.privateCommunities.map(group => `<article class="panel"><h3>${escapeHTML(group.name)}</h3><p>${escapeHTML(group.description || "")}</p><small>Erişim: ${escapeHTML(group.access || "Davet")}</small></article>`).join("");
  }

  function renderGroupChat() {
    const host = $("groupChatMessages"); if (!host) return;
    const selected = $("groupChatSelect")?.value || "";
    const messages = data.groupChats.filter(message => !selected || message.groupId === selected);
    host.innerHTML = messages.length ? messages.map(message => `<article class="panel"><strong>${escapeHTML(message.author || "Ben")}</strong><p>${escapeHTML(message.text)}</p><small>${new Date(message.createdAt).toLocaleString()}</small></article>`).join("") : '<p class="notice">Bu grupta henüz mesaj yok.</p>';
    host.scrollTop = host.scrollHeight;
  }

  function renderFriends() {
    const host = $("friendList"); if (!host) return;
    host.innerHTML = data.friends.length ? data.friends.map(friend => `<article class="panel"><strong>${escapeHTML(friend.name)}</strong><small>${escapeHTML(friend.status || "Arkadaş")}</small></article>`).join("") : '<p class="notice">Henüz arkadaş eklenmedi.</p>';
  }

  function renderMessages() {
    const host = $("privateChatMessages"); if (!host) return;
    const recipient = $("messageRecipient")?.value?.trim().toLowerCase() || "";
    const messages = data.messages.filter(message => message.recipient.toLowerCase() === recipient);
    host.innerHTML = messages.length ? messages.map(message => `<article class="panel"><strong>${escapeHTML(message.sender || "Ben")}</strong><p>${escapeHTML(message.text)}</p><small>${new Date(message.createdAt).toLocaleString()}</small></article>`).join("") : '<p class="notice">Bu konuşmada henüz mesaj yok. Mesajlar şu anda yalnızca bu tarayıcıda demo olarak saklanır.</p>';
    host.scrollTop = host.scrollHeight;
  }

  function renderMessageRequests() {
    const host = $("messageRequestList"); if (!host) return;
    host.innerHTML = data.messageRequests.length ? data.messageRequests.map(request => `<article class="panel"><strong>${escapeHTML(request.name)}</strong><p>${escapeHTML(request.message || "Mesaj isteği")}</p></article>`).join("") : '<p class="notice">Bekleyen mesaj isteği yok.</p>';
  }

  function renderFiles() {
    const host = $("fileList"); if (!host) return;
    host.innerHTML = data.files.length ? data.files.map(file => `<article class="panel"><strong>${escapeHTML(file.name)}</strong><small>${escapeHTML(file.size || "Boyut bilgisi yok")} · ${new Date(file.addedAt).toLocaleString()}</small></article>`).join("") : '<p class="notice">Henüz dosya seçilmedi.</p>';
  }

  function renderNotifications() {
    const host = $("notificationList"); if (!host) return;
    host.innerHTML = data.notifications.length ? data.notifications.map(item => `<article class="panel"><p>${escapeHTML(item.message)}</p><small>${new Date(item.date).toLocaleString()} · ${item.read ? "Okundu" : "Okunmadı"}</small></article>`).join("") : '<p class="notice">Henüz bildirim yok.</p>';
  }

  function renderStatistics() {
    const completed = data.tasks.filter(task => task.completed).length;
    const values = { analyticsProjects:data.projects.length, analyticsTasks:data.tasks.length, analyticsXP:data.xp || 0, analyticsIdeas:data.ideas.length };
    Object.entries(values).forEach(([id,value]) => { if ($(id)) $(id).textContent = value; });
    const host = $("statisticsDetails");
    if (host) host.innerHTML = `<article class="panel">Tamamlanan görev: <strong>${completed}</strong> / ${data.tasks.length}</article><article class="panel">Tamamlanma oranı: <strong>${data.tasks.length ? Math.round(completed / data.tasks.length * 100) : 0}%</strong></article>`;
  }

  function renderTrash() {
    const host = $("trashList"); if (!host) return;
    host.innerHTML = data.trash.length ? data.trash.map(entry => `<article class="panel"><strong>${escapeHTML(entry.item?.name || entry.item?.title || entry.item?.text || "Silinen öğe")}</strong><small>${escapeHTML(entry.type)} · ${new Date(entry.deletedAt).toLocaleString()}</small><div class="item-actions"><button type="button" data-restore-trash="${entry.id}">Geri yükle</button><button type="button" class="danger-button" data-delete-trash="${entry.id}">Kalıcı sil</button></div></article>`).join("") : '<p class="notice">Geri Dönüşüm Kutusu boş.</p>';
  }

  function renderPermissions() {
    const role = currentUser?.role || "Standart kullanıcı";
    if ($("currentUserRole")) $("currentUserRole").textContent = role;
    const host = $("permissionsList");
    if (host) host.innerHTML = `<article class="panel"><strong>Hesap rolü</strong><p>${escapeHTML(role)}</p></article><article class="panel"><strong>Yetki yönetimi</strong><p>Gerçek rol ve erişim denetimi sunucu tarafında yapılandırılmalıdır.</p></article>`;
  }

  function bindNewFeatures() {
    $("calendarForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const title = $("calendarTitle")?.value?.trim() || $("eventTitle")?.value?.trim() || "";
      const date = $("calendarDate")?.value || $("eventDate")?.value || "";
      const description = $("calendarDescription")?.value?.trim() || $("eventDescription")?.value?.trim() || "";
      if (!title || !date) { alert("Etkinlik başlığı ve tarihi gerekli."); return; }
      data.calendar.unshift({ id:uid(), title, date, description });
      event.target.reset(); addNotification(`Takvime etkinlik eklendi: ${title}`); save(); renderCalendar(); renderNotifications();
    });
    $("communityPostForm")?.addEventListener("submit", event => {
      event.preventDefault(); const text = $("communityPostText")?.value?.trim(); if (!text) return;
      data.communityPosts.unshift({ id:uid(), text, author:data.displayName || currentUser?.username || "Ben", createdAt:new Date().toISOString() });
      event.target.reset(); addNotification("Topluluk gönderin bu cihazda kaydedildi."); save(); renderCommunity(); renderNotifications();
    });
    $("privateCommunityForm")?.addEventListener("submit", event => {
      event.preventDefault(); const name = $("privateCommunityName")?.value?.trim(); if (!name) return;
      data.privateCommunities.unshift({ id:uid(), name, description:$("privateCommunityDescription")?.value?.trim() || "", access:$("privateCommunityAccess")?.value || "invite", createdAt:new Date().toISOString() });
      event.target.reset(); save(); renderPrivateCommunities();
    });
    $("groupChatSelect")?.addEventListener("change", renderGroupChat);
    $("groupChatForm")?.addEventListener("submit", event => {
      event.preventDefault(); const text = $("groupChatInput")?.value?.trim(); if (!text) return;
      const groupId = $("groupChatSelect")?.value || "local-demo";
      data.groupChats.push({ id:uid(), groupId, text, author:data.displayName || "Ben", createdAt:new Date().toISOString() });
      event.target.reset(); save(); renderGroupChat();
    });
    $("friendSearchForm")?.addEventListener("submit", event => {
      event.preventDefault(); const host = $("friendSearchResults");
      if (host) host.innerHTML = '<p class="notice">Kullanıcı arama ve arkadaş ekleme için güvenli sunucu API’si henüz bağlı değil.</p>';
    });
    $("privateMessageForm")?.addEventListener("submit", event => {
      event.preventDefault(); const recipient = $("messageRecipient")?.value?.trim(); const input = $("privateMessageInput"); const text = input?.value?.trim();
      if (!recipient || !text) return;
      data.messages.push({ id:uid(), recipient, sender:data.displayName || "Ben", text, createdAt:new Date().toISOString() });
      event.target.reset(); if ($("messageRecipient")) $("messageRecipient").value = recipient; save(); renderMessages();
    });
    $("fileUploadButton")?.addEventListener("click", () => $("fileUploadInput")?.click());
    $("fileUploadInput")?.addEventListener("change", event => {
      const chosen = Array.from(event.target.files || []); if (!chosen.length) return;
      chosen.forEach(file => data.files.unshift({ id:uid(), name:file.name, size:`${Math.max(1, Math.round(file.size / 1024))} KB`, addedAt:new Date().toISOString() }));
      addNotification(`${chosen.length} dosya listelendi. Dosyaların içeriği sunucuya yüklenmedi.`); save(); renderFiles(); renderNotifications(); event.target.value = "";
    });
    $("markNotificationsRead")?.addEventListener("click", () => { data.notifications.forEach(item => item.read = true); save(); renderNotifications(); });
    $("emptyTrashButton")?.addEventListener("click", () => { if (!data.trash.length || !confirm("Geri Dönüşüm Kutusu kalıcı olarak boşaltılsın mı?")) return; data.trash = []; save(); renderTrash(); });
  }

  function bindForms() {
    $("projectForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const name = $("projectName").value.trim(); if (!name) return;
      data.projects.unshift({ id:uid(), name, description:$("projectDescription").value.trim(), createdAt:new Date().toISOString() });
      event.target.reset(); save(); renderProjects(); renderTasks();
    });
    $("taskForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const name = $("taskName").value.trim(); if (!name) return;
      data.tasks.unshift({ id:uid(), name, projectId:$("taskProject").value, completed:false, createdAt:new Date().toISOString() });
      event.target.reset(); save(); renderTasks();
    });
    $("ideaForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const title = $("ideaTitle").value.trim(); if (!title) return;
      data.ideas.unshift({ id:uid(), title, description:$("ideaDescription").value.trim(), createdAt:new Date().toISOString() });
      event.target.reset(); save(); renderIdeas();
    });
    $("noteForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const title = $("noteTitle").value.trim(), content = $("noteContent").value.trim();
      if (!title || !content) return;
      data.notes.unshift({ id:uid(), title, content, createdAt:new Date().toISOString() });
      event.target.reset(); save(); renderNotes();
    });
    $("accountForm")?.addEventListener("submit", event => {
      event.preventDefault(); data.displayName = $("displayName").value.trim(); data.email = $("accountEmail").value.trim(); save(); updateProfile(); alert(tr("saved"));
    });
    $("languageSelect")?.addEventListener("change", event => { data.language = event.target.value; applyLanguage(); save(); });
    $("settingsLanguage")?.addEventListener("change", event => { data.language = event.target.value; applyLanguage(); save(); });
    $("exportData")?.addEventListener("click", exportData);
    $("resetData")?.addEventListener("click", () => { if (!confirm(tr("confirmReset"))) return; data = { ...DEFAULT_DATA }; save(); applyLanguage(); renderAll(); });
    $("accountShortcut")?.addEventListener("click", () => showPage("account"));
    $("chatForm")?.addEventListener("submit", sendChat);
    bindNewFeatures();
  }
  function updateProfile() {
    const name = data.displayName || currentUser?.username || "Hesabım";
    if ($("topUserName")) $("topUserName").textContent = name;
    if ($("displayName")) $("displayName").value = data.displayName || currentUser?.username || "";
    if ($("accountEmail")) $("accountEmail").value = data.email || currentUser?.email || "";
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "zentra-verilerim.json"; a.click(); URL.revokeObjectURL(url);
  }
  function renderAll() {
    renderDashboard(); renderProjects(); renderTasks(); renderIdeas(); renderNotes(); updateProfile();
    renderCalendar(); renderCommunity(); renderPrivateCommunities(); renderGroupChat(); renderFriends();
    renderMessages(); renderMessageRequests(); renderFiles(); renderNotifications(); renderStatistics(); renderTrash(); renderPermissions();
  }

  async function getCsrf() {
    if (csrfToken) return csrfToken;
    const response = await fetch("/api/csrf-token", { credentials:"same-origin" });
    if (!response.ok) throw new Error("Güvenlik doğrulaması alınamadı.");
    const body = await response.json(); csrfToken = body.csrfToken; return csrfToken;
  }
  function addChat(role, text) {
    const host = $("chatMessages"); if (!host) return;
    const el = document.createElement("div"); el.className = `message ${role}`; el.textContent = text; host.appendChild(el); host.scrollTop = host.scrollHeight;
  }
  async function sendChat(event) {
    event.preventDefault();
    const input = $("chatInput"); const message = input.value.trim(); if (!message) return;
    if (!currentUser) { addChat("assistant", "Gemini sohbeti için önce hesabınla giriş yapmalısın. Bu arayüzde şu anda giriş formu bulunmuyor."); return; }
    addChat("user", message); input.value = "";
    const button = $("chatForm")?.querySelector("button"); if (button) button.disabled = true;
    try {
      await getCsrf();
      const messages = [...chatHistory, { role:"user", content:message }].slice(-12);
      const response = await fetch("/api/chat", { method:"POST", credentials:"same-origin", headers:{"Content-Type":"application/json","x-csrf-token":csrfToken}, body:JSON.stringify({ messages }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || tr("aiError"));
      const reply = String(result.reply || "Yanıt alınamadı."); chatHistory = [...messages, { role:"assistant", content:reply }].slice(-12); addChat("assistant", reply);
    } catch (error) { addChat("assistant", error.message || tr("aiError")); }
    finally { if (button) button.disabled = false; input.focus(); }
  }

  function bindNavigation() {
    document.querySelectorAll(".menu-link, .premium-card, .brand, [data-go], [data-page]").forEach(el => {
      el.addEventListener("click", event => {
        const id = el.dataset.page || el.dataset.go || (el.getAttribute("href") || "").replace(/^#/, "");
        if (!id || !$("page-" + id)) return;
        event.preventDefault(); showPage(id);
      });
    });
    window.addEventListener("hashchange", () => showPage(location.hash.slice(1) || "home", false));
    document.addEventListener("click", event => {
      const target = event.target.closest("button[data-delete-project],button[data-delete-task],button[data-toggle-task],button[data-delete-idea],button[data-delete-note],button[data-delete-calendar],button[data-restore-trash],button[data-delete-trash]");
      if (!target) return;
      if (target.dataset.deleteProject) { const item = data.projects.find(x => x.id === target.dataset.deleteProject); moveToTrash("project", item); data.projects = data.projects.filter(x => x.id !== target.dataset.deleteProject); save(); renderProjects(); renderTasks(); renderTrash(); }
      if (target.dataset.deleteTask) { const item = data.tasks.find(x => x.id === target.dataset.deleteTask); moveToTrash("task", item); data.tasks = data.tasks.filter(x => x.id !== target.dataset.deleteTask); save(); renderTasks(); renderTrash(); }
      if (target.dataset.toggleTask) {
        const task = data.tasks.find(x => x.id === target.dataset.toggleTask);
        if (task) { task.completed = !task.completed; data.xp = Math.max(0, (data.xp || 0) + (task.completed ? 10 : -10)); save(); renderTasks(); }
      }
      if (target.dataset.deleteIdea) { const item = data.ideas.find(x => x.id === target.dataset.deleteIdea); moveToTrash("idea", item); data.ideas = data.ideas.filter(x => x.id !== target.dataset.deleteIdea); save(); renderIdeas(); renderTrash(); }
      if (target.dataset.deleteNote) { const item = data.notes.find(x => x.id === target.dataset.deleteNote); moveToTrash("note", item); data.notes = data.notes.filter(x => x.id !== target.dataset.deleteNote); save(); renderNotes(); renderTrash(); }
      if (target.dataset.deleteCalendar) { const item = data.calendar.find(x => x.id === target.dataset.deleteCalendar); moveToTrash("calendar", item); data.calendar = data.calendar.filter(x => x.id !== target.dataset.deleteCalendar); save(); renderCalendar(); renderTrash(); }
      if (target.dataset.restoreTrash) {
        const entry = data.trash.find(x => x.id === target.dataset.restoreTrash);
        if (entry && Array.isArray(data[entry.type === "project" ? "projects" : entry.type === "task" ? "tasks" : entry.type === "idea" ? "ideas" : entry.type === "note" ? "notes" : entry.type === "calendar" ? "calendar" : "trash"])) {
          const key = entry.type === "project" ? "projects" : entry.type === "task" ? "tasks" : entry.type === "idea" ? "ideas" : entry.type === "note" ? "notes" : "calendar";
          data[key].unshift(entry.item); data.trash = data.trash.filter(x => x.id !== entry.id); save(); renderAll();
        }
      }
      if (target.dataset.deleteTrash) { data.trash = data.trash.filter(x => x.id !== target.dataset.deleteTrash); save(); renderTrash(); }
    });
  }

  async function identifyUser() {
    try {
      const response = await fetch("/api/me", { credentials:"same-origin" });
      if (!response.ok) return;
      const result = await response.json();
      if (result.user) {
        currentUser = result.user;
        storageKey = "zentraData:" + String(result.user.email || result.user.username).toLowerCase();
      }
    } catch (error) { console.info("Oturum bilgisi alınamadı; yerel misafir verileri kullanılacak."); }
  }

  function showAuth(show) {
    if ($('authScreen')) $('authScreen').classList.toggle('hidden', !show);
    if ($('appScreen')) $('appScreen').classList.toggle('hidden', show);
  }
  function authMessage(message, isError = true) {
    const host = $('authMessage');
    if (host) { host.textContent = message || ''; host.style.color = isError ? '#ffb4b4' : '#9ee6bd'; }
  }
  async function authRequest(endpoint, payload) {
    await getCsrf();
    const response = await fetch(endpoint, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'İşlem tamamlanamadı.');
    csrfToken = result.csrfToken || csrfToken;
    currentUser = result.user || null;
    if (!currentUser) throw new Error('Sunucu kullanıcı bilgisi döndürmedi.');
    storageKey = 'zentraData:' + String(currentUser.email || currentUser.username).toLowerCase();
    load(); renderAll(); updateProfile(); showAuth(false); authMessage('', false);
  }
  function bindAuth() {
    $('loginTab')?.addEventListener('click', () => {
      $('loginForm')?.classList.remove('hidden'); $('registerForm')?.classList.add('hidden');
      $('loginTab')?.classList.add('active'); $('registerTab')?.classList.remove('active'); authMessage('', false);
    });
    $('registerTab')?.addEventListener('click', () => {
      $('registerForm')?.classList.remove('hidden'); $('loginForm')?.classList.add('hidden');
      $('registerTab')?.classList.add('active'); $('loginTab')?.classList.remove('active'); authMessage('', false);
    });
    $('loginForm')?.addEventListener('submit', async event => {
      event.preventDefault(); const button = event.currentTarget.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      try { await authRequest('/api/login', { email: $('loginEmail').value.trim(), password: $('loginPassword').value }); }
      catch (error) { authMessage(error.message); }
      finally { if (button) button.disabled = false; }
    });
    $('registerForm')?.addEventListener('submit', async event => {
      event.preventDefault(); const button = event.currentTarget.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      try { await authRequest('/api/register', { username: $('registerUsername').value.trim(), email: $('registerEmail').value.trim(), password: $('registerPassword').value }); }
      catch (error) { authMessage(error.message); }
      finally { if (button) button.disabled = false; }
    });
    $('guestButton')?.addEventListener('click', () => {
      currentUser = null; storageKey = STORAGE_KEY; load(); renderAll(); showAuth(false);
    });
    $('logoutButton')?.addEventListener('click', async () => {
      try {
        await getCsrf();
        const response = await fetch('/api/logout', { method: 'POST', credentials: 'same-origin', headers: { 'x-csrf-token': csrfToken } });
        if (!response.ok) throw new Error('Çıkış yapılamadı.');
        currentUser = null; csrfToken = null; storageKey = STORAGE_KEY; data = { ...DEFAULT_DATA };
        load(); renderAll(); showAuth(true);
      } catch (error) { alert(error.message); }
    });
  }

  async function init() {
    await identifyUser();
    load();
    applyLanguage();
    bindNavigation();
    bindForms();
    bindAuth();
    renderAll();
    updateProfile();
    const initial = location.hash.slice(1);
    showPage($("page-" + initial) ? initial : "home", false);
    showAuth(!currentUser);
    const chatHost = $("chatMessages");
    if (chatHost && chatHost.children.length === 0) addChat("assistant", tr("aiWelcome"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
// ZENTRA MENÜ SAYFA GEÇİŞLERİ
document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll(".menu-link").forEach(function (link) {

    link.addEventListener("click", function (event) {
      event.preventDefault();

      const pageName = this.dataset.page;
      const target = document.getElementById("page-" + pageName);

      if (!target) {
        console.warn("Sayfa bulunamadı:", pageName);
        return;
      }

      document.querySelectorAll(".page").forEach(function (page) {
        page.classList.remove("active");
      });

      target.classList.add("active");

      document.querySelectorAll(".menu-link").forEach(function (menu) {
        menu.classList.remove("active");
      });

      this.classList.add("active");

      history.replaceState(null, "", "#" + pageName);
      window.scrollTo(0, 0);
    });

  });

});