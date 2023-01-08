import type { GetServerSideProps } from "next";
import { prisma } from "../../server/db";
import { activityStreams } from "../../utils/activitypub";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const User = (props: any) => {
  return (
    <pre>
      <code>{props.user}</code>
    </pre>
  );
};

export default User;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  if (typeof params?.userId != "string") {
    return { notFound: true };
  }
  // /@${userName} と /users/${userId} を受け入れるため
  const where = params.userId.startsWith("@")
    ? { name: params.userId.slice(1) }
    : { id: params.userId };
  const user = await prisma.user.findFirst({ where });
  if (user == null) {
    return { notFound: true };
  }
  if (req.headers.accept?.includes("application/activity+json")) {
    res.setHeader("Content-Type", "application/activity+json");
    // TODO: hostを環境変数で受け取る
    res.write(
      JSON.stringify(activityStreams.user(user, req.headers.host || ""))
    );
    res.end();
  }
  return {
    props: {
      user: JSON.stringify(user, null, 2),
    },
  };
};
