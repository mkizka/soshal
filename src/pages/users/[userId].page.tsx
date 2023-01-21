import type { GetServerSideProps } from "next";
import { activityStreams } from "../../utils/activitypub";
import { findOrFetchUserById } from "./service";

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
  const user = await findOrFetchUserById(params.userId);
  if (user == null) {
    return { notFound: true };
  }
  if (req.headers.accept?.includes("application/activity+json")) {
    res.setHeader("Content-Type", "application/activity+json");
    // TODO: リモートユーザーの場合はどうする？
    res.write(JSON.stringify(activityStreams.user(user)));
    res.end();
  }
  return {
    props: {
      user: JSON.stringify(user, null, 2),
    },
  };
};
