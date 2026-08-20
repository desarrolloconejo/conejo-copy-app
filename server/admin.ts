/**
 * Creates or repairs an administrator account from the command line.
 *
 * Registration is closed inside the app, so this is how the first admin comes
 * into being — and how access is recovered if the last admin password is lost.
 * Running it inside the container keeps the credentials out of the server's
 * stored environment.
 *
 *   node dist/admin.js <email> <nombre>
 *
 * Prints a generated temporary password once. The account is flagged to change
 * it on first sign-in.
 */
import "dotenv/config";
import { generateTemporaryPassword, hashPassword } from "./auth/password";
import { createUser, getUserByEmail, setUserActive, setUserPassword } from "./db";
import { assertEnv } from "./_core/env";

async function main() {
  assertEnv();

  const [email, ...nameParts] = process.argv.slice(2);
  const name = nameParts.join(" ").trim();

  if (!email || !name) {
    console.error("Uso: node dist/admin.js <email> <nombre>");
    process.exitCode = 1;
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error(`"${email}" no parece un email válido.`);
    process.exitCode = 1;
    return;
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const existing = await getUserByEmail(email);

  if (existing) {
    await setUserPassword(existing.id, passwordHash, true);
    if (!existing.isActive) await setUserActive(existing.id, true);
    console.log(`Cuenta existente actualizada: ${existing.email} (id ${existing.id})`);
    if (existing.role !== "admin") {
      console.log(`Aviso: su rol sigue siendo "${existing.role}". Cámbialo desde el panel de usuarios.`);
    }
  } else {
    const created = await createUser({
      email,
      name,
      role: "admin",
      passwordHash,
      mustChangePassword: true,
    });
    console.log(`Administrador creado: ${created?.email} (id ${created?.id})`);
  }

  console.log(`\nContraseña temporal: ${temporaryPassword}`);
  console.log("Se pedirá cambiarla en el primer acceso. No queda guardada en claro.");
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch(error => {
    console.error("No se pudo completar el alta:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
