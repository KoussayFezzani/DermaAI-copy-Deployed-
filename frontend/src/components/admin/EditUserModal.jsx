import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal dialog for editing a user's details.
 */
const EditUserModal = ({ user, editForm, setEditForm, onSave, onClose }) => {
    if (!user) return null;

    const fields = [
        { label: 'Username', key: 'username', type: 'text', ph: 'Enter username' },
        { label: 'Email', key: 'email', type: 'email', ph: 'Enter email' },
        { label: 'New Password', key: 'password', type: 'password', ph: 'Leave blank to keep current' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl" style={{ background: 'var(--card-bg, #b1b7c5ff)', opacity: 1 }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                    <div>
                        <p className="font-bold text-[var(--text)]">Edit User</p>
                        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors border-none bg-transparent">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={onSave} className="p-5 space-y-4">
                    {fields.map(f => (
                        <div key={f.key} className="space-y-1">
                            <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest font-mono">{f.label}</label>
                            <input
                                type={f.type}
                                value={editForm[f.key]}
                                onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                                placeholder={f.ph}
                                className="!mb-0 !py-2.5 !text-sm !bg-[var(--bg)] !border-[var(--border)] !text-[var(--text)] !rounded-xl"
                            />
                        </div>
                    ))}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors bg-transparent">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-primary text-[var(--bg)] text-sm font-bold transition-all border-none hover:opacity-90">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
