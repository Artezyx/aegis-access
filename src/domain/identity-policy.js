'use strict';
/** Reglas de dominio independientes del framework: son usadas por la API y sus pruebas. */
function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
function isOwnerOrAdmin(actor, targetField, targetValue) {
  if (!actor) return false;
  if (actor.role === 'admin') return true;
  if (targetField === 'email') return normalizeEmail(actor.email) === normalizeEmail(targetValue);
  return actor.id === targetValue;
}
function redactAccount(account) {
  const { id, name, email, image, role, createdAt, updatedAt } = account;
  return { id, name, email, image: image ?? null, role, createdAt, updatedAt };
}
function safeChanges(changes, actorRole) {
  const copy = { ...changes };
  delete copy.passwordconf;
  delete copy.updatedAt;
  delete copy.emailVerified;
  if (actorRole !== 'admin') delete copy.role;
  return copy;
}
function passwordPolicyErrors(password) {
  const errors = [];
  if (typeof password !== 'string' || password.length < 6 || password.length > 16) errors.push('La contraseña debe tener entre 6 y 16 caracteres');
  if (typeof password !== 'string' || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) errors.push('La contraseña requiere mayúscula, minúscula y número');
  if (typeof password === 'string' && /\s/.test(password)) errors.push('La contraseña no debe incluir espacios');
  return errors;
}
module.exports = { normalizeEmail, isOwnerOrAdmin, redactAccount, safeChanges, passwordPolicyErrors };
