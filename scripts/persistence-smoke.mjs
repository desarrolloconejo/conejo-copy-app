import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for the persistence smoke test.");

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const stamp = `qa-${Date.now()}`;

try {
  await connection.beginTransaction();
  const [users] = await connection.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
  if (!users[0]?.id) throw new Error("No authenticated owner exists for the reversible persistence test.");
  const ownerId = users[0].id;

  const [clientResult] = await connection.query(
    "INSERT INTO clients (ownerId, name, sector) VALUES (?, ?, ?)",
    [ownerId, `${stamp}-cliente`, "QA"],
  );
  const clientId = clientResult.insertId;

  await connection.query(
    "INSERT INTO auditRules (ownerId, clientId, label, maxSpokenWords, maxOverlayWords, requireProof, preambles, tiredPhrases, tensionTerms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [ownerId, clientId, `${stamp}-regla`, 11, 5, true, "hola", "secreto", "cambia"],
  );

  const [copyResult] = await connection.query(
    "INSERT INTO copyRecords (ownerId, clientId, objective, platform, audience, tension, spoken, overlay, proof, firstFrame, cta, auditScore, primaryMetric, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [ownerId, clientId, "Guardados", "Instagram Reels", "Audiencia QA", "Tensión QA", "Hook QA con prueba", "Hook QA", "Prueba QA", "Fotograma QA", "Guardar", 82, "Guardados / reproducciones", "draft"],
  );
  const copyRecordId = copyResult.insertId;

  await connection.query(
    "INSERT INTO copyResults (copyRecordId, impressions, threeSecondViews, saves, shares, clicks, conversions, learning) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [copyRecordId, 1000, 650, 80, 20, 14, 3, "La prueba QA confirma la relación ficha-resultado."],
  );
  await connection.query("UPDATE copyRecords SET status = 'analyzed' WHERE id = ?", [copyRecordId]);

  const [rows] = await connection.query(
    "SELECT c.name AS clientName, r.label AS ruleLabel, cp.status, cr.impressions, cr.threeSecondViews FROM clients c INNER JOIN auditRules r ON r.clientId = c.id INNER JOIN copyRecords cp ON cp.clientId = c.id INNER JOIN copyResults cr ON cr.copyRecordId = cp.id WHERE c.id = ?",
    [clientId],
  );
  const row = rows[0];
  if (row?.clientName !== `${stamp}-cliente` || row?.ruleLabel !== `${stamp}-regla` || row?.status !== "analyzed" || Number(row?.impressions) !== 1000 || Number(row?.threeSecondViews) !== 650) {
    throw new Error("The persistence flow did not return the expected client, rule, record, and result data.");
  }

  await connection.rollback();
  console.log("Persistence smoke test passed: client, rule, copy record and real result were linked and rolled back safely.");
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
