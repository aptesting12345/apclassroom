export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith("/activities/")) return Response.redirect(`${url.origin}/`, 302);
  return context.next();
}
