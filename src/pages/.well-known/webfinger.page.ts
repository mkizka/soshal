import { GetServerSideProps } from "next";
import { env } from "../../utils/env";
import { prisma } from "../../server/db";

const Noop = () => undefined;
export default Noop;

export const getServerSideProps: GetServerSideProps = async ({
  res,
  req,
  query,
}) => {
  if (
    !(
      query.resource &&
      typeof query.resource == "string" &&
      query.resource.startsWith("acct:") &&
      query.resource.endsWith(`@${env.HOST}`)
    )
  ) {
    return { notFound: true };
  }
  const preferredUsername = query.resource
    .replace("acct:", "") // startsWithされてるので必ず先頭にある
    .split("@")[0]; // endsWithされてるので必ず1文字以上ある
  const user = await prisma.user.findFirst({
    where: { preferredUsername },
  });
  if (!user) {
    return { notFound: true };
  }
  res.setHeader("Content-Type", "application/jrd+json");
  res.write(
    JSON.stringify({
      subject: query.resource,
      links: [
        {
          rel: "self",
          type: "application/activity+json",
          href: `https://${env.HOST}/users/${user.id}`,
        },
      ],
    })
  );
  res.end();
  return { props: {} };
};
