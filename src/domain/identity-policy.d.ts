export type AccountIdentity = { id: string; email: string; role: 'admin' | 'user' };
export type PublicAccount = { id: string; name: string; email: string; image: string | null; role: 'admin' | 'user'; createdAt: Date; updatedAt?: Date };
export function normalizeEmail(value: string): string;
export function isOwnerOrAdmin(actor: AccountIdentity | null | undefined, targetField: 'id' | 'email', targetValue: string): boolean;
export function redactAccount(account: PublicAccount & { passwordHash?: string }): PublicAccount;
export function safeChanges<T extends object>(changes: T, actorRole: 'admin' | 'user'): Partial<T>;
export function passwordPolicyErrors(password: string): string[];
