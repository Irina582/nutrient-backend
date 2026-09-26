// Singleton-функция для получения текущего создателя.
// В ЛР3 пользователь всегда один и тот же (id=1).
// В ЛР4 здесь будет извлечение пользователя из сессии/JWT.

export const CURRENT_CREATOR_ID = 1;

export function getCurrentCreatorId(): number {
  return CURRENT_CREATOR_ID;
}