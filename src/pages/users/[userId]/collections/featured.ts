import type { GetServerSideProps } from "next";
import { prisma } from "../../../../server/db";
import { activityStreams } from "../../../../utils/activitypub";

// eslint-disable-next-line import/no-anonymous-default-export
export default () => null;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  if (typeof params?.userId != "string") {
    return { notFound: true };
  }
  const user = await prisma.user.findFirst({
    where: {
      id: params.userId,
    },
    include: {
      notes: true,
    },
  });
  if (user == null) {
    return { notFound: true };
  }
  const id = `https:/${req.headers.host}/users/${user.id}/collections/featured`;
  res.setHeader("Content-Type", "application/activity+json");
  res.write(
    JSON.stringify({
      "@context": ["https://www.w3.org/ns/activitystreams"],
      id: id,
      type: "OrderedCollection",
      totalItems: user.notes.length,
      orderedItems: user.notes.map((note) =>
        activityStreams.note(note, req.headers.host || "")
      ),
    })
  );
  res.end();
  return { props: {} };
};
