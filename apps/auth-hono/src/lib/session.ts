// import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";

// export function validateSessionToken(token: string): SessionValidationResult {
//     const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
//     const row = db.queryOne(
//         `
// SELECT session.id, session.user_id, session.expires_at, user.id, user.google_id, user.email, user.name, user.picture FROM session
// INNER JOIN user ON session.user_id = user.id
// WHERE session.id = ?
// `,
//         [sessionId]
//     );

//     if (row === null) {
//         return { session: null, user: null };
//     }
//     const session: Session = {
//         id: row.string(0),
//         userId: row.number(1),
//         expiresAt: new Date(row.number(2) * 1000)
//     };
//     const user: User = {
//         id: row.number(3),
//         googleId: row.string(4),
//         email: row.string(5),
//         name: row.string(6),
//         picture: row.string(7)
//     };
//     if (Date.now() >= session.expiresAt.getTime()) {
//         db.execute("DELETE FROM session WHERE id = ?", [session.id]);
//         return { session: null, user: null };
//     }
//     if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
//         session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
//         db.execute("UPDATE session SET expires_at = ? WHERE session.id = ?", [
//             Math.floor(session.expiresAt.getTime() / 1000),
//             session.id
//         ]);
//     }
//     return { session, user };
// }