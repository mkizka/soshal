import { prisma } from "../../server/db";
import { findOrFetchUserByWebfinger } from "../../utils/findOrFetchUser";

/**
 * userIdは以下のパターンを想定
 * - ${id}                ... DBからidで検索
 * - @${preferredUsername}             ... DBからpreferredUsernameで検索
 * - @${preferredUsername}@${env.HOST} ... DBからpreferredUsernameで検索
 * - @${preferredUsername}@${他サーバー} ... 他サーバーのwebFingerから取得
 */
export const findOrFetchUserById = async (userId: string) => {
  if (userId.startsWith("@")) {
    const [preferredUsername, host] = userId.split("@").slice(1);
    if (!preferredUsername) {
      return null;
    }
    return findOrFetchUserByWebfinger(preferredUsername, host);
  }
  return prisma.user.findFirst({ where: { id: userId } });
};
