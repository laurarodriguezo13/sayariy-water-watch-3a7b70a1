import { createServerFn } from "@tanstack/react-start";
import { getFieldNews } from "./news.server";

export const getFieldNewsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const items = await getFieldNews();
    return { items, error: null as string | null };
  } catch (e) {
    console.error("getFieldNewsFn failed:", e);
    return {
      items: [],
      error: e instanceof Error ? e.message : "Error desconocido",
    };
  }
});
