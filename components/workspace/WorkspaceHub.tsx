"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FiUsers, FiFolder, FiActivity, FiSettings, FiPlus, FiMail, FiClock,
  FiRotateCcw, FiMessageCircle, FiPieChart, FiTrash2, FiUserX, FiUserCheck, FiSend,
} from "react-icons/fi";

/* Workspace hub — collaborative UI over /api/v1/workspaces. One client shell:
   switcher · dashboard · members/invites · projects+versions+comments · activity · settings. */

type Json = Record<string, unknown>;
const api = async (url: string, init?: RequestInit): Promise<Json | null> => {
  try {
    const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
    const j = await r.json();
    return r.ok && j.ok ? (j.data as Json) : null;
  } catch { return null; }
};

const TABS = [
  { id: "overview", label: "Overview", icon: <FiPieChart size={14} /> },
  { id: "members", label: "Members", icon: <FiUsers size={14} /> },
  { id: "projects", label: "Projects", icon: <FiFolder size={14} /> },
  { id: "activity", label: "Activity", icon: <FiActivity size={14} /> },
  { id: "settings", label: "Settings", icon: <FiSettings size={14} /> },
] as const;

const ROLES = ["admin", "manager", "editor", "viewer"];
const fmtWhen = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function WorkspaceHub() {
  const [wsList, setWsList] = useState<Json[]>([]);
  const [invites, setInvites] = useState<Json[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [dash, setDash] = useState<Json | null>(null);
  const [members, setMembers] = useState<Json[]>([]);
  const [pendingInv, setPendingInv] = useState<Json[]>([]);
  const [projects, setProjects] = useState<Json[]>([]);
  const [activity, setActivity] = useState<Json[]>([]);
  const [comments, setComments] = useState<Json[]>([]);
  const [openProject, setOpenProject] = useState<Json | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const loadRoot = useCallback(async () => {
    const d = await api("/api/v1/workspaces");
    if (!d) { setAuthed(false); return; }
    setAuthed(true);
    setWsList((d.workspaces as Json[]) || []);
    setInvites((d.invites as Json[]) || []);
    if (!current && (d.workspaces as Json[])?.length) setCurrent(String((d.workspaces as Json[])[0].id));
  }, [current]);

  const loadWs = useCallback(async (id: string) => {
    const [d, m, i, p, a] = await Promise.all([
      api(`/api/v1/workspaces/${id}`),
      api(`/api/v1/workspaces/${id}/members`),
      api(`/api/v1/workspaces/${id}/invites`),
      api(`/api/v1/workspaces/${id}/projects`),
      api(`/api/v1/workspaces/${id}/activity`),
    ]);
    setDash(d); setMembers((m as unknown as Json[]) || []); setPendingInv((i as unknown as Json[]) || []);
    setProjects(((p?.items as Json[]) || [])); setActivity(((a?.items as Json[]) || []));
  }, []);

  useEffect(() => { loadRoot(); }, [loadRoot]);
  useEffect(() => { if (current) loadWs(current); }, [current, loadWs]);

  const mutate = useCallback(async (path: string, init?: RequestInit) => {
    await api(path, init);
    if (current) loadWs(current);
    loadRoot();
  }, [current, loadWs, loadRoot]);

  if (authed === false) {
    return (
      <main className="max-w-md mx-auto px-5 py-24 text-center">
        <div className="qx-card p-8">
          <FiUsers size={22} className="mx-auto mb-3" style={{ color: "var(--primary-bright)" }} />
          <h1 className="font-display text-xl font-extrabold" style={{ color: "var(--text)" }}>Workspaces</h1>
          <p className="text-sm mt-2 mb-5" style={{ color: "var(--text-muted)" }}>Sign in to collaborate with your team.</p>
          <a href="/login" className="qx-btn inline-flex">Sign in</a>
        </div>
      </main>
    );
  }

  const ws = wsList.find((w) => w.id === current);
  const counts = (dash?.counts as Json) || {};
  const credit = (dash?.creditUsage as Json) || {};
  const storage = (dash?.storageUsage as Json) || {};

  return (
    <main className="max-w-6xl mx-auto px-5 py-10">
      {/* Switcher + create */}
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <h1 className="font-display text-2xl font-extrabold" style={{ color: "var(--text)" }}>Workspace</h1>
        <select value={current || ""} onChange={(e) => setCurrent(e.target.value)}
          className="px-3 py-2 rounded-xl text-[13px] font-semibold outline-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
          {wsList.map((w) => <option key={String(w.id)} value={String(w.id)}>{String(w.name)} · {String(w.kind)}</option>)}
        </select>
        <button onClick={async () => {
          const name = prompt("Workspace name?");
          if (name) { await api("/api/v1/workspaces", { method: "POST", body: JSON.stringify({ name, kind: "team" }) }); loadRoot(); }
        }} className="qx-btn-ghost !py-2 !px-3 text-[12px] font-bold inline-flex items-center gap-1.5"><FiPlus size={13} /> New</button>
        <span className="flex-1" />
        {ws && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase" style={{ background: "var(--surface-hover)", color: "var(--text-muted)" }}>{String(ws.role)}</span>}
      </div>

      {/* Pending invites for me */}
      {invites.length > 0 && (
        <div className="qx-card p-4 mb-5" style={{ borderColor: "var(--primary)" }}>
          <p className="text-[12px] font-bold mb-2" style={{ color: "var(--text)" }}>Pending invitations</p>
          {invites.map((i) => (
            <div key={String(i.id)} className="flex items-center gap-3 py-1.5 text-[13px]" style={{ color: "var(--text-muted)" }}>
              <FiMail size={13} /> <b style={{ color: "var(--text)" }}>{String(i.workspace)}</b> as {String(i.role)}
              <span className="flex-1" />
              <button className="text-[11px] font-bold" style={{ color: "#22c55e" }}
                onClick={() => mutate("/api/v1/workspaces", { method: "POST", body: JSON.stringify({ inviteToken: i.token, accept: true }) })}>Accept</button>
              <button className="text-[11px] font-bold" style={{ color: "#f87171" }}
                onClick={() => mutate("/api/v1/workspaces", { method: "POST", body: JSON.stringify({ inviteToken: i.token, accept: false }) })}>Reject</button>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition-colors"
            style={tab === t.id ? { background: "var(--grad-primary)", color: "#0b0b0b" } : { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && dash && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              ["Members", String(counts.members ?? 0)],
              ["Projects", String(counts.projects ?? 0)],
              ["Credits spent", String(credit.spent ?? 0)],
              ["Storage", `${((Number(storage.bytes) || 0) / 1e6).toFixed(1)} MB / ${storage.quotaMb} MB`],
            ].map(([l, v]) => (
              <div key={l} className="qx-card p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{l}</p>
                <p className="font-display text-xl font-extrabold mt-1" style={{ color: "var(--text)" }}>{v}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="qx-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Most used tools</p>
              {((dash.topTools as Json[]) || []).map((t) => (
                <div key={String(t.tool)} className="flex justify-between py-1.5 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text)" }}>{String(t.tool)}</span><span style={{ color: "var(--text-muted)" }}>{String(t.count)}</span>
                </div>
              ))}
              {!((dash.topTools as Json[]) || []).length && <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>No tool usage yet.</p>}
            </div>
            <div className="qx-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Member activity</p>
              {((dash.memberActivity as Json[]) || []).map((m) => (
                <div key={String(m.email)} className="flex justify-between py-1.5 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="truncate" style={{ color: "var(--text)" }}>{String(m.email)}</span>
                  <span style={{ color: "var(--text-muted)" }}>{String(m.actions)} actions</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "members" && current && (
        <div className="grid md:grid-cols-[1fr_300px] gap-3 items-start">
          <div className="qx-card overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Member", "Role", "Status", ""].map((h) => <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase" style={{ color: "var(--text-faint)" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={String(m.id)} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-4 py-2.5" style={{ color: "var(--text)" }}>{String(m.email)}</td>
                    <td className="px-4 py-2.5">
                      {m.role === "owner" ? <b style={{ color: "var(--primary-bright)" }}>owner</b> : (
                        <select value={String(m.role)} onChange={(e) => mutate(`/api/v1/workspaces/${current}/members`, { method: "POST", body: JSON.stringify({ memberId: m.id, role: e.target.value }) })}
                          className="px-2 py-1 rounded-lg text-[12px]" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                          {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: m.status === "active" ? "#22c55e" : "#fbbf24" }}>{String(m.status)}</td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      {m.role !== "owner" && (
                        <>
                          <button title={m.status === "active" ? "Suspend" : "Restore"} className="p-1.5" style={{ color: "var(--text-muted)" }}
                            onClick={() => mutate(`/api/v1/workspaces/${current}/members`, { method: "POST", body: JSON.stringify({ memberId: m.id, status: m.status === "active" ? "suspended" : "active" }) })}>
                            {m.status === "active" ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                          </button>
                          <button title="Remove" className="p-1.5" style={{ color: "#f87171" }}
                            onClick={() => confirm("Remove member?") && mutate(`/api/v1/workspaces/${current}/members?id=${m.id}`, { method: "DELETE" })}>
                            <FiTrash2 size={14} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="qx-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Invite member</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              const email = (f.elements.namedItem("em") as HTMLInputElement).value.trim();
              const role = (f.elements.namedItem("rl") as HTMLSelectElement).value;
              if (email) { mutate(`/api/v1/workspaces/${current}/invites`, { method: "POST", body: JSON.stringify({ email, role }) }); f.reset(); }
            }} className="space-y-2">
              <input name="em" type="email" required placeholder="teammate@email.com" className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
              <select name="rl" defaultValue="editor" className="w-full px-3 py-2.5 rounded-xl text-[13px]" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
              <button className="qx-btn w-full !py-2.5 text-[13px] font-bold inline-flex items-center justify-center gap-2"><FiSend size={13} /> Send invite</button>
            </form>
            {pendingInv.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-5 mb-2" style={{ color: "var(--text-faint)" }}>Pending</p>
                {pendingInv.map((i) => (
                  <div key={String(i.id)} className="flex items-center justify-between py-1 text-[12px]" style={{ color: "var(--text-muted)" }}>
                    <span className="truncate">{String(i.email)} · {String(i.role)}</span>
                    <button style={{ color: "#f87171" }} onClick={() => mutate(`/api/v1/workspaces/${current}/invites?id=${i.id}`, { method: "DELETE" })}><FiTrash2 size={12} /></button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "projects" && current && (
        <div className="grid md:grid-cols-[1fr_340px] gap-3 items-start">
          <div>
            <button onClick={async () => {
              const name = prompt("Project name?");
              if (name) mutate(`/api/v1/workspaces/${current}/projects`, { method: "POST", body: JSON.stringify({ name, kind: "qr", data: { v: 1 } }) });
            }} className="qx-btn-ghost !py-2 !px-3 text-[12px] font-bold mb-3 inline-flex items-center gap-1.5"><FiPlus size={13} /> New project</button>
            {projects.map((p) => (
              <button key={String(p.id)} onClick={() => { setOpenProject(p); api(`/api/v1/workspaces/${current}/comments?project=${p.id}`).then((c) => setComments((c as unknown as Json[]) || [])); }}
                className="w-full text-left qx-card p-4 mb-2">
                <div className="flex items-center gap-2">
                  <FiFolder size={14} style={{ color: "var(--primary-bright)" }} />
                  <b className="text-[14px]" style={{ color: "var(--text)" }}>{String(p.name)}</b>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ background: "var(--surface-hover)", color: "var(--text-muted)" }}>{String(p.kind)}</span>
                  <span className="flex-1" />
                  <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>{(p.versions as Json[])?.length ?? 0} versions</span>
                </div>
              </button>
            ))}
            {!projects.length && <p className="text-[13px] py-8 text-center" style={{ color: "var(--text-muted)" }}>No shared projects yet.</p>}
          </div>
          {openProject && (
            <div className="qx-card p-5">
              <p className="font-bold text-[14px] mb-3" style={{ color: "var(--text)" }}>{String(openProject.name)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Version history</p>
              {((openProject.versions as Json[]) || []).map((v) => (
                <div key={String(v.v)} className="flex items-center gap-2 py-1.5 text-[12px]" style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <FiClock size={11} /> v{String(v.v)} · {String(v.note || "update")} · {fmtWhen(String(v.at))}
                  <span className="flex-1" />
                  <button title="Restore this version" style={{ color: "var(--primary-bright)" }}
                    onClick={() => mutate(`/api/v1/workspaces/${current}/projects`, { method: "POST", body: JSON.stringify({ id: openProject.id, restoreVersion: v.v }) })}>
                    <FiRotateCcw size={12} />
                  </button>
                </div>
              ))}
              <p className="text-[10px] font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: "var(--text-faint)" }}>Comments</p>
              {comments.filter((c) => c.projectId === openProject.id).map((c) => (
                <div key={String(c.id)} className="py-1.5 text-[12.5px]" style={{ borderBottom: "1px solid var(--border)" }}>
                  <p style={{ color: "var(--text)" }}>{String(c.body)}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>{fmtWhen(String(c.createdAt))}</p>
                </div>
              ))}
              <form className="flex gap-2 mt-3" onSubmit={(e) => {
                e.preventDefault();
                const inp = e.currentTarget.elements.namedItem("cm") as HTMLInputElement;
                if (inp.value.trim()) {
                  api(`/api/v1/workspaces/${current}/comments`, { method: "POST", body: JSON.stringify({ projectId: openProject.id, body: inp.value }) })
                    .then(() => api(`/api/v1/workspaces/${current}/comments?project=${openProject.id}`)).then((c) => setComments((c as unknown as Json[]) || []));
                  inp.value = "";
                }
              }}>
                <input name="cm" placeholder="Comment… use @email to mention" className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
                <button className="qx-btn !py-2 !px-3 text-[12px]"><FiMessageCircle size={13} /></button>
              </form>
            </div>
          )}
        </div>
      )}

      {tab === "activity" && (
        <div className="qx-card p-5">
          {activity.map((a) => (
            <div key={String(a.id)} className="flex items-center gap-3 py-2 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
              <FiActivity size={13} style={{ color: "var(--primary-bright)" }} />
              <span style={{ color: "var(--text)" }}>{String(a.action)}</span>
              {!!a.target && <span style={{ color: "var(--text-muted)" }}>· {String(a.target)}</span>}
              <span className="flex-1" />
              <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>{fmtWhen(String(a.createdAt))}</span>
            </div>
          ))}
          {!activity.length && <p className="text-[13px] py-6 text-center" style={{ color: "var(--text-muted)" }}>No activity yet.</p>}
        </div>
      )}

      {tab === "settings" && current && ws && (
        <div className="qx-card p-6 max-w-lg">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Workspace settings</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            mutate(`/api/v1/workspaces/${current}`, { method: "PUT", body: JSON.stringify({
              name: (f.elements.namedItem("nm") as HTMLInputElement).value,
              brandColor: (f.elements.namedItem("bc") as HTMLInputElement).value,
            }) });
          }} className="space-y-3">
            <label className="block text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Name
              <input name="nm" defaultValue={String(ws.name)} className="w-full mt-1 px-3 py-2.5 rounded-xl text-[13px] outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </label>
            <label className="block text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Brand color
              <input name="bc" type="color" defaultValue={String(ws.brandColor || "#e1ff04")} className="w-full mt-1 h-10 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }} />
            </label>
            <button className="qx-btn !py-2.5 text-[13px] font-bold w-full">Save settings</button>
          </form>
        </div>
      )}
    </main>
  );
}
