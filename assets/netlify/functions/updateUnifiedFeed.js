/* testing */
export const config = {
  schedule: "0 */3 * * *", // every 3 hours
};

export default async () => {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
};
