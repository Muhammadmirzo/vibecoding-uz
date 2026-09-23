import { describe, expect, it } from "vitest";
import {
  getBotName,
  getTelegramErrorMessage,
  mapTelegramData,
} from "@/features/auth/components/telegram-helpers";

const validRaw = {
  id: 123456789,
  first_name: "Aziz",
  last_name: "Karimov",
  username: "aziz_dev",
  photo_url: "https://t.me/i/userpic/320/aziz.jpg",
  auth_date: 1727000000,
  hash: "abc123hash",
};

describe("mapTelegramData", () => {
  it("maps valid widget payload including optional fields", () => {
    expect(mapTelegramData(validRaw)).toEqual(validRaw);
  });

  it("drops empty optional fields but keeps required ones", () => {
    const mapped = mapTelegramData({
      id: 1,
      first_name: "Laylo",
      auth_date: 1727000000,
      hash: "h",
      username: "",
    });
    expect(mapped).toEqual({ id: 1, first_name: "Laylo", auth_date: 1727000000, hash: "h" });
  });

  it("rejects payloads missing required fields or wrong types", () => {
    expect(mapTelegramData(null)).toBeNull();
    expect(mapTelegramData({})).toBeNull();
    expect(mapTelegramData({ ...validRaw, id: "123" })).toBeNull();
    expect(mapTelegramData({ ...validRaw, id: -5 })).toBeNull();
    expect(mapTelegramData({ ...validRaw, first_name: "  " })).toBeNull();
    expect(mapTelegramData({ ...validRaw, auth_date: 0 })).toBeNull();
    expect(mapTelegramData({ ...validRaw, hash: "" })).toBeNull();
    expect(mapTelegramData([validRaw])).toBeNull();
  });
});

describe("getTelegramErrorMessage", () => {
  it("maps known auth failure statuses to Uzbek messages", () => {
    expect(getTelegramErrorMessage(400)).toContain("noto'g'ri");
    expect(getTelegramErrorMessage(401)).toContain("imzosi");
    expect(getTelegramErrorMessage(410)).toContain("muddati");
    expect(getTelegramErrorMessage(429)).toContain("ko'p urinish");
    expect(getTelegramErrorMessage(422)).toContain("hali ulanmagan");
  });

  it("maps server errors and unknown statuses to fallback messages", () => {
    expect(getTelegramErrorMessage(500)).toContain("Server xatosi");
    expect(getTelegramErrorMessage(503)).toContain("Server xatosi");
    expect(getTelegramErrorMessage(418)).toContain("Telegram orqali kirishda xatolik");
  });
});

describe("getBotName", () => {
  it("trims whitespace and strips leading @", () => {
    expect(getBotName({ NEXT_PUBLIC_TELEGRAM_BOT_NAME: "  @my_bot " })).toBe("my_bot");
    expect(getBotName({ NEXT_PUBLIC_TELEGRAM_BOT_NAME: "my_bot" })).toBe("my_bot");
  });

  it("returns null when env var is missing or blank", () => {
    expect(getBotName({})).toBeNull();
    expect(getBotName({ NEXT_PUBLIC_TELEGRAM_BOT_NAME: "   " })).toBeNull();
  });
});
