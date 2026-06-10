import { cookies } from "next/headers";

/** Cookie de session anonyme du diagnostic (httpOnly, signé côté navigateur). */
export const SESSION_COOKIE = "tp_session";

/** Token de session courant, ou undefined si absent. */
export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
