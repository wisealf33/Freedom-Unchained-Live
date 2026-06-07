import app from "../../projects/founders-circle/server.js";

export default function handler(request, response) {
  request.url = request.url.replace(/^\/api\/founders/, "") || "/";
  return app(request, response);
}
