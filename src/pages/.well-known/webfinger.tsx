import { GetServerSideProps } from "next";
import { prisma } from "../../server/db";

export default () => {};

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
      query.resource.endsWith(`@${req.headers.host}`)
    )
  ) {
    return { notFound: true };
  }
  const name = query.resource
    .replace("acct:", "") // startsWithされてるので必ず先頭にある
    .split("@")[0]; // endsWithされてるので必ず1文字以上ある
  const user = await prisma.user.findFirst({
    where: { name },
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
          href: `https://${req.headers.host}/@${name}`,
        },
      ],
    })
  );
  res.end();
  return { props: {} };
};
