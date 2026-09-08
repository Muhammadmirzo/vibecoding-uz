"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Globe,
  Sparkles,
  Clock,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMd: string;
  coverUrl: string | null;
  authorName: string;
  category: string;
  seoTitle: string | null;
  seoDescription: string | null;
  status: "draft" | "published" | "scheduled" | "archived";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState<"edit" | "preview" | "split">("edit");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Vibe Coding");
  const [formAuthor, setFormAuthor] = useState("Mirzo Academy Team");
  const [formCoverUrl, setFormCoverUrl] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContentMd, setFormContentMd] = useState("");
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDescription, setFormSeoDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "published" | "scheduled" | "archived">("published");
  const [formPublishedAt, setFormPublishedAt] = useState("");

  const insertMarkdownSyntax = (prefix: string, suffix: string = "", defaultText: string = "matn") => {
    const textarea = document.getElementById("blog-content-textarea") as HTMLTextAreaElement | null;
    if (!textarea) {
      setFormContentMd((prev) => prev + `${prefix}${defaultText}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formContentMd.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = formContentMd.substring(0, start) + replacement + formContentMd.substring(end);
    setFormContentMd(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/blog?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to fetch blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [search, statusFilter]);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory("Vibe Coding");
    setFormAuthor("Mirzo Academy Team");
    setFormCoverUrl("");
    setFormExcerpt("");
    setFormContentMd("");
    setFormSeoTitle("");
    setFormSeoDescription("");
    setFormStatus("published");
    setFormPublishedAt(new Date().toISOString().slice(0, 16));
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormCategory(post.category);
    setFormAuthor(post.authorName);
    setFormCoverUrl(post.coverUrl || "");
    setFormExcerpt(post.excerpt || "");
    setFormContentMd(post.contentMd);
    setFormSeoTitle(post.seoTitle || "");
    setFormSeoDescription(post.seoDescription || "");
    setFormStatus(post.status);
    setFormPublishedAt(
      post.publishedAt
        ? new Date(post.publishedAt).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    );
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPost) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setFormSlug(generatedSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formTitle,
        slug: formSlug,
        category: formCategory,
        authorName: formAuthor,
        coverUrl: formCoverUrl || null,
        excerpt: formExcerpt || null,
        contentMd: formContentMd,
        seoTitle: formSeoTitle || null,
        seoDescription: formSeoDescription || null,
        status: formStatus,
        publishedAt: formPublishedAt ? new Date(formPublishedAt).toISOString() : new Date().toISOString(),
      };

      let res;
      if (editingPost) {
        res = await fetch(`/api/admin/blog/${editingPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPosts();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham ushbu maqolani o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchPosts();
      } else {
        alert(data.error || "O'chirishda xatolik");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    drafts: posts.filter((p) => p.status === "draft").length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            Blog CMS & Maqolalar Boshqaruvi
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Platforma blogidagi barcha maqolalarni tahrirlash, SEO moslashtirish va rejalashtirilgan chop etish.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-all shadow-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          Yangi Maqola Yaratish
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-cream-warm border border-border rounded-xl p-4">
          <div className="text-xs font-medium text-ink-muted">Jami Maqolalar</div>
          <div className="text-2xl font-bold text-ink mt-1">{stats.total}</div>
        </div>
        <div className="bg-cream-warm border border-border rounded-xl p-4">
          <div className="text-xs font-medium text-emerald-700 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Published
          </div>
          <div className="text-2xl font-bold text-ink mt-1">{stats.published}</div>
        </div>
        <div className="bg-cream-warm border border-border rounded-xl p-4">
          <div className="text-xs font-medium text-blue-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Rejalashtirilgan
          </div>
          <div className="text-2xl font-bold text-ink mt-1">{stats.scheduled}</div>
        </div>
        <div className="bg-cream-warm border border-border rounded-xl p-4">
          <div className="text-xs font-medium text-amber-700 flex items-center gap-1">
            <Edit className="w-3.5 h-3.5" /> Qoralamalar
          </div>
          <div className="text-2xl font-bold text-ink mt-1">{stats.drafts}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cream-warm p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Maqola sarlavhasi yoki slug bo'yicha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-ink-muted whitespace-nowrap">Holat:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto"
          >
            <option value="all">Barchasi</option>
            <option value="published">Chop etilgan</option>
            <option value="scheduled">Rejalashtirilgan</option>
            <option value="draft">Qoralama</option>
            <option value="archived">Arxivlangan</option>
          </select>
        </div>
      </div>

      {/* Articles Table / Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-cream-warm rounded-xl border border-border">
          <FileText className="w-12 h-12 text-ink-muted mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-semibold text-ink">Hali hech qanday maqola mavjud emas</h3>
          <p className="text-xs text-ink-muted mt-1">Yangi maqola yaratish uchun tugmani bosing.</p>
        </div>
      ) : (
        <div className="bg-cream-warm rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-deep border-b border-border text-xs uppercase text-ink-muted font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Maqola</th>
                  <th className="px-4 py-3.5">Kategoriya</th>
                  <th className="px-4 py-3.5">Muallif</th>
                  <th className="px-4 py-3.5">Holat</th>
                  <th className="px-4 py-3.5">Sana</th>
                  <th className="px-4 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => {
                  const statusColors: Record<string, string> = {
                    published: "bg-emerald-100 text-emerald-800 border-emerald-200",
                    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
                    draft: "bg-amber-100 text-amber-800 border-amber-200",
                    archived: "bg-gray-100 text-gray-800 border-gray-200",
                  };

                  const statusLabels: Record<string, string> = {
                    published: "Chop etilgan",
                    scheduled: "Rejalashtirilgan",
                    draft: "Qoralama",
                    archived: "Arxiv",
                  };

                  return (
                    <tr key={post.id} className="hover:bg-cream/60 transition-colors">
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-semibold text-ink truncate">{post.title}</div>
                        <div className="text-xs text-ink-muted truncate font-mono mt-0.5">/{post.slug}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-cream border border-border text-ink">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-ink-muted text-xs font-medium">{post.authorName}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            statusColors[post.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusLabels[post.status] || post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                        {new Date(post.publishedAt).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-1.5 rounded-md hover:bg-cream border border-transparent hover:border-border text-ink-muted hover:text-ink transition-all"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 border border-transparent hover:border-red-200 text-ink-muted hover:text-red-600 transition-all"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Blog Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-cream-warm border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold text-ink">
                  {editingPost ? "Maqolani Tahrirlash" : "Yangi Maqola Yaratish"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-ink mb-1">Maqola Sarlavhasi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Vibe Coding bilan 2 soatda AI bot yaratish"
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="vibe-coding-ai-bot"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Kategoriya *</label>
                  <input
                    type="text"
                    required
                    placeholder="Vibe Coding, AI Vositalar..."
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Muallif Ismi</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Rasm (Cover URL)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formCoverUrl}
                    onChange={(e) => setFormCoverUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Qisqacha Tavsif (Excerpt)</label>
                <textarea
                  rows={2}
                  placeholder="Maqola kartochkasida va qidiruv natijalarida ko'rinadigan qisqa mazmun..."
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Markdown Editor Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Maqola Matni (Markdown Editor)
                  </label>
                  <div className="flex bg-cream p-1 rounded-lg border border-border gap-1">
                    <button
                      type="button"
                      onClick={() => setEditorTab("edit")}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                        editorTab === "edit" ? "bg-accent text-white" : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      Tahrirlash
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("split")}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-all hidden sm:block ${
                        editorTab === "split" ? "bg-accent text-white" : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      Yonma-yon
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("preview")}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                        editorTab === "preview" ? "bg-accent text-white" : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      Oldindan ko'rish
                    </button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="min-h-[240px]">
                  {editorTab === "edit" && (
                    <div className="space-y-2">
                      {/* Rich Text Quick Formatting Toolbar */}
                      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-cream border border-border rounded-lg text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => insertMarkdownSyntax("**", "**", "qalin matn")}
                          className="px-2.5 py-1 rounded bg-cream-warm hover:bg-cream-deep border border-border text-ink font-bold transition-all"
                          title="Qalin Matn (Bold)"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownSyntax("*", "*", "og'ma matn")}
                          className="px-2.5 py-1 rounded bg-cream-warm hover:bg-cream-deep border border-border text-ink italic transition-all"
                          title="Og'ma Matn (Italic)"
                        >
                          I
                        </button>
                        <div className="h-4 w-px bg-border mx-1" />
                        <button
                          type="button"
                          onClick={() => insertMarkdownSyntax("# ", "", "Bosh Sarlavha")}
                          className="px-2 py-1 rounded bg-cream-warm hover:bg-cream-deep border border-border text-ink font-bold transition-all"
                          title="Asosiy Sarlavha (H1)"
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownSyntax("## ", "", "Kichik Sarlavha")}
                          className="px-2 py-1 rounded bg-cream-warm hover:bg-cream-deep border border-border text-ink font-bold transition-all"
                          title="Bo'lim Sarlavhasi (H2)"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownSyntax("### ", "", "Sub-sarlavha")}
                          className="px-2 py-1 rounded bg-cream-warm hover:bg-cream-deep border border-border text-ink font-bold transition-all"
                          title="Kichik Bo'lim (H3)"
                        >
                          H3
                        </button>
                        <div className="h-4 w-px bg-border mx-1" />
                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt("Havola (URL) manzilini kiriting:", "https://");
                            if (url) insertMarkdownSyntax("[", `](${url})`, "so'z yoki havola matni");
                          }}
                          className="px-2.5 py-1 rounded bg-cream-warm hover:bg-cream-deep border border-border text-accent font-medium underline transition-all"
                          title="URL Havola Ulash"
                        >
                          🔗 Link Ulash
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownSyntax("- ", "", "Ro'yxat elementi")}
                          className="px-2 py-1 rounded bg-cream-warm hover:bg-cream-deep border border-border text-ink transition-all"
                          title="Ro'yxat (Bullet List)"
                        >
                          • Ro'yxat
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownSyntax("> ", "", "Iqtibos matni...")}
                          className="px-2 py-1 rounded bg-cream-warm hover:bg-cream-deep border border-border text-ink transition-all"
                          title="Iqtibos (Blockquote)"
                        >
                          " Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownSyntax("`", "`", "kod")}
                          className="px-2 py-1 rounded bg-cream-warm hover:bg-cream-deep border border-border font-mono text-ink transition-all"
                          title="Kod bloki"
                        >
                          &lt;&gt; Code
                        </button>
                      </div>

                      <textarea
                        id="blog-content-textarea"
                        rows={12}
                        required
                        placeholder="Markdown formatida maqola yozing: # Sarlavha, **qalin**, [so'zga havola ulash](https://)..."
                        value={formContentMd}
                        onChange={(e) => setFormContentMd(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-cream border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  )}

                  {editorTab === "preview" && (
                    <div className="w-full p-4 min-h-[240px] bg-cream border border-border rounded-lg prose prose-stone max-w-none text-sm text-ink overflow-y-auto">
                      {formContentMd ? (
                        <div className="whitespace-pre-wrap">{formContentMd}</div>
                      ) : (
                        <p className="text-ink-muted italic">Matn kiritilmagan...</p>
                      )}
                    </div>
                  )}

                  {editorTab === "split" && (
                    <div className="grid grid-cols-2 gap-3 min-h-[240px]">
                      <textarea
                        rows={12}
                        required
                        placeholder="Markdown matn..."
                        value={formContentMd}
                        onChange={(e) => setFormContentMd(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-cream border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <div className="p-3 bg-cream border border-border rounded-lg overflow-y-auto text-xs whitespace-pre-wrap">
                        {formContentMd || <span className="text-ink-muted italic">Prevyu...</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Fields Section */}
              <div className="border border-border rounded-xl p-4 bg-cream/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" />
                  <h3 className="text-xs font-bold uppercase text-ink tracking-wider">
                    SEO va Metama'lumotlar
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">SEO Sarlavha (Title Tag)</label>
                    <input
                      type="text"
                      placeholder="Google qidiruvidagi sarlavha (max 60 ta belgi)"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">SEO Tavsif (Meta Description)</label>
                    <input
                      type="text"
                      placeholder="Google qidiruvidagi tavsif (max 160 ta belgi)"
                      value={formSeoDescription}
                      onChange={(e) => setFormSeoDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Scheduled Publishing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Chop etish holati *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="published">Chop etilgan (Published)</option>
                    <option value="scheduled">Rejalashtirilgan (Scheduled)</option>
                    <option value="draft">Qoralama (Draft)</option>
                    <option value="archived">Arxivlangan (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Chop etish vaqti (Publish Date)</label>
                  <input
                    type="datetime-local"
                    value={formPublishedAt}
                    onChange={(e) => setFormPublishedAt(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingPost ? "O'zgarishlarni Saqlash" : "Maqolani Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
