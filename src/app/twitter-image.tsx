import OpengraphImage, { size, contentType, alt } from "./opengraph-image";

// Route segment config must be declared literally (Next can't read re-exports).
export const runtime = "edge";
export { size, contentType, alt };
export default OpengraphImage;
