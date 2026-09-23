"use client";
import { Edit, FileText, Loader2, Trash2 } from "lucide-react";
import type { BlogPost } from "./types";
interface Props { posts: BlogPost[]; loading: boolean; onEdit: (post: BlogPost) => void; onDelete: (id: string) => void; }
export function BlogTable({ posts, loading, onEdit, onDelete }: Props) { return (<>
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
                          onClick={() => onEdit(post)}
                          className="p-1.5 rounded-md hover:bg-cream border border-transparent hover:border-border text-ink-muted hover:text-ink transition-all"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(post.id)}
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
</>
); }
