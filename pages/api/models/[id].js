const storage = require("../../../lib/api-storage");
const { normalizeModel } = require("../../../lib/api-utils/helpers");
const { verifyAdmin } = require("../../../lib/api-middleware/auth");

function sameId(a, b) {
  return String(a) === String(b);
}

module.exports = async function handler(req, res) {
  const { id } = req.query;
  if (req.method === "GET") {
    const models = await storage.getModels();
    const model = models.find((m) => sameId(m.id, id));
    if (!model) return res.status(404).json({ error: "Model not found" });
    return res.json(model);
  }

  if (req.method === "PUT") {
    return verifyAdmin(req, res, async () => {
      const models = await storage.getModels();
      const idx = models.findIndex((m) => sameId(m.id, id));
      if (idx === -1) return res.status(404).json({ error: "Model not found" });
      const next = normalizeModel({ ...models[idx], ...req.body, id: models[idx].id });
      models[idx] = next;
      await storage.saveModels(models);
      return res.json(next);
    });
  }

  if (req.method === "DELETE") {
    return verifyAdmin(req, res, async () => {
      const models = await storage.getModels();
      const model = models.find((m) => sameId(m.id, id));
      if (!model)
        return res.status(404).json({ error: "Model not found" });

      // Prefer direct deletion to support Postgres storage correctly.
      if (typeof storage.deleteModel === "function") {
        await storage.deleteModel(model.id);
      } else {
        const filtered = models.filter((m) => !sameId(m.id, id));
        await storage.saveModels(filtered);
      }

      return res.json({ ok: true });
    });
  }

  res.setHeader("Allow", "GET,PUT,DELETE");
  res.status(405).end("Method Not Allowed");
};
