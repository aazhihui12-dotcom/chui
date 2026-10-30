"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { CmsUser } from "@/lib/cms/store";
import { api } from "./api-client";
export function UsersPanel() {
  const [users, setUsers] = useState<CmsUser[]>([]),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [reset, setReset] = useState("");
  const refresh = () =>
    api<{ users: CmsUser[] }>("users").then((r) => setUsers(r.users));
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      data = new FormData(form);
    setBusy(true);
    setError("");
    try {
      await api("users", "POST", Object.fromEntries(data));
      form.reset();
      await refresh();
      setMessage("账号已创建，首次登录需要修改密码。");
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    } finally {
      setBusy(false);
    }
  }
  async function change(id: string, data: unknown) {
    setError("");
    setMessage("");
    try {
      await api(`users/${id}`, "PATCH", data);
      setReset("");
      await refresh();
      setMessage("账号已更新，原有会话已撤销。");
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失败");
    }
  }
  return (
    <section>
      <div className="cms-section-heading">
        <div>
          <p className="cms-eyebrow">TEAM ACCESS</p>
          <h2>账号管理</h2>
        </div>
      </div>
      {error && (
        <p className="cms-alert" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="cms-success" role="status">
          {message}
        </p>
      )}
      <form className="cms-card cms-account-form" onSubmit={create}>
        <h3>创建账号</h3>
        <label>
          新账号
          <input
            name="username"
            required
            minLength={3}
            maxLength={60}
            autoComplete="off"
          />
        </label>
        <label>
          初始密码
          <input
            name="password"
            type="password"
            minLength={12}
            maxLength={128}
            required
            autoComplete="new-password"
          />
        </label>
        <label>
          角色
          <select name="role">
            <option value="editor">运营人员</option>
            <option value="admin">管理员</option>
          </select>
        </label>
        <button className="cms-primary" disabled={busy}>
          创建账号
        </button>
      </form>
      <div className="cms-card cms-table-wrap">
        <table>
          <thead>
            <tr>
              <th>账号</th>
              <th>角色</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.role === "admin" ? "管理员" : "运营"}</td>
                <td>{u.active ? "有效" : "已停用"}</td>
                <td>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `确认${u.active ? "停用" : "启用"}账号 ${u.username}？`,
                        )
                      )
                        void change(u.id, { active: !u.active });
                    }}
                  >
                    {u.active ? "停用" : "启用"}
                  </button>
                  <button onClick={() => setReset(reset === u.id ? "" : u.id)}>
                    重置密码
                  </button>
                  {reset === u.id && (
                    <form
                      className="cms-reset"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void change(u.id, {
                          password: new FormData(e.currentTarget).get(
                            "password",
                          ),
                        });
                      }}
                    >
                      <input
                        name="password"
                        type="password"
                        minLength={12}
                        maxLength={128}
                        placeholder="新临时密码，至少 12 位"
                        aria-label="新临时密码"
                        required
                      />
                      <button>确认重置</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
