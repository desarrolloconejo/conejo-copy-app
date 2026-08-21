/**
 * Creates or repairs an administrator account from the command line.
 *
 * Registration is closed inside the app, so this is how the first admin comes
 * into being — and how access is recovered if the last admin password is lost.
 * Running it inside the container keeps the credentials out of the server's
 * stored environment.
 *
 *   node dist/admin.js <email> <nombre>              contraseña generada
 *   node dist/admin.js <email> <nombre> --password X contraseña fija
 *
 * Without --password it prints a generated one once and flags the account to
 * change it on first sign-in. With --password the account is ready to use, so
 * keep that form for local development: the value lands in the shell history.
 */
import "dotenv/config";
import { generateTemporaryPassword, hashPassword } from "./auth/password";
import { createUser, getUserByEmail, setUserActive, setUserPassword } from "./db";
import { assertEnv } from "./_core/env";

const MIN_PASSWORD_LENGTH = 10;
const USAGE = "Uso: node dist/admin.js <email> <nombre> [--password <contraseña>]";

function parseArgs(argv: string[]) {
  const rest: string[] = [];
  let password: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--password" || argv[i] === "-p") {
      password = argv[i + 1];
      i += 1;
      continue;
    }
    rest.push(argv[i]);
  }

  const [email, ...nameParts] = rest;
  return { email, name: nameParts.join(" ").trim(), password };
}

async function main() {
  assertEnv();

  const { email, name, password } = parseArgs(process.argv.slice(2));

  if (!email || !name) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error(`"${email}" no parece un email válido.`);
    process.exitCode = 1;
    return;
  }
  if (password !== undefined && password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `La contraseña necesita al menos ${MIN_PASSWORD_LENGTH} caracteres. ${USAGE}`
    );
    process.exitCode = 1;
    return;
  }

  // A chosen password is taken as final; a generated one has to be replaced.
  const chosen = password ?? generateTemporaryPassword();
  const mustChange = password === undefined;
  const passwordHash = await hashPassword(chosen);
  const existing = await getUserByEmail(email);

  if (existing) {
    await setUserPassword(existing.id, passwordHash, mustChange);
    if (!existing.isActive) await setUserActive(existing.id, true);
    console.log(`Cuenta existente actualizada: ${existing.email} (id ${existing.id})`);
    if (existing.role !== "admin") {
      console.log(
        `Aviso: su rol sigue siendo "${existing.role}". Cámbialo desde el panel de usuarios.`
      );
    }
  } else {
    const created = await createUser({
      email,
      name,
      role: "admin",
      passwordHash,
      mustChangePassword: mustChange,
    });
    console.log(`Administrador creado: ${created?.email} (id ${created?.id})`);
  }

  if (mustChange) {
    console.log(`\nContraseña temporal: ${chosen}`);
    console.log("Se pedirá cambiarla en el primer acceso. No queda guardada en claro.");
  } else {
    console.log(`\nContraseña fijada. La cuenta ya puede entrar sin pasos intermedios.`);
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch(error => {
    console.error("No se pudo completar el alta:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
