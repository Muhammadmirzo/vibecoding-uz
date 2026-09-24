import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { listPortfolios, updatePortfolio } from "@/features/portfolio/server/portfolio.service";
import { drizzlePortfolioRepository } from "@/features/portfolio/server/portfolio.repository";
import { getChatSettings, publicChatSettings } from "@/features/chat/server/settings.service";
import { portfolioUpdateSchema } from "@/lib/validations/portfolio";
import { result, toolError, type ToolDefinition } from "./types";
import { cursorInputSchema, cursorShape } from "../contracts";
import { decodeCursor, encodeCursor } from "../server/pagination";

const simple = (name: string, title: string, description: string, handler: ToolDefinition["handler"], readOnly = true, inputShape: ToolDefinition["inputShape"] = {}): ToolDefinition => ({ name, title, description, scope: "content:write", inputShape, readOnly, destructive: false, handler });
export const contentTools: ToolDefinition[] = [
  simple("portfolio_list", "Portfolio ro'yxati", "Nashriyot portfolio loyihalari ro'yxati.", async (input) => { try { const parsed = cursorInputSchema.parse(input); const offset = decodeCursor(parsed.cursor); const data = await listPortfolios(drizzlePortfolioRepository, { limit: offset + parsed.limit }); const rows = data.portfolios.slice(offset, offset + parsed.limit); return { result: result("Portfolio ro'yxati tayyor.", { portfolios: rows, total: data.total }, null, null, offset + rows.length < data.total ? encodeCursor(offset + rows.length) : null), title: "Portfolio" }; } catch (error) { return toolError(error, "Portfolio"); } }, true, cursorShape),
  { ...simple("portfolio_update", "Portfolio yangilash", "Portfolio maydonlarini yangilaydi; max 3 ta asosiy loyihaga qat'iyat qo'llanadi.", async (input, context) => { try { const parsed = z.object({ id: z.string().min(1), patch: portfolioUpdateSchema }).parse(input); const data = await updatePortfolio(drizzlePortfolioRepository, parsed.id, parsed.patch, { userId: context.principal.userId }); return { result: result("Portfolio yangilandi.", { id: data.id, title: data.title, status: data.status, isFeatured: data.isFeatured }), title: "Portfolio yangilandi" }; } catch (error) { return toolError(error, "Portfolio yangilandi"); } }, false), inputShape: { id: z.string().min(1), patch: portfolioUpdateSchema } },
  simple("site_settings_get", "Sayt sozlamalari", "Ommaviy sayt va chat sozlamalari; kalitlar yoki maxfiy integratsiyalar qaytarilmaydi.", async () => { try { const [rows, chat] = await Promise.all([db.select({ key: siteSettings.key, value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "site")), getChatSettings()]); return { result: result("Sayt sozlamalari tayyor.", { publicSettings: rows, chat: publicChatSettings(chat) }), title: "Sayt sozlamalari" }; } catch (error) { return toolError(error, "Sayt sozlamalari"); } }),
];
