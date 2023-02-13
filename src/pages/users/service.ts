import { prisma } from "../../server/db";
import { findOrFetchUserByWebfinger } from "../../utils/findOrFetchUser";

/**
 * userIdは以下のパターンを想定
 * - ${id}                ... DBからidで検索
 * - @${name}             ... DBからnameで検索
 * - @${name}@${env.HOST} ... DBからnameで検索
 * - @${name}@${他サーバー} ... 他サーバーのwebFingerから取得
 */
export const findOrFetchUserById = async (userId: string) => {
  if (userId.startsWith("@")) {
    const [name, host] = userId.split("@").slice(1);
    if (!name) {
      return null;
    }
    return findOrFetchUserByWebfinger(name, host);
  }
  return prisma.user.findFirst({ where: { id: userId } });
};
