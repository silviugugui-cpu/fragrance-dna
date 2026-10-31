import {
  createStudioUserAction,
  deleteStudioUserAction,
  resetStudioUserPasswordAction,
} from "@/app/studio/_actions/studioUserActions";
import { listManagedUsers } from "@/lib/auth/serverUserStore";
import { UserProfileInspector } from "@/app/studio/users/UserProfileInspector";

export const dynamic = "force-dynamic";

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const hour = String(parsed.getUTCHours()).padStart(2, "0");
  const minute = String(parsed.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute} UTC`;
};

export default async function StudioUsersPage() {
  try {
    const users = await listManagedUsers();
    const emailUsers = users.filter((user) => user.provider === "email" && !user.isAdmin);

    return (
      <section className="space-y-4 overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <header className="rounded border border-zinc-800 bg-zinc-900/55 p-4">
          <h1 className="text-xl font-semibold text-amber-100">User Administration</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage platform accounts with a minimal workflow: create, reset password, remove.
          </p>
        </header>

        <article className="rounded border border-zinc-800 bg-zinc-900/55 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Create Email User</h2>
          <form action={createStudioUserAction} className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
            <input
              type="text"
              name="name"
              required
              placeholder="Full name"
              className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none"
            />
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20"
            >
              Create User
            </button>
          </form>
        </article>

        <article className="rounded border border-zinc-800 bg-zinc-900/55 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Reset Email User Password</h2>
          <form action={resetStudioUserPasswordAction} className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            <select
              name="userId"
              required
              defaultValue=""
              className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
            >
              <option value="" disabled>
                Select user
              </option>
              {emailUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              placeholder="New password"
              className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
            >
              Reset Password
            </button>
          </form>
        </article>

        <article className="rounded border border-zinc-800 bg-zinc-900/55 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">All Users</h2>
          <div className="mt-3 overflow-auto">
            <table className="w-full min-w-[860px] border-collapse text-xs text-zinc-300">
              <thead className="bg-zinc-950/90 text-zinc-400">
                <tr>
                  <th className="border-b border-zinc-800 px-2 py-2 text-left">Name</th>
                  <th className="border-b border-zinc-800 px-2 py-2 text-left">Identifier</th>
                  <th className="border-b border-zinc-800 px-2 py-2 text-left">Provider</th>
                  <th className="border-b border-zinc-800 px-2 py-2 text-left">Created</th>
                  <th className="border-b border-zinc-800 px-2 py-2 text-left">Type</th>
                  <th className="border-b border-zinc-800 px-2 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-900/80">
                    <td className="px-2 py-2">{user.name}</td>
                    <td className="px-2 py-2">{user.email}</td>
                    <td className="px-2 py-2 uppercase">{user.provider}</td>
                    <td className="px-2 py-2">{formatDate(user.createdAt)}</td>
                    <td className="px-2 py-2">{user.isAdmin ? "Admin" : "Standard"}</td>
                    <td className="px-2 py-2">
                      {user.isAdmin ? (
                        <span className="text-zinc-500">Protected</span>
                      ) : (
                        <form action={deleteStudioUserAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button
                            type="submit"
                            className="rounded border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-rose-200 hover:bg-rose-500/20"
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <UserProfileInspector users={users.map((user) => ({ id: user.id, name: user.name, email: user.email }))} />
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error while loading users.";

    return (
      <section className="space-y-4 overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <article className="rounded-lg border border-rose-300/25 bg-rose-950/20 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-rose-200">Load Error</p>
          <p className="mt-1 text-sm text-rose-100">{message}</p>
        </article>
      </section>
    );
  }
}
